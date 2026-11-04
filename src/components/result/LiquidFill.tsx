import { motion, useTransform, type MotionValue } from "motion/react";
import { Bubbles } from "./Bubbles";
import { Waves } from "./Waves";

// 화면 아래에서 차오르는 물. level(0~1)이 화면 높이 비율입니다.
export function LiquidFill({ level, waveScale }: { level: MotionValue<number>; waveScale: MotionValue<number> }) {
  const height = useTransform(level, (v) => `${v * 100}%`);

  return (
    <motion.div className="absolute inset-x-0 bottom-0" style={{ height }}>
      <Waves scale={waveScale} />
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-brand to-[#163f31]">
        <Bubbles />
      </div>
    </motion.div>
  );
}
