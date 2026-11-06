"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MOCK_TOOLS_ENABLED } from "@/config/event";
import { useCelebration } from "@/hooks/useCelebration";
import { useRsvpStats } from "@/hooks/useRsvpStats";
import { smallBurst } from "@/lib/celebrate";
import { getLocalVoterId, getMyStatus, setLocalVoterId, setMyStatus, subscribeMyStatus } from "@/lib/my-response";
import { fetchMyResponse, shiftStats, submitResponse, type RsvpStatus } from "@/lib/rsvp";
import { EventIntro, EventTitle } from "./EventInfo";
import { MockControls } from "./MockControls";
import { ProgressMeter } from "./ProgressMeter";
import { SiteHeader } from "./SiteHeader";

const showMockTools = MOCK_TOOLS_ENABLED || process.env.NODE_ENV === "development";

// QR 을 찍고 들어오는 모바일 화면. 참여/불참 응답 → 결과 화면.
export function JoinView() {
  const myStatus = useSyncExternalStore(subscribeMyStatus, getMyStatus, () => null);
  // 3초마다 집계를 다시 불러옵니다. 리모컨의 응답 잠금(stats.locked)도 이 값에 실려 와서 새로고침 없이 반영됩니다.
  const { stats, mutate } = useRsvpStats(3000);
  const locked = !!stats?.locked;
  // "응답 바꾸기"를 눌러 버튼을 다시 보고 있는 상태. 기존 응답(myStatus)은 그대로 둡니다.
  const [editing, setEditing] = useState(false);
  const [failed, setFailed] = useState(false);
  const answered = useRef(false);
  useCelebration(!!stats && stats.attend >= stats.goal);

  // 들어올 때 서버에 이 브라우저의 기존 응답을 물어보고 localStorage 를 맞춥니다.
  useEffect(() => {
    fetchMyResponse(getLocalVoterId()).then(
      (me) => {
        if (me.voterId) setLocalVoterId(me.voterId);
        // 그 사이에 이미 버튼을 눌렀다면 방금 고른 응답이 우선입니다.
        if (!answered.current) setMyStatus(me.status);
      },
      () => {}, // 실패하면 localStorage 에 남은 값으로 그대로 보여줍니다.
    );
  }, []);

  // 화면(응답·인원수)부터 즉시 바꾸고, 저장은 뒤에서 합니다. 실패하면 이전 상태로 되돌립니다.
  async function respond(status: RsvpStatus) {
    const previous = myStatus;
    answered.current = true;
    setFailed(false);
    setEditing(false);
    setMyStatus(status);
    if (status === "attend" && previous !== "attend") smallBurst();

    try {
      const result = await mutate(
        (s) => shiftStats(s, previous, status),
        () => submitResponse(getLocalVoterId(), status),
      );
      setLocalVoterId(result.voterId);
    } catch {
      setMyStatus(previous);
      setEditing(previous !== null);
      setFailed(true);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-12 pt-6 sm:pt-10">
      <SiteHeader />

      <EventTitle className="mt-10 text-[26px] font-bold leading-snug tracking-tight sm:text-3xl" />
      <EventIntro page="join" className="mt-4" />

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        {/* 응답 칸은 높이를 고정해 두고 안의 내용만 바뀝니다. (버튼 ↔ 완료 ↔ 잠김 사이에서 아래 내용이 들썩이지 않게) */}
        <div className="relative h-60">
          {/* 잠겨 있으면 뒤의 버튼은 그대로 보이되 누를 수 없게 합니다. */}
          <div inert={locked} className="flex h-full flex-col justify-center">
            {myStatus && !editing ? (
              <Result status={myStatus} onChange={() => setEditing(true)} />
            ) : (
              <div>
                <p className="text-lg font-bold">행사에 함께하시나요?</p>
                {myStatus && (
                  <p className="mt-1 text-sm text-muted">
                    지금은 &lsquo;{myStatus === "attend" ? "참여" : "불참"}&rsquo;로 응답되어 있어요.{" "}
                    <button className="underline underline-offset-4" onClick={() => setEditing(false)}>
                      그대로 두기
                    </button>
                  </p>
                )}
                <div className="mt-4 grid gap-2.5">
                  <button
                    className="h-14 rounded-xl bg-primary text-base font-bold text-white transition hover:bg-navy active:scale-[0.99]"
                    onClick={() => respond("attend")}
                  >
                    응원으로 함께하기
                  </button>
                  <button
                    className="h-14 rounded-xl border border-line-strong bg-paper text-base font-semibold text-ink transition hover:bg-navy/[0.04] active:scale-[0.99]"
                    onClick={() => respond("decline")}
                  >
                    이번엔 어려워요
                  </button>
                </div>
                {failed && <p className="mt-3 text-sm text-pink">전송하지 못했어요. 잠시 후 다시 눌러 주세요.</p>}
              </div>
            )}
          </div>

          {/* 리모컨에서 잠그면 반투명 레이어가 덮입니다. 풀면 사라지고 뒤의 화면이 그대로 이어집니다. */}
          <div
            aria-hidden={!locked}
            className={`absolute -inset-2 grid place-items-center rounded-xl bg-surface/75 backdrop-blur-[3px] transition-opacity duration-300 ${
              locked ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-navy text-white shadow-md">
                <svg
                  viewBox="0 0 24 24"
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <rect x="5" y="10.5" width="14" height="10" rx="2" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                </svg>
              </div>
              <p className="mt-3 text-lg font-bold">지금은 잠겨 있어요</p>
              <p className="mt-1 text-sm text-muted">잠금이 풀리면 바로 응답할 수 있어요</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <ProgressMeter stats={stats} />
        </div>
      </section>

      {/* 모바일에서는 고정 위치가 로고·버튼을 가려서 본문 아래에 둡니다. */}
      {showMockTools && <MockControls mutate={mutate} className="mx-auto mt-6" />}
    </main>
  );
}

function Result({ status, onChange }: { status: RsvpStatus; onChange: () => void }) {
  const attending = status === "attend";
  return (
    <div className="text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-white">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-4 text-lg font-bold">{attending ? "참여 신청이 완료되었어요" : "응답해 주셔서 감사해요"}</p>
      {attending && <p className="mt-1 text-sm text-muted">행사 당일에 반갑게 맞이할게요.</p>}
      <button className="mt-4 text-sm text-muted underline underline-offset-4" onClick={onChange}>
        응답 바꾸기
      </button>
    </div>
  );
}
