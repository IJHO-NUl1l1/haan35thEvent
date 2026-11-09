"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { EVENT } from "@/config/event";
import { useRsvpStats } from "@/hooks/useRsvpStats";
import { Finale } from "./Finale";
import { LiquidFill } from "./LiquidFill";
import { type Reaction, Reactions } from "./Reactions";
import { ResultContent } from "./ResultContent";

// 0명이어도 수면(물결)이 보이도록 최소 높이를 둡니다.
const MIN_LEVEL = 0.04;
// 인원이 늘 때 한 번에 터뜨리는 반응 수 / 화면에 동시에 떠 있는 최대 수
const MAX_BURST = 12;
const MAX_ON_SCREEN = 30;

const subscribeNothing = () => () => {};

// ?preview=0.7 처럼 붙이면 그 비율로 고정해서 보여줍니다 (디자인 확인용).
function readPreview() {
  const value = new URLSearchParams(window.location.search).get("preview");
  if (value === null) return null;
  const ratio = Number(value);
  return Number.isFinite(ratio) ? Math.min(1.5, Math.max(0, ratio)) : null;
}

// 최종 결과 화면: 참여 인원만큼 화면 아래에서 샴페인이 차오르고, 목표에 닿으면 축하 연출이 나옵니다.
export function ResultView() {
  const { stats } = useRsvpStats(3000);
  const preview = useSyncExternalStore(subscribeNothing, readPreview, () => null);
  const reduceMotion = useReducedMotion();

  const goal = stats?.goal ?? EVENT.goal.value;
  // 목표를 넘겨도 숫자는 계속 올라가고, 물은 가득 찬 상태를 유지합니다.
  const attend = preview !== null ? Math.round(goal * preview) : (stats?.attend ?? 0);
  const reached = (preview !== null || !!stats) && attend >= goal;
  const fill = Math.max(MIN_LEVEL, Math.min(1, attend / goal));

  // 물 높이: 스프링으로 살짝 넘쳤다가 자리를 잡아 출렁이는 느낌을 줍니다.
  // visualDuration 을 고정해서 +1 처럼 짧은 거리도 +10 과 같은 시간에 걸쳐 천천히 올라갑니다.
  const level = useSpring(0, { visualDuration: 1.8, bounce: 0.2 });
  // 흰 글자가 보이는 영역 = 수위 아래. (물결 가운데 선이 수위와 같아서 그대로 맞습니다)
  const clipPath = useTransform(level, (v) => `inset(${(1 - v) * 100}% 0 0 0)`);
  const waveScale = useMotionValue(1);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (reduceMotion) level.jump(fill);
    else level.set(fill);
  }, [fill, reduceMotion, level]);

  useEffect(() => {
    const controls = animate(count, attend, { duration: reduceMotion ? 0 : 1.4, ease: "easeOut" });
    return () => controls.stop();
  }, [attend, count, reduceMotion]);

  // 인원이 바뀌면 수면이 한 번 크게 출렁이고, 가득 찬 뒤에는 잔잔해집니다.
  useEffect(() => {
    if (reduceMotion) return;
    const calm = reached ? 0.35 : 1;
    // 현재 크기에서 서서히 커졌다가 잦아들게 합니다. (바로 2배로 튀면 +1 일 때 뚝 끊겨 보임)
    const controls = animate(waveScale, [waveScale.get(), 1.7, calm], {
      duration: 2.2,
      times: [0, 0.35, 1],
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [attend, reached, reduceMotion, waveScale]);

  // 새 참여자가 생기면 늘어난 인원만큼 하트·따봉이 화면 곳곳에서 인스타 하트처럼 터집니다. (렌더 중 이전 값과 비교해 상태를 맞추는 패턴)
  // 한 번에 많이 늘면(목표 채우기 등) 화면이 뒤덮이지 않게 최대 MAX_BURST 번까지만 띄웁니다.
  const [prevAttend, setPrevAttend] = useState<number | null>(null);
  // 초기화 후 같은 숫자 변화가 반복될 수 있어서, 키는 계속 증가하는 일련번호로 붙입니다.
  const [reactions, setReactions] = useState<{ nextId: number; list: Reaction[] }>({ nextId: 0, list: [] });
  if ((stats || preview !== null) && attend !== prevAttend) {
    if (prevAttend !== null && attend > prevAttend && !reduceMotion) {
      const burst = Math.min(attend - prevAttend, MAX_BURST);
      setReactions(({ nextId, list }) => ({
        nextId: nextId + burst,
        list: [...list, ...Array.from({ length: burst }, (_, order) => ({ id: nextId + order, order }))].slice(-MAX_ON_SCREEN),
      }));
    }
    setPrevAttend(attend);
  }
  const removeReaction = useCallback(
    (id: number) => setReactions((s) => ({ ...s, list: s.list.filter((x) => x.id !== id) })),
    [],
  );

  const badges = [
    ...(stats?.mock ? ["MOCK 데이터"] : []),
    ...(stats?.goalMock ? ["목표 인원 MOCK"] : []),
    ...(preview !== null ? ["PREVIEW"] : []),
  ];
  const contentProps = { count: rounded, attend, goal, reached, badges };

  return (
    <div className="relative h-dvh select-none overflow-hidden bg-paper">
      <ResultContent tone="above" {...contentProps} />
      <LiquidFill level={level} waveScale={waveScale} />
      <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath }} aria-hidden>
        <ResultContent tone="below" {...contentProps} />
      </motion.div>

      <Reactions list={reactions.list} onDone={removeReaction} />

      {reached && !reduceMotion && <Finale />}

    </div>
  );
}
