import type { Metadata } from "next";
import { JoinView } from "@/components/JoinView";

export const metadata: Metadata = {
  title: "참여 응답 | 하안종합사회복지관 개관 35주년",
};

// QR 스캔 후 도착하는 모바일 응답 화면
export default function JoinPage() {
  return <JoinView />;
}
