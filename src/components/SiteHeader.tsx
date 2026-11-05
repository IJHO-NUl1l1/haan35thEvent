"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignalLightLogo } from "./SignalLightLogo";

const NAV = [
  { href: "/", label: "처음 화면" },
  { href: "/join", label: "참여하기" },
  { href: "/result", label: "결과 보기" },
];

// 모든 화면 공통 상단: 좌상단 로고(누르면 처음 화면) + 페이지 이동 메뉴.
// tone="water" 는 결과 화면에서 하늘색 물 위에 겹쳐 그려질 때 쓰는 남색 버전입니다.
export function SiteHeader({
  tone = "blue",
  className = "",
  children,
}: {
  tone?: "blue" | "water";
  className?: string;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const water = tone === "water";

  return (
    <header className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" aria-label="처음 화면으로" className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-white">
          <SignalLightLogo tone={water ? "navy" : "light"} />
        </Link>
        {children}
      </div>
      <nav aria-label="페이지 이동" className="flex items-center gap-1 text-sm font-semibold">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const colors = active
            ? water
              ? "bg-navy text-white"
              : "bg-white text-paper"
            : water
              ? "text-navy/75 hover:bg-navy/10"
              : "text-muted hover:bg-white/10 hover:text-white";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 transition-colors ${colors}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
