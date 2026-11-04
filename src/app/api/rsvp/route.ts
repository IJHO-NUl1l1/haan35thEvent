import { connection } from "next/server";
import { isRsvpStatus } from "@/lib/rsvp";
import { getStats, saveResponse } from "@/lib/rsvp-store";
import { isValidVoterId, readVoterId, writeVoterId } from "@/lib/voter-cookie";

export async function GET() {
  // 매 요청마다 최신 집계를 돌려주도록 프리렌더링을 막습니다.
  await connection();
  return Response.json(await getStats());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isRsvpStatus(body?.status)) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  // 식별자 우선순위: 서버 쿠키 → 브라우저 localStorage 값 → 새로 발급
  const voterId =
    (await readVoterId()) ?? (isValidVoterId(body?.voterId) ? body.voterId : crypto.randomUUID());

  await saveResponse(voterId, body.status);
  await writeVoterId(voterId);
  return Response.json({ ...(await getStats()), voterId });
}
