import { motion, type MotionValue } from "motion/react";

const WIDTH = 2400; // 화면 너비의 2배. 절반만큼 흘러가면 처음과 같은 모양이 되어 끊김 없이 반복됩니다.
const HEIGHT = 48;

// 같은 모양이 반복되는 사인파 경로. 아래쪽은 막아서 물 본체와 이어지게 합니다.
function wavePath(amplitude: number, wavelength: number) {
  const mid = HEIGHT / 2;
  let d = `M0,${mid} Q${wavelength / 4},${mid - amplitude} ${wavelength / 2},${mid}`;
  for (let x = wavelength; x <= WIDTH; x += wavelength / 2) d += ` T${x},${mid}`;
  return `${d} V${HEIGHT} H0 Z`;
}

const LAYERS = [
  { amplitude: 14, wavelength: 800, duration: 11, reverse: false, className: "fill-water opacity-30" },
  { amplitude: 10, wavelength: 600, duration: 7, reverse: true, className: "fill-water opacity-55" },
  { amplitude: 7, wavelength: 400, duration: 5, reverse: false, className: "fill-water" },
];

// 수면 위의 물결 여러 겹. scale 로 출렁임 세기를 조절합니다 (새 참여자 반응, 가득 찼을 때 잔잔하게).
// 물결의 가운데 선이 실제 수위와 일치하도록 물 본체 윗변에 반쯤 걸쳐 두고, 가운데를 기준으로 늘립니다.
// 아래 절반이 물 본체와 겹치므로 둘 사이에 이음선이 생기지 않습니다.
export function Waves({ scale }: { scale: MotionValue<number> }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0 h-12 -translate-y-1/2 origin-center"
      style={{ scaleY: scale }}
      aria-hidden
    >
      {LAYERS.map((layer) => (
        <svg
          key={layer.duration}
          className={`animate-wave absolute bottom-0 left-0 h-full w-[200%] ${layer.className}`}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          style={{
            animation: `wave-x ${layer.duration}s linear infinite`,
            animationDirection: layer.reverse ? "reverse" : "normal",
          }}
        >
          <path d={wavePath(layer.amplitude, layer.wavelength)} />
        </svg>
      ))}
    </motion.div>
  );
}
