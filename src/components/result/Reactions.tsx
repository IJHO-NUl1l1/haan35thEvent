"use client";

import { motion } from "motion/react";

// 새 참여자가 생기면 인스타그램 라이브 하트처럼 이모지가 화면 아래에서 둥실둥실 올라갑니다.
// 움직임: ① 톡 튀어나옴(0 → 125% → 100%) ② 위로 길게 떠오르며 끝에서 살짝 느려짐
//        ③ 좌우로 부드럽게 S자로 흔들리며 같이 기울어짐 ④ 대부분 선명하다가 마지막 30% 동안 사라짐
// 하나하나 크기·속도·흔들림·출발 위치가 달라서 여러 개가 연달아 나와도 자연스러운 흐름처럼 보입니다.
export const REACTION_EMOJIS = ["💙", "👍"];

export type Reaction = { id: number; order: number };

// 같은 id 는 항상 같은 값을 내는 의사 난수 (렌더 중에 Math.random 을 쓰지 않기 위해)
function rand(id: number, salt: number) {
  const x = Math.sin(id * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function shape(id: number, order: number) {
  return {
    emoji: REACTION_EMOJIS[id % REACTION_EMOJIS.length],
    left: 6 + rand(id, 1) * 88, // 화면 가로 6~94%
    size: 6 + rand(id, 2) * 4.5, // 6~10.5vmin
    rise: 62 + rand(id, 3) * 26, // 화면 높이의 62~88% 만큼 올라감
    sway: (18 + rand(id, 4) * 32) * (rand(id, 5) > 0.5 ? 1 : -1), // 첫 흔들림 방향도 제각각
    duration: 3.2 + rand(id, 6) * 1.6,
    delay: order * 0.11 + rand(id, 7) * 0.08, // 한 번에 여러 명이면 쇽쇽쇽 이어서
  };
}

export function Reactions({ list, onDone }: { list: Reaction[]; onDone: (id: number) => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {list.map(({ id, order }) => {
        const r = shape(id, order);
        const base = { duration: r.duration, delay: r.delay };
        return (
          <motion.span
            key={id}
            className="absolute bottom-0 -translate-x-1/2 leading-none drop-shadow-[0_6px_10px_rgb(13_42_82/0.25)]"
            style={{ left: `${r.left}%`, fontSize: `${r.size}vmin` }}
            initial={{ y: "0vh", scale: 0, opacity: 0 }}
            animate={{
              y: ["0vh", `-${r.rise}vh`],
              x: [0, r.sway, -r.sway, r.sway * 0.6, -r.sway * 0.3],
              rotate: [0, r.sway * 0.3, -r.sway * 0.3, r.sway * 0.18, 0],
              scale: [0, 1.25, 1, 1],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              y: { ...base, ease: [0.2, 0.6, 0.4, 1] },
              x: { ...base, ease: "easeInOut" },
              rotate: { ...base, ease: "easeInOut" },
              scale: { ...base, times: [0, 0.08, 0.14, 1], ease: "easeOut" },
              opacity: { ...base, times: [0, 0.05, 0.7, 1] },
            }}
            onAnimationComplete={() => onDone(id)}
          >
            {r.emoji}
          </motion.span>
        );
      })}
    </div>
  );
}
