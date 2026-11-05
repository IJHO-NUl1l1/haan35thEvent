import type { Metadata } from "next";
import { RemoteView } from "@/components/RemoteView";

export const metadata: Metadata = {
  title: "리모컨 | Signal Light",
  robots: { index: false, follow: false },
};

// 운영자 리모컨 (숨겨진 페이지, 휴대폰용). 다른 화면의 메뉴에는 넣지 않습니다.
export default function RemotePage() {
  return <RemoteView />;
}
