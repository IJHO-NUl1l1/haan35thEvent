// 서버와 클라이언트가 함께 쓰는 타입 및 API 호출 함수.
export type RsvpStatus = "attend" | "decline";

export type RsvpStats = {
  attend: number;
  decline: number;
  goal: number;
  goalMock: boolean;
  // 저장소가 mock 이면 true. 실제 DB 로 바꾸면 false 가 됩니다.
  mock: boolean;
};

export function isRsvpStatus(value: unknown): value is RsvpStatus {
  return value === "attend" || value === "decline";
}

export async function fetchStats(): Promise<RsvpStats> {
  const res = await fetch("/api/rsvp", { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/rsvp ${res.status}`);
  return res.json();
}

export async function submitResponse(voterId: string, status: RsvpStatus): Promise<RsvpStats> {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId, status }),
  });
  if (!res.ok) throw new Error(`POST /api/rsvp ${res.status}`);
  return res.json();
}
