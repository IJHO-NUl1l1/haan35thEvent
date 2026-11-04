"use client";

import { EVENT, MOCK_TOOLS_ENABLED } from "@/config/event";
import { useCelebration } from "@/hooks/useCelebration";
import { useRsvpStats } from "@/hooks/useRsvpStats";
import { EventDetails, EventIntro } from "./EventInfo";
import { EventQr } from "./EventQr";
import { LogoSlot } from "./LogoSlot";
import { MockBadge } from "./MockBadge";
import { MockControls } from "./MockControls";
import { ProgressMeter } from "./ProgressMeter";

const showMockTools = MOCK_TOOLS_ENABLED || process.env.NODE_ENV === "development";

// 행사장 스크린/PC 에 띄우는 화면. QR 과 실시간 참여 인원을 보여줍니다.
export function DisplayView() {
  const { stats, mutate } = useRsvpStats(3000);
  useCelebration(!!stats && stats.attend >= stats.goal);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-6 sm:px-8 lg:pt-10">
        <div className="flex items-center gap-3">
          <LogoSlot className="h-11 w-32 sm:h-12 sm:w-40" />
          <span className="hidden text-sm font-medium text-muted sm:inline">{EVENT.orgName}</span>
        </div>
        {stats?.mock && <MockBadge label="MOCK 데이터" />}
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-10 sm:px-8 lg:py-8 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <section>
          <p className="flex items-end gap-3">
            <span className="text-[clamp(5.5rem,13vw,10rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-brand">
              35
            </span>
            <span className="pb-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted sm:text-sm">
              th
              <br />
              Anniversary
            </span>
          </p>
          <h1 className="mt-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {EVENT.orgName}
            <br />
            {EVENT.title}
          </h1>
          <EventIntro className="mt-5 max-w-xl" />
          <EventDetails className="mt-8 max-w-xl" />
        </section>

        <section className="mx-auto w-full max-w-xs sm:max-w-sm lg:mx-0 lg:max-w-[360px] lg:justify-self-end">
          <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
            <EventQr />
          </div>
          <p className="mt-6 text-center text-lg font-semibold sm:text-xl">휴대폰 카메라로 QR을 비춰 주세요</p>
          <p className="mt-1 text-center text-sm text-muted">참여 여부를 바로 알려 주실 수 있어요</p>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
          <ProgressMeter stats={stats} size="lg" />
        </div>
      </footer>

      {showMockTools && <MockControls mutate={mutate} />}
    </div>
  );
}
