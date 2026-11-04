import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { EVENT } from "@/config/event";
import { LogoSlot } from "../LogoSlot";
import { MockBadge } from "../MockBadge";
import { Scale } from "./Scale";

type Props = {
  tone: "dark" | "light";
  count: MotionValue<number>;
  attend: number;
  goal: number;
  reached: boolean;
  badges: string[];
};

// 결과 페이지의 글자 부분. 같은 내용을 두 번(물 밖: 어두운 글자 / 물 속: 흰 글자) 겹쳐 그려서
// 물이 지나가는 높이만큼 글자색이 바뀌어 보이게 합니다.
export function ResultContent({ tone, count, attend, goal, reached, badges }: Props) {
  const dark = tone === "dark";
  const percent = Math.round((attend / goal) * 100);

  return (
    <div className={`absolute inset-0 flex flex-col ${dark ? "text-ink" : "text-white"}`}>
      {/* 오른쪽 위는 눈금자의 목표 표시 자리라 비워 둡니다. */}
      <header className="flex flex-wrap items-center gap-3 px-6 pt-6 pr-28 sm:px-10 sm:pt-8 sm:pr-32">
        <LogoSlot tone={tone} className="h-11 w-32 sm:h-12 sm:w-40" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold">{EVENT.orgName}</p>
          <p className={`text-xs ${dark ? "text-muted" : "text-white/70"}`}>{EVENT.title}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <MockBadge key={badge} label={badge} />
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <motion.p
          className={`text-[clamp(7rem,26vmin,19rem)] font-extrabold leading-[0.85] tracking-[-0.05em] tabular-nums ${dark ? "text-brand" : "text-white"}`}
        >
          {count}
        </motion.p>
        <p className="mt-4 text-2xl font-bold sm:text-4xl">명이 함께해요</p>
        <div className="mt-4 h-8">
          <AnimatePresence mode="wait">
            {reached ? (
              <motion.p
                key="reached"
                className={`text-lg font-semibold sm:text-2xl ${dark ? "text-brand" : "text-gold"}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
              >
                목표 {goal}명 달성! 함께해 주셔서 감사합니다
              </motion.p>
            ) : (
              <motion.p
                key="progress"
                className={`flex items-center gap-2 text-base sm:text-xl ${dark ? "text-muted" : "text-white/75"}`}
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
