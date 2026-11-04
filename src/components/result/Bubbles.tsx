// 물 속에서 천천히 올라가는 기포. 서버·브라우저 렌더 결과가 같도록 난수 대신 고정 패턴으로 배치합니다.
const BUBBLES = Array.from({ length: 16 }, (_, i) => {
  const seed = (i * 37) % 100;
  return {
    left: `${(i * 61) % 100}%`,
    size: 4 + (seed % 9),
    duration: 9 + (seed % 7),
    delay: -((i * 1.7) % 12),
    drift: ((seed % 5) - 2) * 12,
  };
});

export function Bubbles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="animate-bubble absolute -bottom-4 rounded-full border border-white/40 bg-white/15"
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
