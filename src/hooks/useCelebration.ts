"use client";

import { useEffect, useRef } from "react";
import { celebrate } from "@/lib/celebrate";

// active 가 처음 true 가 되는 순간 한 번만 축하 이펙트를 터뜨립니다.
export function useCelebration(active: boolean) {
  const fired = useRef(false);
  useEffect(() => {
    if (!active || fired.current) return;
    fired.current = true;
    celebrate();
  }, [active]);
}
