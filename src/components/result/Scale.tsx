// 오른쪽 눈금자. 목표의 25 / 50 / 75 / 100% 지점에 인원수를 표시합니다.
const MARKS = [0.25, 0.5, 0.75, 1];

export function Scale({ goal, tone }: { goal: number; tone: "above" | "below" }) {
  const above = tone === "above";
  const line = above ? "bg-white/35" : "bg-navy/35";
  const text = above ? "text-muted" : "text-navy/70";
  const goalColor = above ? "text-signal" : "text-navy";
  const goalLine = above ? "bg-signal" : "bg-navy";

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
            <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${isGoal ? goalColor : text}`}>
              {isGoal ? `목표 ${goal}` : Math.round(goal * mark)}
            </span>
            <span className={`h-0.5 ${isGoal ? `w-6 ${goalLine}` : `w-4 ${line}`}`} />
          </div>
        );
      })}
    </div>
  );
}
