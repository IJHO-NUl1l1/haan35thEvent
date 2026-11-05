import type { Metadata } from "next";
import { JoinView } from "@/components/JoinView";

export const metadata: Metadata = {
  title: "참여 응답 | Signal Light",
};

// QR 스캔 후 도착하는 모바일 응답 화면
export default function JoinPage() {
  return <JoinView />;
}
