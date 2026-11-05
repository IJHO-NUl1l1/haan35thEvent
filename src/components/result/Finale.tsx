"use client";

import { motion } from "motion/react";

// 목표 달성 연출: (물이 가득 찬 뒤) 중앙에서 동심원 파동이 한 번 퍼집니다.
// 이후에는 옅은 물결 고리 하나만 반복됩니다. 감사 메시지는 ResultContent 가 함께 띄웁니다.
const RIPPLE_DELAY = 1.2;
// 첫 파동(3겹)이 다 퍼진 뒤부터 반복 고리를 시작합니다.
const LOOP_DELAY = RIPPLE_DELAY + 0.9 + 2.6;

export function Finale() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 size-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 4, opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.6, delay: RIPPLE_DELAY + i * 0.45, ease: "easeOut" }}
        />
      ))}
      {/* 연출이 끝난 뒤에도 유지되는 단 하나의 효과: 중앙에서 옅은 물결 고리가 천천히 퍼짐 */}
      <motion.span
        className="absolute left-1/2 top-1/2 size-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 3, opacity: [0, 0.5, 0] }}
        transition={{ delay: LOOP_DELAY, duration: 5, ease: "easeOut", repeat: Infinity, repeatDelay: 2 }}
      />
    </div>
  );
}
