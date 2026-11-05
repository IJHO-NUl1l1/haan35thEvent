"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RsvpStats } from "@/lib/rsvp";
import { SignalLightLogo } from "./SignalLightLogo";

// 운영자 리모컨: 휴대폰 조작이 어려운 분들 대신 스태프가 참여 인원을 직접 올리고 내립니다.
// 다른 화면에서는 링크하지 않는 숨겨진 페이지입니다. 누르는 즉시 숫자가 바뀌고, DB 저장은 뒤에서 처리됩니다.
type RemoteStats = RsvpStats & { manual: number };

const STEPS = [1, 5, 10, 20];

async function send(init?: RequestInit): Promise<RemoteStats> {
  const res = await fetch("/api/rsvp/remote", { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`/api/rsvp/remote ${res.status}`);
  return res.json();
}

const post = (body: object) =>
  send({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// 직접 넣은 인원이 바뀌는 만큼 참여 인원도 같이 바뀝니다.
const shiftManual = (s: RemoteStats, delta: number): RemoteStats => {
  const applied = Math.max(delta, -s.manual);
  return { ...s, attend: s.attend + applied, manual: s.manual + applied };
};

export function RemoteView() {
  const [stats, setStats] = useState<RemoteStats | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [amount, setAmount] = useState("");
  // useRsvpStats 와 같은 방식: 나중에 누른 동작보다 먼저 출발한 응답은 버립니다.
  const version = useRef(0);

  const refresh = useCallback(() => {
    const startedAt = version.current;
    return send().then(
      (next) => {
        if (version.current === startedAt) setStats(next);
      },
      () => {},
    );
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  const run = async (label: string, optimistic: (s: RemoteStats) => RemoteStats, request: () => Promise<RemoteStats>) => {
    const id = ++version.current;
    setStats((s) => s && optimistic(s));
    setNotice({ text: label });
    navigator.vibrate?.(15);
    try {
      const result = await request();
      if (version.current === id) setStats(result);
    } catch {
      if (version.current === id) refresh();
      setNotice({ text: `${label} 반영 실패 — 다시 눌러 주세요`, error: true });
    }
  };

  const change = (delta: number) =>
    run(`${delta > 0 ? "+" : "−"}${Math.abs(delta)}명`, (s) => shiftManual(s, delta), () => post({ delta }));

  const fillToGoal = () =>
    run("목표 인원까지 채움", (s) => shiftManual(s, Math.max(0, s.goal - s.attend)), () => post({ fillToGoal: true }));

  const removeAll = () =>
    run("직접 추가한 인원 모두 뺌", (s) => shiftManual(s, -s.manual), () => post({ removeAll: true }));

  const reset = () => {
    if (!window.confirm("시민들이 직접 한 응답까지 모두 지워집니다. 정말 초기화할까요?")) return;
    run("전체 초기화", (s) => ({ ...s, attend: 0, decline: 0, manual: 0 }), () => send({ method: "DELETE" }));
  };

  const typed = Number(amount);
  const typedValid = Number.isInteger(typed) && typed >= 1 && typed <= 1000;
  const changeTyped = (sign: 1 | -1) => typedValid && change(sign * typed);

  const attend = stats?.attend ?? 0;
  const goal = stats?.goal ?? 1;
  const manual = stats?.manual ?? 0;
  const reached = !!stats && attend >= goal;
  const percent = Math.min(100, Math.round((attend / goal) * 100));

  const plus = "h-14 rounded-xl bg-white text-lg font-bold text-paper active:scale-95 transition-transform disabled:opacity-35";
  const minus =
    "h-14 rounded-xl border border-white/35 text-lg font-bold text-white active:scale-95 active:bg-white/10 transition-transform disabled:opacity-35";
  const wide = "h-12 w-full rounded-xl text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-35";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 bg-paper px-4 pb-10 pt-5 text-ink select-none">
      <header className="flex items-center justify-between gap-3">
        <SignalLightLogo className="text-[0.8px]" />
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-muted">리모컨</span>
      </header>

      {/* 현재 인원 */}
      <section className="sticky top-0 z-10 -mx-4 bg-paper px-4 pb-3 pt-2">
        <div className="rounded-2xl bg-deep p-4">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm font-semibold text-muted">{reached ? "목표 달성!" : "함께하기로 한 이웃"}</p>
            <p className="flex items-baseline gap-1 tabular-nums">
              <span className={`text-5xl font-bold ${reached ? "text-signal" : "text-white"}`}>{stats ? attend : "–"}</span>
              <span className="text-lg text-muted">/ {stats ? goal : "–"}명</span>
            </p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out ${reached ? "bg-signal" : "bg-brand"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 flex justify-between text-sm text-muted tabular-nums">
            <span>QR 응답 {stats ? attend - manual : "–"}명</span>
            <span>직접 추가 {stats ? manual : "–"}명</span>
          </p>
        </div>
        <p
          role="status"
          className={`mt-2 h-5 text-center text-sm font-medium ${notice?.error ? "text-pink" : "text-signal"}`}
        >
          {notice?.text}
        </p>
      </section>

      {/* 추가 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">인원 추가</h2>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((n) => (
            <button key={n} className={plus} onClick={() => change(n)}>
              +{n}
            </button>
          ))}
        </div>
        <button className={`${wide} bg-signal text-navy`} onClick={fillToGoal} disabled={!stats || reached}>
          목표 인원({goal}명)까지 한 번에 채우기
        </button>
      </section>

      {/* 빼기 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">
          인원 빼기 <span className="font-normal">· 직접 추가한 인원에서만 빠집니다</span>
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((n) => (
            <button key={n} className={minus} onClick={() => change(-n)} disabled={manual === 0}>
              −{n}
            </button>
          ))}
        </div>
        <button
          className={`${wide} border border-white/35 text-white disabled:opacity-35`}
          onClick={removeAll}
          disabled={manual === 0}
        >
          직접 추가한 인원 모두 빼기
        </button>
      </section>

      {/* 숫자 입력 */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted">숫자로 입력</h2>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            placeholder="인원 수"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 min-w-0 flex-1 rounded-xl border border-white/35 bg-white/[0.07] px-4 text-xl font-bold text-white tabular-nums placeholder:text-base placeholder:font-normal placeholder:text-muted focus:border-white focus:outline-none"
          />
          <button className={`${plus} px-5`} onClick={() => changeTyped(1)} disabled={!typedValid}>
            추가
          </button>
          <button className={`${minus} px-5`} onClick={() => changeTyped(-1)} disabled={!typedValid || manual === 0}>
            빼기
          </button>
        </div>
      </section>

      {/* 초기화 */}
      <section className="mt-6 border-t border-line pt-6">
        <button className={`${wide} border border-pink/70 text-pink`} onClick={reset}>
          전체 초기화 (QR 응답 포함)
        </button>
      </section>
    </main>
  );
}
