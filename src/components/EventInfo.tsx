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

// page: "display" = 첫 화면(/), "join" = QR 로 들어온 화면(/join). 문구는 config/event.ts 에서 각각 관리합니다.
export function EventIntro({ page, className = "" }: { page: "display" | "join"; className?: string }) {
  const intro = EVENT.intro[page];
  return (
    <div className={`space-y-1.5 text-[15px] leading-relaxed text-muted sm:text-base ${className}`}>
      {intro.mock && <MockBadge />}
      {intro.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
