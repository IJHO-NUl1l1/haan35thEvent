"use client";

import { Fireworks } from "fireworks-js";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

// 목표 달성 연출: (물이 가득 찬 뒤) 중앙에서 동심원 파동 → 금색 불꽃놀이.
// 이후에는 옅은 물결 고리 하나만 반복됩니다. 감사 메시지는 ResultContent 가 함께 띄웁니다.
const RIPPLE_DELAY = 1.2;
const FIREWORKS_DELAY_MS = 1800;
const FIREWORKS_DURATION_MS = 7000;

export function Finale() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    // 휴대폰처럼 좁은 화면에서는 불꽃 수와 크기를 줄입니다.
    const compact = window.matchMedia("(max-width: 640px)").matches;
    const fireworks = new Fireworks(container.current, {
      hue: { min: 35, max: 50 }, // 금색 계열
      brightness: { min: 60, max: 85 },
      intensity: compact ? 10 : 24,
      particles: compact ? 35 : 70,
      explosion: compact ? 3 : 6,
      traceLength: 3,
      acceleration: 1.03,
      decay: { min: 0.012, max: 0.022 },
      rocketsPoint: { min: 20, max: 80 },
      sound: { enabled: false, files: [], volume: { min: 0, max: 0 } },
    });
    const start = setTimeout(() => fireworks.start(), FIREWORKS_DELAY_MS);
    // 새 불꽃만 멈추고 이미 터진 불꽃은 자연스럽게 사라지게 합니다.
    const stop = setTimeout(() => fireworks.waitStop(true), FIREWORKS_DELAY_MS + FIREWORKS_DURATION_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(stop);
      fireworks.stop(true);
    };
  }, []);

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
        transition={{
          delay: (FIREWORKS_DELAY_MS + FIREWORKS_DURATION_MS) / 1000,
          duration: 5,
          ease: "easeOut",
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
      <div ref={container} className="absolute inset-0" />
    </div>
  );
}
