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

// 결과 페이지의 글자 부분. 같은 내용을 두 번(샴페인 밖: 흰 바탕 위 남색 글자 / 샴페인 속: 금색 위에 새긴 듯한 진한 남색 글자) 겹쳐 그려서
// 차오르는 높이만큼 글자 느낌이 바뀌어 보이게 합니다.
export function ResultContent({ tone, count, attend, goal, reached, badges }: Props) {
  const above = tone === "above";
  const percent = Math.round((attend / goal) * 100);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* 오른쪽 위는 눈금자의 목표 표시 자리라 비워 둡니다. */}
      <SiteHeader className="px-6 pt-6 pr-28 sm:px-10 sm:pt-8 sm:pr-32">
        {badges.map((badge) => (
          <MockBadge key={badge} label={badge} />
        ))}
      </SiteHeader>

      {/* 샴페인 밖은 남색, 샴페인 속은 흰 글씨 + 금빛 그림자(라벨에 새긴 듯한 느낌)로 차오른 만큼 확실히 달라 보이게 합니다. */}
      <main
        className={`flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center ${
          above ? "text-navy" : "text-white [text-shadow:0_1px_0_rgb(150_100_10/0.55),0_3px_14px_rgb(150_100_10/0.4)]"
        }`}
      >
        <motion.p className="text-[clamp(7rem,26vmin,19rem)] font-extrabold leading-[0.85] tracking-[-0.05em] tabular-nums">
          {count}
        </motion.p>
        <p className="mt-4 text-2xl font-bold sm:text-4xl">명이 함께해요</p>
        <div className="mt-5 h-11">
          <AnimatePresence mode="wait">
            {reached ? (
              <motion.p
                key="reached"
                className="rounded-full bg-navy px-5 py-2 text-base font-semibold text-champagne [text-shadow:none] sm:px-6 sm:text-xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
              >
                목표 {goal}명 달성! 함께해 주셔서 감사합니다
              </motion.p>
            ) : (
              <motion.p
                key="progress"
                className={`flex items-center gap-2 text-base sm:text-xl ${above ? "text-muted" : "text-white/95"}`}
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
