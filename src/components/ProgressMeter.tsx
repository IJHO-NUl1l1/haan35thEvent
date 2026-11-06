import type { RsvpStats } from "@/lib/rsvp";
import { MockBadge } from "./MockBadge";

type Props = { stats: RsvpStats | null; size?: "md" | "lg" };

export function ProgressMeter({ stats, size = "md" }: Props) {
  const lg = size === "lg";
  const attend = stats?.attend ?? 0;
  const goal = stats?.goal ?? 1;
  const reached = !!stats && attend >= goal;
  const percent = Math.min(100, Math.round((attend / goal) * 100));

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className={`font-semibold ${lg ? "text-lg sm:text-xl" : "text-sm"}`}>
          {reached ? "목표 인원 달성! 함께해 주셔서 감사합니다" : "함께하기로 한 이웃"}
        </p>
        <p className="flex items-baseline gap-1 tabular-nums">
          <span className={`font-bold ${reached ? "text-gold-ink" : "text-ink"} ${lg ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
            {stats ? attend : "–"}
          </span>
          <span className={`text-muted ${lg ? "text-lg" : "text-sm"}`}>/ {stats ? goal : "–"}명</span>
          {stats?.goalMock && <MockBadge />}
        </p>
      </div>
      <div
        className={`mt-3 overflow-hidden rounded-full bg-navy/10 ${lg ? "h-3.5" : "h-2.5"}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={attend}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${reached ? "bg-linear-to-r from-champagne to-champagne-deep" : "bg-brand"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
