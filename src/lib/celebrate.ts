// 축하 이펙트(canvas-confetti). 브라우저에서만 불러옵니다.
const COLORS = ["#1f5a46", "#d9a441", "#e07a5f", "#f2e8cf"];

async function loadConfetti() {
  return (await import("canvas-confetti")).default;
}

// 목표 인원 달성 시: 양쪽에서 몇 초간 쏟아집니다.
export async function celebrate(durationMs = 3500) {
  const confetti = await loadConfetti();
  const end = Date.now() + durationMs;
  const shared = { particleCount: 5, spread: 65, colors: COLORS, disableForReducedMotion: true };
  (function frame() {
    confetti({ ...shared, angle: 60, origin: { x: 0, y: 0.75 } });
    confetti({ ...shared, angle: 120, origin: { x: 1, y: 0.75 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// 참여 버튼을 눌렀을 때 작은 한 번.
export async function smallBurst() {
  const confetti = await loadConfetti();
  confetti({ particleCount: 70, spread: 75, origin: { y: 0.8 }, colors: COLORS, disableForReducedMotion: true });
}
