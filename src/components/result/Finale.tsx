"use client";

import { Fireworks } from "fireworks-js";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";

// 목표 달성 연출 (물이 가득 찬 뒤 순서대로):
// 빛줄기가 화면을 쓸고 지나감 → 동심원 파동 → 금빛 기포가 한꺼번에 솟아오름 → 금색 불꽃놀이 → 마지막 대형 불꽃.
// 빛줄기는 이후에도 몇 초마다 다시 지나가서 달성 상태가 계속 살아 있어 보이게 합니다.
// 감사 메시지와 숫자 강조는 ResultContent 가 함께 띄웁니다.
const SWEEP_DELAY = 0.9;
const RIPPLE_DELAY = 1.2;
const RISE_DELAY = 1.5;
const FIREWORKS_DELAY_MS = 1800;
const FIREWORKS_DURATION_MS = 7000;
const GRAND_FINALE_COUNT = 12;

// 서버·브라우저 렌더 결과가 같도록 난수 대신 고정 패턴으로 배치합니다.
const SPARKS = Array.from({ length: 40 }, (_, i) => {
  const seed = (i * 53) % 100;
  return {
    left: (i * 29) % 100,
    size: 6 + (seed % 14),
    delay: RISE_DELAY + ((i * 7) % 20) / 20,
    duration: 2.2 + (seed % 10) / 8,
    drift: ((seed % 7) - 3) * 14,
    gold: i % 3 !== 0,
  };
});

export function Finale() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const fireworks = new Fireworks(container.current, {
      hue: { min: 35, max: 50 }, // 금색 계열
      brightness: { min: 60, max: 85 },
      intensity: 24,
      particles: 70,
      explosion: 6,
      traceLength: 3,
      acceleration: 1.03,
      decay: { min: 0.012, max: 0.022 },
      rocketsPoint: { min: 20, max: 80 },
      sound: { enabled: false, files: [], volume: { min: 0, max: 0 } },
    });
    const start = setTimeout(() => fireworks.start(), FIREWORKS_DELAY_MS);
    // 끝나기 직전에 한꺼번에 여러 발을 쏘아 마무리합니다.
    const grandFinale = setTimeout(
      () => fireworks.launch(GRAND_FINALE_COUNT),
      FIREWORKS_DELAY_MS + FIREWORKS_DURATION_MS - 1200,
    );
    // 새 불꽃만 멈추고 이미 터진 불꽃은 자연스럽게 사라지게 합니다.
    const stop = setTimeout(() => fireworks.waitStop(true), FIREWORKS_DELAY_MS + FIREWORKS_DURATION_MS);
    return () => {
      clearTimeout(start);
      clearTimeout(grandFinale);
      clearTimeout(stop);
      fireworks.stop(true);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* 빛줄기: 비스듬한 밝은 띠가 왼쪽에서 오른쪽으로 지나감 */}
      <motion.div
        className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.16)_50%,transparent_65%)]"
        initial={{ x: "0%" }}
        animate={{ x: "400%" }}
        transition={{ delay: SWEEP_DELAY, duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 6 }}
      />

      {/* 동심원 파동 */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 size-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 4, opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.6, delay: RIPPLE_DELAY + i * 0.45, ease: "easeOut" }}
        />
      ))}

      {/* 금빛 기포: 바닥에서 한꺼번에 솟아올라 화면 위로 빠져나감 */}
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className={`absolute -bottom-6 rounded-full ${s.gold ? "bg-gold/80" : "border border-white/70 bg-white/20"}`}
          style={{ left: `${s.left}%`, width: s.size, height: s.size }}
          initial={{ y: 0, x: 0, opacity: 0, scale: 0.6 }}
          animate={{ y: "-110vh", x: s.drift, opacity: [0, 1, 1, 0], scale: 1 }}
          transition={{ delay: s.delay, duration: s.duration, ease: "easeIn" }}
        />
      ))}

      <div ref={container} className="absolute inset-0" />
    </div>
  );
}
