"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

// 새 참여자가 생기면 인스타그램에서 하트를 눌렀을 때처럼 반응이 터집니다. (참여자 한 명 = 한 번)
// ① 그 자리에 큰 하트(또는 따봉)가 톡 튀어나와(0 → 120% → 100%) 위로 떠오르며 사라지고
// ② 동시에 그보다 작고 연한 잔상 몇 개가 같은 자리에서 위로 쇽쇽쇽 떠오릅니다.
//    잔상마다 출발 시간(살짝 텀), 기울기, 투명도, 올라가는 높이가 조금씩 다릅니다.
// 시스템 이모지는 기기마다 모양이 다르고(윈도우는 굵은 테두리) 쨍해서, 단색 SVG 아이콘을 씁니다.
export type Reaction = { id: number; order: number };

// 같은 id 는 항상 같은 값을 내는 의사 난수 (렌더 중에 Math.random 을 쓰지 않기 위해)
function rand(id: number, salt: number) {
  const x = Math.sin(id * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const MAIN_DURATION = 1.6;
const MAIN_RISE = 150; // px

function shape(id: number, order: number) {
  const ghostCount = 3 + Math.floor(rand(id, 9) * 3); // 잔상 3~5개
  const ghosts = Array.from({ length: ghostCount }, (_, i) => ({
    delay: 0.12 + i * (0.11 + rand(id, 20 + i) * 0.07), // 쇽, 쇽, 쇽 — 간격도 조금씩 다르게
    angle: (rand(id, 30 + i) - 0.5) * 44, // -22° ~ 22°
    opacity: 0.35 + rand(id, 40 + i) * 0.35, // 0.35 ~ 0.7
    rise: 90 + rand(id, 50 + i) * 110, // 90 ~ 200px
    drift: (rand(id, 60 + i) - 0.5) * 60,
    scale: 0.55 + rand(id, 70 + i) * 0.25,
    duration: 1.1 + rand(id, 80 + i) * 0.4,
  }));
  const end = Math.max(MAIN_DURATION, ...ghosts.map((g) => g.delay + g.duration));
  return {
    icon: id % 2 === 0 ? Heart : ThumbsUp,
    left: 8 + rand(id, 1) * 84, // 화면 가로 8~92%
    top: 22 + rand(id, 2) * 62, // 화면 세로 22~84%
    size: 5.4 + rand(id, 3) * 3, // 5.4~8.4vmin
    tilt: (rand(id, 4) - 0.5) * 16,
    delay: order * 0.16 + rand(id, 5) * 0.1, // 한 번에 여러 명이면 여기저기서 차례로
    ghosts,
    end,
  };
}

export function Reactions({ list, onDone }: { list: Reaction[]; onDone: (id: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {list.map(({ id, order }) => (
        <Burst key={id} id={id} order={order} onDone={onDone} />
      ))}
    </div>
  );
}

function Burst({ id, order, onDone }: Reaction & { onDone: (id: number) => void }) {
  const r = shape(id, order);
  const Icon = r.icon;

  // 가장 늦게 끝나는 잔상까지 다 사라진 뒤 목록에서 지웁니다.
  const total = r.delay + r.end;
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), total * 1000 + 100);
    return () => clearTimeout(timer);
  }, [id, total, onDone]);

  return (
    // 크기 0 인 기준점. 큰 아이콘과 잔상이 모두 여기서 출발합니다.
    <div className="absolute" style={{ left: `${r.left}%`, top: `${r.top}%` }}>
      {r.ghosts.map((g, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ width: `${r.size}vmin` }}
          initial={{ opacity: 0, scale: g.scale * 0.6, y: 0, x: 0, rotate: 0 }}
          animate={{
            opacity: [0, g.opacity, g.opacity, 0],
            scale: g.scale,
            y: -g.rise,
            x: g.drift,
            rotate: g.angle,
          }}
          transition={{
            duration: g.duration,
            delay: r.delay + g.delay,
            ease: [0.25, 0.7, 0.4, 1],
            opacity: {
              duration: g.duration,
              delay: r.delay + g.delay,
              times: [0, 0.15, 0.55, 1],
            },
          }}
        >
          <Icon />
        </motion.div>
      ))}
      {/* 큰 아이콘: 톡 튀어나온 뒤(0 → 120% → 100%) 잔상처럼 위로 떠오르며 사라집니다. */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${r.size}vmin`, rotate: r.tilt }}
        initial={{ opacity: 0, scale: 0, y: 0 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.2, 1, 1], y: [0, 0, -MAIN_RISE] }}
        transition={{
          duration: MAIN_DURATION,
          delay: r.delay,
          opacity: { duration: MAIN_DURATION, delay: r.delay, times: [0, 0.08, 0.45, 1] },
          scale: { duration: MAIN_DURATION, delay: r.delay, times: [0, 0.14, 0.24, 1], ease: "easeOut" },
          y: { duration: MAIN_DURATION, delay: r.delay, times: [0, 0.24, 1], ease: [0.3, 0.6, 0.4, 1] },
        }}
      >
        <Icon />
      </motion.div>
    </div>
  );
}

// 단색 빨간 하트. 그라데이션·광택 없이 깔끔하게.
function Heart() {
  return (
    <svg viewBox="0 0 24 24" className="block h-auto w-full">
      <path
        d="M12 21.2s-7.6-4.5-9.7-9.3C.8 8.3 3 4.4 6.7 4.4c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.9 3.9 4.4 7.5-2.1 4.8-9.7 9.3-9.7 9.3z"
        fill="#e8283f"
      />
    </svg>
  );
}

// 단색 파란 따봉. 결과 화면의 파랑(진행) 계열.
function ThumbsUp() {
  return (
    <svg viewBox="0 0 24 24" className="block h-auto w-full">
      <g fill="#1e88d6" stroke="#1e88d6" strokeWidth="1" strokeLinejoin="round">
        <rect x="2.5" y="10.2" width="4" height="10.4" rx="1" />
        <path d="M8.4 10.3 11.7 4.4c.5-.9 1.6-1.2 2.4-.7.9.5 1.2 1.6.8 2.5L13.8 9.1H19c1.4 0 2.4 1.3 2.1 2.6l-1.5 6.9c-.2 1.2-1.3 2.1-2.6 2.1H8.4z" />
      </g>
    </svg>
  );
}
