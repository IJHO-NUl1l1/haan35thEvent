"use client";

import { useEffect, useRef } from "react";
import { celebrate } from "@/lib/celebrate";

// active 가 false → true 로 바뀔 때마다 축하 이펙트를 한 번 터뜨립니다.
// 목표 아래로 내려가면(초기화 등) 다시 터질 수 있게 기억을 지웁니다. 새로고침 없이도 재달성 시 다시 터집니다.
// effect 를 넘기면 화면별로 다른 이펙트를 씁니다. (예: 첫 화면은 celebrateDisplay)
export function useCelebration(active: boolean, effect: () => void = celebrate) {
  const fired = useRef(false);
  useEffect(() => {
    if (!active) {
      fired.current = false;
      return;
    }
    if (fired.current) return;
    fired.current = true;
    effect();
  }, [active, effect]);
}
