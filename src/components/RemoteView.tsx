"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
  // 같은 버튼을 연달아 눌러도 알림이 다시 튀어오르도록 매번 key 를 바꿉니다.
  const [noticeKey, setNoticeKey] = useState(0);
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
    setNoticeKey((k) => k + 1);
    navigator.vibrate?.(15);
    try {
      const result = await request();
      if (version.current === id) setStats(result);
    } catch {
      if (version.current === id) refresh();
      setNotice({ text: `${label} 반영 실패 — 다시 눌러 주세요`, error: true });
      setNoticeKey((k) => k + 1);
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

  const plus =
    "h-14 rounded-xl bg-primary text-lg font-bold text-white shadow-[0_3px_0_var(--color-navy)] transition-transform active:translate-y-0.5 active:shadow-none disabled:opacity-35";
  const minus =
    "h-14 rounded-xl border border-line-strong bg-paper text-lg font-bold text-ink transition-transform active:scale-95 active:bg-navy/[0.06] disabled:opacity-35";
  const wide = "h-12 w-full rounded-xl text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-35";
  const card = "flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3.5";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-3 bg-paper px-4 pb-10 pt-5 text-ink select-none">
      <header className="flex items-center justify-between gap-3">
        <SignalLightLogo className="text-[0.8px]" />
      </header>

      {/* 현재 인원 */}
      <section className="sticky top-0 z-10 -mx-4 bg-paper px-4 pt-2">
        <div
          className={`overflow-hidden rounded-2xl bg-navy shadow-lg shadow-navy/25 ring-1 transition-colors ${reached ? "ring-champagne" : "ring-navy"}`}
        >
          {/* 심볼 네 가지 색 띠 */}
          <div className="flex h-1" aria-hidden>
            <span className="flex-1 bg-brand" />
            <span className="flex-1 bg-teal" />
            <span className="flex-1 bg-signal" />
            <span className="flex-1 bg-pink" />
          </div>
          <div className="p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white/65">{reached ? "목표 달성!" : "함께하기로 한 이웃"}</p>
                <p className={`mt-1 text-2xl font-bold tabular-nums ${reached ? "text-champagne" : "text-brand"}`}>
                  {stats ? percent : "–"}
                  <span className="text-base">%</span>
                </p>
              </div>
              <p className="flex items-baseline gap-1 tabular-nums">
                <span
                  key={attend}
                  className={`animate-pop inline-block text-6xl font-bold leading-none ${reached ? "text-champagne" : "text-white"}`}
                >
                  {stats ? attend : "–"}
                </span>
                <span className="text-lg text-white/65">/ {stats ? goal : "–"}명</span>
              </p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${reached ? "bg-linear-to-r from-champagne to-champagne-deep" : "bg-linear-to-r from-brand to-primary"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm tabular-nums">
              <p className="flex justify-between rounded-lg bg-white/[0.08] px-3 py-2 text-white/65">
                QR 응답 <b className="text-white">{stats ? attend - manual : "–"}명</b>
              </p>
              <p className="flex justify-between rounded-lg bg-white/[0.08] px-3 py-2 text-white/65">
                직접 추가 <b className="text-white">{stats ? manual : "–"}명</b>
              </p>
            </div>
          </div>
        </div>
        <div role="status" className="flex h-10 items-center justify-center">
          {notice && (
            <span
              key={noticeKey}
              className={`animate-pop rounded-full px-3 py-1 text-sm font-semibold ${
                notice.error ? "bg-pink/15 text-pink ring-1 ring-pink/50" : "bg-primary/10 text-primary"
              }`}
            >
              {notice.text}
            </span>
          )}
        </div>
      </section>

      {/* 추가 */}
      <section className={card}>
        <SectionTitle color="bg-primary">인원 추가</SectionTitle>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((n) => (
            <button key={n} className={plus} onClick={() => change(n)}>
              +{n}
            </button>
          ))}
        </div>
        <button
          className={`${wide} bg-champagne text-navy shadow-[0_3px_0_var(--color-champagne-deep)] active:shadow-none`}
          onClick={fillToGoal}
          disabled={!stats || reached}
        >
          목표 인원({goal}명)까지 한 번에 채우기
        </button>
      </section>

      {/* 빼기 */}
      <section className={card}>
        <SectionTitle color="bg-navy/30" note="직접 추가한 인원에서만 빠집니다">
          인원 빼기
        </SectionTitle>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((n) => (
            <button key={n} className={minus} onClick={() => change(-n)} disabled={manual === 0}>
              −{n}
            </button>
          ))}
        </div>
        <button className={`${wide} border border-line-strong bg-paper text-ink`} onClick={removeAll} disabled={manual === 0}>
          직접 추가한 인원 모두 빼기
        </button>
      </section>

      {/* 숫자 입력 */}
      <section className={card}>
        <SectionTitle color="bg-brand">숫자로 입력</SectionTitle>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={1000}
              placeholder="인원 수"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 w-full appearance-none rounded-xl [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border border-line-strong bg-paper pl-4 pr-10 text-xl font-bold text-ink tabular-nums placeholder:text-base placeholder:font-normal placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-muted">명</span>
          </label>
          <button className={`${plus} px-5`} onClick={() => changeTyped(1)} disabled={!typedValid}>
            추가
          </button>
          <button className={`${minus} px-5`} onClick={() => changeTyped(-1)} disabled={!typedValid || manual === 0}>
            빼기
          </button>
        </div>
      </section>

      {/* 초기화 */}
      <section className="mt-6 flex flex-col gap-2 rounded-2xl border border-dashed border-pink/50 p-3.5">
        <p className="text-xs text-muted">QR로 들어온 시민 응답까지 모두 지워집니다. 행사 중에는 누르지 마세요.</p>
        <button className={`${wide} border border-pink/70 bg-pink/[0.06] text-pink active:bg-pink/15`} onClick={reset}>
          전체 초기화 (QR 응답 포함)
        </button>
      </section>
    </main>
  );
}

function SectionTitle({ color, note, children }: { color: string; note?: string; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
      <span className={`h-4 w-1 rounded-full ${color}`} aria-hidden />
      {children}
      {note && <span className="font-normal text-muted">· {note}</span>}
    </h2>
  );
}
