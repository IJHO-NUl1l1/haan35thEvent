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

export type MyResponse = { voterId: string | null; status: RsvpStatus | null };

export function isRsvpStatus(value: unknown): value is RsvpStatus {
  return value === "attend" || value === "decline";
}

// 응답이 from → to 로 바뀌었을 때의 집계. 서버 응답 전에 화면에 먼저 반영할 때 씁니다.
export function shiftStats(stats: RsvpStats, from: RsvpStatus | null, to: RsvpStatus | null): RsvpStats {
  const next = { ...stats };
  if (from) next[from]--;
  if (to) next[to]++;
  return next;
}

export async function fetchStats(): Promise<RsvpStats> {
  const res = await fetch("/api/rsvp", { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/rsvp ${res.status}`);
  return res.json();
}

// localStorage 의 voterId 를 함께 보내 서버 쿠키가 지워졌어도 기존 응답을 찾습니다.
export async function fetchMyResponse(localVoterId: string | null): Promise<MyResponse> {
  const query = localVoterId ? `?vid=${encodeURIComponent(localVoterId)}` : "";
  const res = await fetch(`/api/rsvp/me${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET /api/rsvp/me ${res.status}`);
  return res.json();
}

export async function submitResponse(
  localVoterId: string | null,
  status: RsvpStatus,
): Promise<RsvpStats & { voterId: string }> {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId: localVoterId, status }),
  });
  if (!res.ok) throw new Error(`POST /api/rsvp ${res.status}`);
  return res.json();
}
