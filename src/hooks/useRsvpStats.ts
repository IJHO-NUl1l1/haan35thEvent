"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStats, type RsvpStats } from "@/lib/rsvp";

// 일정 간격으로 집계를 다시 불러옵니다. 행사장 화면이 실시간처럼 보이게 하는 용도.
export function useRsvpStats(intervalMs: number) {
  const [stats, setStats] = useState<RsvpStats | null>(null);
  // 값을 바꿀 때마다 올라가는 번호. 그보다 먼저 출발한 요청의 결과는 버려서 숫자가 되돌아가지 않게 합니다.
  const version = useRef(0);

  // 일시적인 네트워크 오류는 무시하고 다음 주기에 다시 시도합니다.
  const refresh = useCallback(() => {
    const startedAt = version.current;
    return fetchStats().then(
      (next) => {
        if (version.current === startedAt) setStats(next);
      },
      () => {},
    );
  }, []);

  // 낙관적 업데이트: 화면부터 즉시 바꾸고, 서버 응답이 오면 가장 마지막 요청의 결과로 맞춥니다.
  // 실패하면 서버 값으로 되돌리고 에러를 던집니다.
  const mutate = useCallback(
    async <T extends RsvpStats>(optimistic: (current: RsvpStats) => RsvpStats, request: () => Promise<T>) => {
      const id = ++version.current;
      setStats((current) => current && optimistic(current));
      try {
        const result = await request();
        if (version.current === id) setStats(result);
        return result;
      } catch (error) {
        if (version.current === id) refresh();
        throw error;
      }
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return { stats, refresh, mutate };
}
