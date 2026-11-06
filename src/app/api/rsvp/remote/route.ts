// 운영자 리모컨(/remote) 전용. 행사 중에도 써야 하므로 MOCK_TOOLS_ENABLED 와 상관없이 동작합니다.
import { connection } from "next/server";
import {
  addMockAttendees,
  clearResponses,
  countManualAttendees,
  getStats,
  removeManualAttendees,
  setLocked,
} from "@/lib/rsvp-store";

const MAX_STEP = 1000;

async function snapshot() {
  const [stats, manual] = await Promise.all([getStats(), countManualAttendees()]);
  return Response.json({ ...stats, manual });
}

export async function GET() {
  await connection();
  return snapshot();
}

// { delta: n }       → n 명 추가 (음수면 직접 넣은 인원에서 n 명 빼기)
// { fillToGoal: true } → 목표 인원까지 부족한 만큼 추가
// { removeAll: true }  → 직접 넣은 인원 모두 빼기
// { locked: true/false } → 참여 화면 응답 잠금 / 해제
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (typeof body?.locked === "boolean") {
    await setLocked(body.locked);
  } else if (body?.fillToGoal) {
    const { attend, goal } = await getStats();
    if (goal > attend) await addMockAttendees(goal - attend);
  } else if (body?.removeAll) {
    await removeManualAttendees();
  } else {
    const delta = Math.trunc(Number(body?.delta));
    if (!delta || Math.abs(delta) > MAX_STEP) {
      return Response.json({ error: "invalid delta" }, { status: 400 });
    }
    if (delta > 0) await addMockAttendees(delta);
    else await removeManualAttendees(-delta);
  }
  return snapshot();
}

// 전체 초기화: 시민이 직접 한 응답까지 모두 지웁니다.
export async function DELETE() {
  await clearResponses();
  return snapshot();
}
