// 축하 이펙트(canvas-confetti). 브라우저에서만 불러옵니다.
const COLORS = ["#1f5a46", "#d9a441", "#e07a5f", "#f2e8cf"];

async function loadConfetti() {
  return (await import("canvas-confetti")).default;
}

// 휴대폰처럼 좁은 화면에서는 개수·속도·크기를 줄여 화면을 덮지 않게 합니다.
function isCompact() {
  return window.matchMedia("(max-width: 640px)").matches;
}

// 목표 인원 달성 시: 양쪽에서 몇 초간 쏟아집니다.
export async function celebrate() {
  const confetti = await loadConfetti();
  const compact = isCompact();
  const end = Date.now() + (compact ? 1300 : 1800);
  const shared = {
    particleCount: compact ? 2 : 5,
    spread: compact ? 45 : 65,
    startVelocity: compact ? 28 : 45,
    scalar: compact ? 0.7 : 1,
    colors: COLORS,
    disableForReducedMotion: true,
  };
  (function frame() {
    confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.75 } });
    confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.75 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// 참여 버튼을 눌렀을 때 작은 한 번.
export async function smallBurst() {
  const confetti = await loadConfetti();
  const compact = isCompact();
  confetti({
    particleCount: compact ? 40 : 70,
    spread: compact ? 60 : 75,
    startVelocity: compact ? 30 : 45,
    scalar: compact ? 0.75 : 1,
    origin: { y: 0.8 },
    colors: COLORS,
    disableForReducedMotion: true,
  });
}
