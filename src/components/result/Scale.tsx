// 오른쪽 눈금자. 목표의 25 / 50 / 75 / 100% 지점에 인원수를 표시합니다.
const MARKS = [0.25, 0.5, 0.75, 1];

export function Scale({ goal, tone }: { goal: number; tone: "dark" | "light" }) {
  const line = tone === "dark" ? "bg-ink/25" : "bg-white/40";
  const text = tone === "dark" ? "text-muted" : "text-white/70";

  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 w-16 sm:right-8" aria-hidden>
      {MARKS.map((mark) => {
        const isGoal = mark === 1;
        return (
          <div
            key={mark}
            // 맨 위(목표) 눈금은 화면 밖으로 나가지 않게 위쪽 끝 안쪽에 붙입니다.
            className={`absolute right-0 flex items-center gap-2 ${isGoal ? "translate-y-[calc(100%+12px)]" : "translate-y-1/2"}`}
            style={{ bottom: `${mark * 100}%` }}
          >
            <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${isGoal ? "text-gold" : text}`}>
              {isGoal ? `목표 ${goal}` : Math.round(goal * mark)}
            </span>
            <span className={`h-0.5 ${isGoal ? "w-6 bg-gold" : `w-4 ${line}`}`} />
          </div>
        );
      })}
    </div>
  );
}
