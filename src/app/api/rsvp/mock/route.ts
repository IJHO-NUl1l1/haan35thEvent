// MOCK 테스트 도구 전용(가짜 참여자 추가 / 전체 초기화). MOCK_TOOLS_ENABLED 가 false 면 배포 환경에서 막힙니다.
import { EVENT, MOCK_TOOLS_ENABLED } from "@/config/event";
import { addMockAttendees, clearResponses, getStats } from "@/lib/rsvp-store";

const forbidden = () => Response.json({ error: "forbidden" }, { status: 403 });
const blocked = !MOCK_TOOLS_ENABLED && process.env.NODE_ENV === "production";

// { count: n } → n명 추가 / { fillToGoal: true } → 현재 목표 인원까지 부족한 만큼 추가
export async function POST(request: Request) {
  if (blocked) return forbidden();
  const body = await request.json().catch(() => null);

  if (body?.fillToGoal) {
    const { attend, goal } = await getStats();
    if (goal > attend) await addMockAttendees(goal - attend);
  } else {
    // 한 번에 최대 목표 인원만큼 (버튼 단위가 목표에 맞춰 커져도 막히지 않게)
    await addMockAttendees(Math.min(Math.max(50, EVENT.goal.value), Math.max(1, Number(body?.count) || 1)));
  }
  return Response.json(await getStats());
}

export async function DELETE() {
  if (blocked) return forbidden();
  await clearResponses();
  return Response.json(await getStats());
}
