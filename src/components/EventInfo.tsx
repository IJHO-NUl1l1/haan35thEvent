import { EVENT } from "@/config/event";
import { MockBadge } from "./MockBadge";

// 웹기반 온(ON)동네 복지안전망 / "Signal Light"
export function EventTitle({ className = "" }: { className?: string }) {
  return (
    <h1 className={className}>
      {EVENT.title.kicker}
      <br />
      {EVENT.title.name}
    </h1>
  );
}

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
