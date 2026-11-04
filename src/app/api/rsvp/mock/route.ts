// MOCK 테스트 도구 전용(가짜 참여자 추가 / 전체 초기화). MOCK_TOOLS_ENABLED 가 false 면 배포 환경에서 막힙니다.
import { MOCK_TOOLS_ENABLED } from "@/config/event";
import { clearResponses, getStats, saveResponse } from "@/lib/rsvp-store";

const forbidden = () => Response.json({ error: "forbidden" }, { status: 403 });
const blocked = !MOCK_TOOLS_ENABLED && process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  if (blocked) return forbidden();
  const body = await request.json().catch(() => null);
  const count = Math.min(50, Math.max(1, Number(body?.count) || 1));
  await Promise.all(Array.from({ length: count }, () => saveResponse(`mock-${crypto.randomUUID()}`, "attend")));
  return Response.json(await getStats());
}

export async function DELETE() {
  if (blocked) return forbidden();
  await clearResponses();
  return Response.json(await getStats());
}
