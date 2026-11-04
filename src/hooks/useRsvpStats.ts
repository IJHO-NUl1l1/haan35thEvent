"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchStats, type RsvpStats } from "@/lib/rsvp";

// 일정 간격으로 집계를 다시 불러옵니다. 행사장 화면이 실시간처럼 보이게 하는 용도.
export function useRsvpStats(intervalMs: number) {
  const [stats, setStats] = useState<RsvpStats | null>(null);

  // 일시적인 네트워크 오류는 무시하고 다음 주기에 다시 시도합니다.
  const refresh = useCallback(() => fetchStats().then(setStats, () => {}), []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { stats, setStats, refresh };
}
