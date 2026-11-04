// 로고를 받기 전까지 자리만 잡아두는 빈 칸. 로고가 오면 <Image> 로 교체하세요.
export function LogoSlot({ className = "", label = "로고 들어갈 자리" }: { className?: string; label?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-100 px-3 text-center text-xs font-medium text-stone-400 ${className}`}
    >
      {label}
    </div>
  );
}
