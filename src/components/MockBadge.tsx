// 확정되지 않은 값 옆에 붙이는 표시. 실제 값으로 바꾸면 함께 제거하세요.
export function MockBadge({ label = "MOCK" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 align-middle text-[10px] font-bold leading-none tracking-wider text-amber-700">
      {label}
    </span>
  );
}
