import { connection } from "next/server";
import { EVENT } from "@/config/event";
import { isRsvpStatus, type RsvpStats } from "@/lib/rsvp";
import { clearResponses, getCounts, saveResponse, STORE_IS_MOCK } from "@/lib/rsvp-store";

async function stats(): Promise<RsvpStats> {
  const counts = await getCounts();
  return { ...counts, goal: EVENT.goal.value, goalMock: EVENT.goal.mock, mock: STORE_IS_MOCK };
}

export async function GET() {
  // 매 요청마다 최신 집계를 돌려주도록 프리렌더링을 막습니다.
  await connection();
  return Response.json(await stats());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const voterId = typeof body?.voterId === "string" ? body.voterId.slice(0, 64) : "";
  if (!voterId || !isRsvpStatus(body?.status)) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }
  await saveResponse(voterId, body.status);
  return Response.json(await stats());
}

// 개발용 초기화. 배포 환경에서는 막혀 있습니다.
export async function DELETE() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  await clearResponses();
  return Response.json(await stats());
}
