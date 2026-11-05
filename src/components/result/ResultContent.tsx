import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { MockBadge } from "../MockBadge";
import { SiteHeader } from "../SiteHeader";
import { Scale } from "./Scale";

type Props = {
  tone: "above" | "below";
  count: MotionValue<number>;
  attend: number;
  goal: number;
  reached: boolean;
  badges: string[];
};

// 결과 페이지의 글자 부분. 같은 내용을 두 번(물 밖: 파란 바탕 위 흰 글자 / 물 속: 하늘색 물 위 남색 글자) 겹쳐 그려서
// 물이 지나가는 높이만큼 글자색이 바뀌어 보이게 합니다.
export function ResultContent({ tone, count, attend, goal, reached, badges }: Props) {
  const above = tone === "above";
  const percent = Math.round((attend / goal) * 100);

  return (
    <div className={`absolute inset-0 flex flex-col ${above ? "text-white" : "text-navy"}`}>
      {/* 오른쪽 위는 눈금자의 목표 표시 자리라 비워 둡니다. */}
      <SiteHeader tone={above ? "blue" : "water"} className="px-6 pt-6 pr-28 sm:px-10 sm:pt-8 sm:pr-32">
        {badges.map((badge) => (
          <MockBadge key={badge} label={badge} />
        ))}
      </SiteHeader>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <motion.p className="text-[clamp(7rem,26vmin,19rem)] font-extrabold leading-[0.85] tracking-[-0.05em] tabular-nums">
          {count}
        </motion.p>
        <p className="mt-4 text-2xl font-bold sm:text-4xl">명이 함께해요</p>
        <div className="mt-4 h-8">
          <AnimatePresence mode="wait">
            {reached ? (
              <motion.p
                key="reached"
                className={`text-lg font-semibold sm:text-2xl ${above ? "text-signal" : "text-navy"}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
              >
                목표 {goal}명 달성! 함께해 주셔서 감사합니다
              </motion.p>
            ) : (
              <motion.p
                key="progress"
                className={`flex items-center gap-2 text-base sm:text-xl ${above ? "text-muted" : "text-navy/75"}`}
                exit={{ opacity: 0, y: -8 }}
              >
                목표 {goal}명 · {percent}%
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Scale goal={goal} tone={tone} />
    </div>
  );
}
