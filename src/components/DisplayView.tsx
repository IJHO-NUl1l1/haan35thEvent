"use client";

import { MOCK_TOOLS_ENABLED } from "@/config/event";
import { useCelebration } from "@/hooks/useCelebration";
import { useRsvpStats } from "@/hooks/useRsvpStats";
import { celebrateDisplay } from "@/lib/celebrate";
import { EventIntro, EventTitle } from "./EventInfo";
import { EventQr } from "./EventQr";
import { MockControls } from "./MockControls";
import { ProgressMeter } from "./ProgressMeter";
import { SignalLightLogo } from "./SignalLightLogo";
import { SiteHeader } from "./SiteHeader";

const showMockTools = MOCK_TOOLS_ENABLED || process.env.NODE_ENV === "development";

// 행사장 스크린/PC 에 띄우는 화면. QR 과 실시간 참여 인원을 보여줍니다.
export function DisplayView() {
  const { stats, mutate } = useRsvpStats(3000);
  useCelebration(!!stats && stats.attend >= stats.goal, celebrateDisplay);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader className="mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8 lg:pt-8" />

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:gap-20 lg:py-8">
        <section>
          <SignalLightLogo className="text-[1.4px] sm:text-[1.8px]" />
          {/* 심볼 네 가지 색을 짧은 띠로 */}
          <div className="mt-8 flex gap-1.5" aria-hidden>
            <span className="h-1.5 w-10 rounded-full bg-brand" />
            <span className="h-1.5 w-10 rounded-full bg-teal" />
            <span className="h-1.5 w-10 rounded-full bg-signal" />
            <span className="h-1.5 w-10 rounded-full bg-pink" />
          </div>
          <EventTitle className="mt-6 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl" />
          <EventIntro page="display" className="mt-5 max-w-xl" />
        </section>

        <section className="mx-auto w-full max-w-xs sm:max-w-sm lg:mx-0 lg:max-w-[360px] lg:justify-self-end">
          {/* 흰 바탕 위에서 QR 이 묻히지 않게 로고 파랑 액자에 담습니다. QR 자체는 인식률 때문에 흰 바탕 유지 */}
          <div className="rounded-[28px] bg-primary p-3 shadow-[0_24px_60px_-24px_rgb(13_42_82/0.55)]">
            <div className="rounded-2xl bg-white p-5 sm:p-6">
              <EventQr />
            </div>
            <div className="px-3 pb-3 pt-5 text-center text-white">
              <p className="text-lg font-semibold sm:text-xl">휴대폰 카메라로 QR을 비춰 주세요</p>
              <p className="mt-1 text-sm text-white/75">참여 여부를 바로 알려 주실 수 있어요</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
          <ProgressMeter stats={stats} size="lg" />
        </div>
      </footer>

      {showMockTools && <MockControls mutate={mutate} className="fixed left-1/2 top-3 z-20 -translate-x-1/2" />}
    </div>
  );
}
