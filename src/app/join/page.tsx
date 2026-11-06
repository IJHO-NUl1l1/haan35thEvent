import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { JoinView } from "@/components/JoinView";
import { getLocked } from "@/lib/rsvp-store";

export const metadata: Metadata = {
  title: "참여 응답 | Signal Light",
};

// QR 스캔 후 도착하는 모바일 응답 화면
// 화면 뼈대는 바로 보내고, 응답 잠금 여부는 서버에서 DB 를 읽어 같은 응답에 이어서 보냅니다.
// 그래서 휴대폰이 화면을 그린 뒤 다시 물어볼 때까지 기다리지 않고, 처음부터 잠금 상태로 그려집니다.
export default function JoinPage() {
  return (
    <Suspense fallback={<JoinView />}>
      <JoinWithLock />
    </Suspense>
  );
}

async function JoinWithLock() {
  await connection();
  return <JoinView initialLocked={await getLocked()} />;
}
