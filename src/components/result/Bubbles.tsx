// 샴페인 속에서 올라가는 기포. 서버·브라우저 렌더 결과가 같도록 난수 대신 고정 패턴으로 배치합니다.
// 실제 샴페인처럼 바닥 몇 군데에서 줄지어 올라오는 작은 기포 + 사이사이 흩어진 큰 기포.
const STREAMS = [6, 15, 24, 33, 44, 55, 63, 72, 81, 90];

const STREAM_BUBBLES = Array.from({ length: 40 }, (_, i) => {
  const seed = (i * 37) % 100;
  return {
    left: `${STREAMS[i % STREAMS.length] + ((seed % 5) - 2) * 0.3}%`,
    size: 3 + (seed % 4),
    duration: 4.5 + (seed % 5) * 0.6,
    delay: -((i * 0.83) % 7),
    drift: ((seed % 3) - 1) * 6,
  };
});

const LOOSE_BUBBLES = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 53) % 100;
  return {
    left: `${(i * 61 + 7) % 100}%`,
    size: 6 + (seed % 7),
    duration: 8 + (seed % 6),
    delay: -((i * 1.7) % 12),
    drift: ((seed % 5) - 2) * 12,
  };
});

const BUBBLES = [...STREAM_BUBBLES, ...LOOSE_BUBBLES];

export function Bubbles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="animate-bubble absolute -bottom-4 rounded-full border border-white bg-white/50 shadow-[inset_0_0_2px_rgb(154_106_16/0.35)]"
          style={
            {
              left: b.left,
              width: b.size,
              height: b.size,
              animation: `bubble-rise ${b.duration}s linear ${b.delay}s infinite`,
              "--drift": `${b.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
