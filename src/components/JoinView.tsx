"use client";

import { useState, useSyncExternalStore } from "react";
import { EVENT } from "@/config/event";
import { useCelebration } from "@/hooks/useCelebration";
import { useRsvpStats } from "@/hooks/useRsvpStats";
import { smallBurst } from "@/lib/celebrate";
import { getMyStatus, getVoterId, setMyStatus, subscribeMyStatus } from "@/lib/my-response";
import { submitResponse, type RsvpStatus } from "@/lib/rsvp";
import { EventDetails, EventIntro } from "./EventInfo";
import { LogoSlot } from "./LogoSlot";
import { MockControls } from "./MockControls";
import { ProgressMeter } from "./ProgressMeter";

const isDev = process.env.NODE_ENV === "development";

// QR 을 찍고 들어오는 모바일 화면. 참여/불참 응답 → 결과 화면.
export function JoinView() {
  const myStatus = useSyncExternalStore(subscribeMyStatus, getMyStatus, () => null);
  const { stats, setStats, refresh } = useRsvpStats(5000);
  const [pending, setPending] = useState<RsvpStatus | null>(null);
  const [failed, setFailed] = useState(false);
  useCelebration(!!stats && stats.attend >= stats.goal);

  async function respond(status: RsvpStatus) {
    setPending(status);
    setFailed(false);
    try {
      setStats(await submitResponse(getVoterId(), status));
      setMyStatus(status);
      if (status === "attend") smallBurst();
    } catch {
      setFailed(true);
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-12 pt-8 sm:pt-16">
      <LogoSlot className="h-12 w-36" />

      <p className="mt-10 text-sm font-semibold text-brand">35th Anniversary</p>
      <h1 className="mt-2 text-[26px] font-bold leading-snug tracking-tight sm:text-3xl">
        {EVENT.orgName}
        <br />
        {EVENT.title}
      </h1>
      <EventIntro className="mt-4" />
      <EventDetails className="mt-7" />

      <section className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
        {myStatus ? (
          <Result status={myStatus} onChange={() => setMyStatus(null)} />
        ) : (
          <div>
            <p className="text-lg font-bold">행사에 함께하시나요?</p>
            <div className="mt-4 grid gap-2.5">
              <button
                className="h-14 rounded-xl bg-brand text-base font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
                disabled={!!pending}
                onClick={() => respond("attend")}
              >
                {pending === "attend" ? "보내는 중…" : "참여할게요"}
              </button>
              <button
                className="h-14 rounded-xl border border-line bg-white text-base font-semibold text-ink transition active:scale-[0.99] disabled:opacity-60"
                disabled={!!pending}
                onClick={() => respond("decline")}
              >
                {pending === "decline" ? "보내는 중…" : "이번엔 어려워요"}
              </button>
            </div>
            {failed && <p className="mt-3 text-sm text-red-600">전송하지 못했어요. 잠시 후 다시 눌러 주세요.</p>}
          </div>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <ProgressMeter stats={stats} />
        </div>
      </section>

      {/* 모바일에서는 고정 위치가 로고·버튼을 가려서 본문 아래에 둡니다. */}
      {isDev && <MockControls onChange={refresh} className="mx-auto mt-6" />}
    </main>
  );
}

function Result({ status, onChange }: { status: RsvpStatus; onChange: () => void }) {
  const attending = status === "attend";
  return (
    <div className="text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-4 text-lg font-bold">{attending ? "참여 신청이 완료되었어요" : "응답해 주셔서 감사해요"}</p>
      <p className="mt-1 text-sm text-muted">
        {attending ? "행사 당일에 반갑게 맞이할게요." : "다음 자리에서 꼭 뵐게요."}
      </p>
      <button className="mt-4 text-sm text-muted underline underline-offset-4" onClick={onChange}>
        응답 바꾸기
      </button>
    </div>
  );
}
