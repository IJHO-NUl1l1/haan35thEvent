"use client";

import { useState } from "react";
import type { RsvpStats } from "@/lib/rsvp";
import { MockBadge } from "./MockBadge";

// MOCK 테스트 도구: 가짜 참여자를 넣어 축하 이펙트를 확인할 때 사용. (표시 여부는 MOCK_TOOLS_ENABLED)
export function MockControls({
  onChange,
  className = "fixed left-1/2 top-3 -translate-x-1/2",
}: {
  onChange: (stats: RsvpStats) => void;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  // 응답에 최신 집계가 들어 있어서, 다시 조회하지 않고 바로 화면에 반영합니다.
  async function run(init: RequestInit) {
    setBusy(true);
    try {
      const res = await fetch("/api/rsvp/mock", init);
      if (res.ok) onChange(await res.json());
    } finally {
      setBusy(false);
    }
  }

  const addAttendees = (count: number) =>
    run({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count }) });

  const button =
    "rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-stone-50 disabled:opacity-50";
  return (
    <div className={`${className} flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50/95 p-2 shadow-sm`}>
      <MockBadge label="MOCK 테스트" />
      <button className={button} disabled={busy} onClick={() => addAttendees(1)}>+1 참여</button>
      <button className={button} disabled={busy} onClick={() => addAttendees(10)}>+10 참여</button>
      <button className={button} disabled={busy} onClick={() => run({ method: "DELETE" })}>초기화</button>
    </div>
  );
}
