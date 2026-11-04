// MOCK 테스트 도구 전용(가짜 참여자 추가 / 전체 초기화). 배포 환경에서는 막혀 있습니다.
import { clearResponses, getStats, saveResponse } from "@/lib/rsvp-store";

const forbidden = () => Response.json({ error: "forbidden" }, { status: 403 });
const isProduction = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  if (isProduction) return forbidden();
  const body = await request.json().catch(() => null);
  const count = Math.min(50, Math.max(1, Number(body?.count) || 1));
  await Promise.all(Array.from({ length: count }, () => saveResponse(`mock-${crypto.randomUUID()}`, "attend")));
  return Response.json(await getStats());
}

export async function DELETE() {
  if (isProduction) return forbidden();
  await clearResponses();
  return Response.json(await getStats());
}
