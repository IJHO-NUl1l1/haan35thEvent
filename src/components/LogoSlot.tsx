// 로고를 받기 전까지 자리만 잡아두는 빈 칸. 로고가 오면 <Image> 로 교체하세요.
// tone="light" 는 어두운 배경(결과 페이지의 물 속) 위에 놓일 때 사용합니다.
export function LogoSlot({
  className = "",
  label = "로고 들어갈 자리",
  tone = "dark",
}: {
  className?: string;
  label?: string;
  tone?: "dark" | "light";
}) {
  const colors =
    tone === "dark" ? "border-stone-300 bg-stone-100 text-stone-400" : "border-white/40 bg-white/10 text-white/70";
  return (
    <div
      className={`flex items-center justify-center rounded-xl border-2 border-dashed px-3 text-center text-xs font-medium ${colors} ${className}`}
    >
      {label}
    </div>
  );
}
