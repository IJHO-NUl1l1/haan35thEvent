import { EVENT } from "@/config/event";
import { MockBadge } from "./MockBadge";

export function EventIntro({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-1.5 text-[15px] leading-relaxed text-muted sm:text-base ${className}`}>
      {EVENT.intro.mock && <MockBadge />}
      {EVENT.intro.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

export function EventDetails({ className = "" }: { className?: string }) {
  return (
    <dl className={`divide-y divide-line border-y border-line ${className}`}>
      {EVENT.details.items.map((item) => (
        <div key={item.label} className="flex items-center gap-4 py-3">
          <dt className="w-10 shrink-0 text-sm text-muted">{item.label}</dt>
          <dd className="flex-1 text-[15px] font-medium sm:text-base">{item.value}</dd>
          {EVENT.details.mock && <MockBadge />}
        </div>
      ))}
    </dl>
  );
}
