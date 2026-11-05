import { motion, useTransform, type MotionValue } from "motion/react";
import { Bubbles } from "./Bubbles";
import { Waves } from "./Waves";

// 화면 아래에서 차오르는 물. level(0~1)이 화면 높이 비율입니다.
// 클릭은 통과시켜서, 물이 가득 차도 아래 메뉴를 누를 수 있게 합니다.
export function LiquidFill({ level, waveScale }: { level: MotionValue<number>; waveScale: MotionValue<number> }) {
  const height = useTransform(level, (v) => `${v * 100}%`);

  return (
    <motion.div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height }}>
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-brand to-[#0b86c4]">
        <Bubbles />
      </div>
      {/* 물 본체 위에 그려야 겹친 부분에서 물결 모양이 유지됩니다. */}
      <Waves scale={waveScale} />
    </motion.div>
  );
}
