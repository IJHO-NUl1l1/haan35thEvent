// 오른쪽 눈금자. 목표 인원과 그 아래 깔끔한 숫자(예: 목표 250 → 50 / 100 / 150 / 200) 지점에 인원수를 표시합니다.
// 간격은 목표에서 자동으로 정합니다. 목표를 바꿔도 따로 고칠 필요가 없습니다.
import { niceNumber } from "@/lib/steps";

// 목표 바로 아래 눈금이 목표와 너무 붙으면(간격의 40% 미만) 빼서 글씨가 겹치지 않게 합니다.
function marksFor(goal: number) {
  const step = niceNumber(goal / 4); // 대략 4칸
  const marks: number[] = [];
  for (let value = step; value <= goal - step * 0.4; value += step) marks.push(value);
  return marks;
}

export function Scale({ goal, tone }: { goal: number; tone: "above" | "below" }) {
  const above = tone === "above";
  const line = above ? "bg-navy/25" : "bg-[#dfe3e9]";
  const text = above ? "text-muted" : "text-silver-flat";
  const goalColor = above ? "text-gold-ink" : "text-silver-flat";
  const goalLine = above ? "bg-champagne-deep" : "bg-[#eef1f5]";

  return (
    <div className="pointer-events-none absolute inset-y-0 right-4 w-16 sm:right-8" aria-hidden>
      {[...marksFor(goal), goal].map((value) => {
        const isGoal = value === goal;
        return (
          <div
            key={value}
            // 맨 위(목표) 눈금은 화면 밖으로 나가지 않게 위쪽 끝 안쪽에 붙입니다.
            className={`absolute right-0 flex items-center gap-2 ${isGoal ? "translate-y-[calc(100%+12px)]" : "translate-y-1/2"}`}
            style={{ bottom: `${(value / goal) * 100}%` }}
          >
            <span className={`whitespace-nowrap text-xs font-semibold tabular-nums ${isGoal ? goalColor : text}`}>
              {isGoal ? `목표 ${goal}` : value}
            </span>
            <span className={`h-0.5 ${isGoal ? `w-6 ${goalLine}` : `w-4 ${line}`}`} />
          </div>
        );
      })}
    </div>
  );
}
