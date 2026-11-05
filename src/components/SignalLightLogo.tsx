import Image from "next/image";

// "온(ON)동네 복지안전망 Signal Light" 로고. 받은 시안(227×68px)의 치수·색을 그대로 옮겼습니다.
// 모든 치수는 시안 픽셀값을 em 으로 적어 두었고, 바깥에서 font-size 로 배율을 정합니다.
// 예) text-[1px] = 시안 원본 크기, text-[1.5px] = 1.5배
const LINES = [
  { text: "온(ON)동네 복지안전망", top: 5.5, size: 11.8, spacing: 0, className: "text-[#DAE6F6]" },
  { text: "Signal Light", top: 22.5, size: 19, spacing: 0, className: "font-bold text-white" },
  { text: "광명시립 하안종합사회복지관", top: 50.5, size: 13.5, spacing: 0.02, className: "font-medium text-[#DAE6F6]" },
];

export function SignalLightLogo({ className = "text-[1px]" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="온(ON)동네 복지안전망 Signal Light, 광명시립 하안종합사회복지관"
      className={`relative shrink-0 whitespace-nowrap bg-[#194886] leading-none ${className}`}
      style={{ width: "227em", height: "68em" }}
    >
      <Image
        src="/symbol.webp"
        alt=""
        width={48}
        height={48}
        className="absolute"
        style={{ left: "7.5em", top: "12.8em", width: "44em", height: "44em" }}
      />
      {/* 위치(em)는 바깥 배율 기준, 글자 크기는 안쪽 span 에서 따로 지정 */}
      {LINES.map((line) => (
        <div key={line.text} className="absolute" style={{ left: "64em", top: `${line.top}em` }} aria-hidden>
          <span
            className={`block ${line.className}`}
            style={{ fontSize: `${line.size}em`, letterSpacing: `${line.spacing}em` }}
          >
            {line.text}
          </span>
        </div>
      ))}
    </div>
  );
}
