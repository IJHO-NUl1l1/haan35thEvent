import type { Metadata } from "next";
import { ResultView } from "@/components/result/ResultView";

export const metadata: Metadata = {
  title: "참여 현황 | Signal Light",
};

// 최종 결과 화면 (보여주기 전용, 행사장 스크린용)
export default function ResultPage() {
  return <ResultView />;
}
