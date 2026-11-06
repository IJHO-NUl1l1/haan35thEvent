// 축하 이펙트(canvas-confetti). 브라우저에서만 불러옵니다.
// Signal Light 심볼 색 + 로고 파랑 (흰 바탕이라 흰색은 뺐습니다)
const COLORS = ["#14a8e2", "#11c0b1", "#aed843", "#e0267c", "#194886"];
// 결과 화면 샴페인 색: 밝은 거품색 ~ 진한 금색 + 흰 반짝이
const CHAMPAGNE = ["#fff6d8", "#f4dc94", "#e9c46a", "#d6a541", "#b8862a", "#ffffff"];

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
  const end = Date.now() + (compact ? 1200 : 1500);
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

// 첫 화면(/) 전용. PC 에서는 조각을 더 크게 하고 중앙 아래에서도 쏘아 올려 화면을 넉넉히 채웁니다.
// 휴대폰처럼 좁은 화면에서는 기존 celebrate() 와 똑같이 동작합니다.
export async function celebrateDisplay() {
  if (isCompact()) return celebrate();
  const confetti = await loadConfetti();
  const end = Date.now() + 1500;
  const shared = { scalar: 1.6, colors: COLORS, disableForReducedMotion: true };
  (function frame() {
    confetti({ ...shared, particleCount: 5, spread: 65, startVelocity: 55, angle: 60, origin: { x: 0, y: 0.75 } });
    confetti({ ...shared, particleCount: 5, spread: 65, startVelocity: 55, angle: 120, origin: { x: 1, y: 0.75 } });
    confetti({ ...shared, particleCount: 4, spread: 50, startVelocity: 70, angle: 90, origin: { x: 0.5, y: 1.05 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// 결과 화면(/result) 목표 달성 시 한 번: 샴페인 코르크가 터지듯 중앙 아래에서 금빛 조각이 솟구치고,
// 이어서 위에서 작은 금가루가 천천히 흩날립니다.
export async function champagnePop() {
  const confetti = await loadConfetti();
  const compact = isCompact();
  const base = { colors: CHAMPAGNE, disableForReducedMotion: true };

  confetti({
    ...base,
    particleCount: compact ? 70 : 160,
    angle: 90,
    spread: compact ? 40 : 34,
    startVelocity: compact ? 55 : 85,
    gravity: 0.9,
    scalar: compact ? 0.9 : 1.3,
    shapes: ["circle", "square"],
    origin: { x: 0.5, y: 1 },
  });

  setTimeout(() => {
    confetti({
      ...base,
      particleCount: compact ? 60 : 140,
      spread: 180,
      startVelocity: 12,
      gravity: 0.35,
      drift: 0.3,
      ticks: 400,
      scalar: compact ? 0.6 : 0.85,
      shapes: ["star", "circle"],
      origin: { x: 0.5, y: -0.05 },
    });
  }, 700);
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
