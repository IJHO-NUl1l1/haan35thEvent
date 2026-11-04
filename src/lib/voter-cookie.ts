// 서버가 심는 응답자 식별 쿠키.
// localStorage 만 쓰면 아이폰 Safari 가 7일 미방문 시 지워버려서, 서버 쿠키를 함께 씁니다.
import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "haan35_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;
const VOTER_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export function isValidVoterId(value: unknown): value is string {
  return typeof value === "string" && VOTER_ID_PATTERN.test(value);
}

export async function readVoterId() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return isValidVoterId(value) ? value : null;
}

// 읽을 때마다 다시 심어서 만료일을 연장합니다.
export async function writeVoterId(voterId: string) {
  (await cookies()).set(COOKIE_NAME, voterId, {
    httpOnly: true,
    sameSite: "lax",
    // 개발 중 http://내부IP 로 접속하면 Secure 쿠키는 저장되지 않아 배포 환경에서만 켭니다.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}
