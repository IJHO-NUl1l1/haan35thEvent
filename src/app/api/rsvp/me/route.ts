import { getResponse } from "@/lib/rsvp-store";
import { isValidVoterId, readVoterId, writeVoterId } from "@/lib/voter-cookie";

// 이 브라우저가 이미 응답했는지 확인합니다.
// 쿠키와 localStorage 중 하나만 남아 있어도 기존 응답을 찾아 둘 다 복구합니다.
export async function GET(request: Request) {
  const fromStorage = new URL(request.url).searchParams.get("vid");
  const voterId = (await readVoterId()) ?? (isValidVoterId(fromStorage) ? fromStorage : null);
  if (!voterId) return Response.json({ voterId: null, status: null });

  await writeVoterId(voterId);
  return Response.json({ voterId, status: await getResponse(voterId) });
}
