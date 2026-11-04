"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EVENT, MOCK_TOOLS_ENABLED } from "@/config/event";
import { useCelebration } from "@/hooks/useCelebration";
import { useRsvpStats } from "@/hooks/useRsvpStats";
import { smallBurst } from "@/lib/celebrate";
import { getLocalVoterId, getMyStatus, setLocalVoterId, setMyStatus, subscribeMyStatus } from "@/lib/my-response";
import { fetchMyResponse, shiftStats, submitResponse, type RsvpStatus } from "@/lib/rsvp";
import { EventDetails, EventIntro } from "./EventInfo";
import { LogoSlot } from "./LogoSlot";
import { MockControls } from "./MockControls";
import { ProgressMeter } from "./ProgressMeter";

const showMockTools = MOCK_TOOLS_ENABLED || process.env.NODE_ENV === "development";

// QR 을 찍고 들어오는 모바일 화면. 참여/불참 응답 → 결과 화면.
export function JoinView() {
  const myStatus = useSyncExternalStore(subscribeMyStatus, getMyStatus, () => null);
  const { stats, mutate } = useRsvpStats(5000);
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
                className="h-14 rounded-xl bg-brand text-base font-semibold text-white transition active:scale-[0.99]"
                onClick={() => respond("attend")}
              >
                참여할게요
              </button>
              <button
                className="h-14 rounded-xl border border-line bg-white text-base font-semibold text-ink transition active:scale-[0.99]"
                onClick={() => respond("decline")}
              >
                이번엔 어려워요
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
      {showMockTools && <MockControls mutate={mutate} className="mx-auto mt-6" />}
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
