"use client";

import { MockBadge } from "./MockBadge";

// MOCK 테스트 도구: 개발 서버에서만 보입니다. 가짜 참여자를 넣어 축하 이펙트를 확인할 때 사용.
export function MockControls({
  onChange,
  className = "fixed left-1/2 top-3 -translate-x-1/2",
}: {
  onChange: () => void;
  className?: string;
}) {
  async function addAttendees(count: number) {
    await Promise.all(
      Array.from({ length: count }, () =>
        fetch("/api/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voterId: `mock-${Math.random().toString(36).slice(2)}`, status: "attend" }),
        }),
      ),
    );
    onChange();
  }

  async function reset() {
    await fetch("/api/rsvp", { method: "DELETE" });
    onChange();
  }

  const button = "rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-stone-50";
  return (
    <div className={`${className} flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/95 p-2 shadow-sm`}>
      <MockBadge label="MOCK 테스트" />
      <button className={button} onClick={() => addAttendees(1)}>+1 참여</button>
      <button className={button} onClick={() => addAttendees(10)}>+10 참여</button>
      <button className={button} onClick={reset}>초기화</button>
    </div>
  );
}
