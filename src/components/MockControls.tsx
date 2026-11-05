"use client";

import type { MutateStats } from "@/hooks/useRsvpStats";
import type { RsvpStats } from "@/lib/rsvp";
import { MockBadge } from "./MockBadge";

async function send(init: RequestInit): Promise<RsvpStats> {
  const res = await fetch("/api/rsvp/mock", init);
  if (!res.ok) throw new Error(`/api/rsvp/mock ${res.status}`);
  return res.json();
}

// MOCK 테스트 도구: 가짜 참여자를 넣어 축하 이펙트를 확인할 때 사용. (표시 여부는 MOCK_TOOLS_ENABLED)
// 누르는 즉시 숫자가 바뀌고, DB 저장은 뒤에서 처리됩니다.
export function MockControls({
  mutate,
  className = "fixed left-1/2 top-3 -translate-x-1/2",
}: {
  mutate: MutateStats;
  className?: string;
}) {
  const post = (body: object) =>
    send({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const addAttendees = (count: number) =>
    mutate((s) => ({ ...s, attend: s.attend + count }), () => post({ count })).catch(() => {});

  // 목표 인원이 몇 명이든 그 숫자까지 한 번에 채웁니다. (부족한 인원은 서버가 계산)
  const fillToGoal = () =>
    mutate((s) => ({ ...s, attend: Math.max(s.attend, s.goal) }), () => post({ fillToGoal: true })).catch(() => {});

  const reset = () =>
    mutate((s) => ({ ...s, attend: 0, decline: 0 }), () => send({ method: "DELETE" })).catch(() => {});

  const button =
    "rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy hover:bg-amber-50";
  return (
    <div className={`${className} flex flex-wrap items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50/95 p-2 shadow-sm`}>
      <MockBadge label="MOCK 테스트" />
      <button className={button} onClick={() => addAttendees(1)}>+1 참여</button>
      <button className={button} onClick={() => addAttendees(10)}>+10 참여</button>
      <button className={button} onClick={fillToGoal}>목표 달성</button>
      <button className={button} onClick={reset}>초기화</button>
    </div>
  );
}
