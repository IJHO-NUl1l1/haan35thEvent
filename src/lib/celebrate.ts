// 축하 이펙트(canvas-confetti). 브라우저에서만 불러옵니다.
// 파랑(진행) + 금색(달성)으로 통일. 흰 바탕이라 흰색은 뺐습니다.
const COLORS = ["#14a8e2", "#194886", "#7cc8ee", "#f4dc94", "#d6a541", "#b8862a"];
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

// 결과 화면(/result) 목표 달성 시 한 번: 샴페인이 터지듯 화면 아래 여러 곳에서 금빛 조각이 솟구치고,
// 이어서 화면 위쪽 여러 곳에서 금빛 별이 펑펑 터집니다.
export async function champagnePop() {
  const confetti = await loadConfetti();
  const compact = isCompact();
  const base = { colors: CHAMPAGNE, disableForReducedMotion: true };

  // 화면 아래 가로 여러 지점에서 금빛 조각이 분수처럼 솟구칩니다. 두 번 연달아 쏴서 풍성하게.
  // 가운데가 가장 크고 높게, 양옆은 바깥쪽으로 살짝 기울어 넓게 퍼집니다.
  const fountains = compact ? [0.12, 0.5, 0.88] : [0.08, 0.27, 0.5, 0.73, 0.92];
  [0, 220].forEach((wait, wave) => {
    setTimeout(() => {
      fountains.forEach((x) => {
        const center = x === 0.5;
        confetti({
          ...base,
          particleCount: Math.round((compact ? 45 : 90) * (center ? 1.6 : 1) * (wave === 0 ? 1 : 0.7)),
          angle: 90 + (0.5 - x) * 24,
          spread: compact ? 38 : 32,
          startVelocity: (compact ? 55 : 82) * (center ? 1.08 : 1),
          gravity: 0.9,
          scalar: compact ? 0.9 : 1.3,
          shapes: ["circle", "square"],
          origin: { x, y: 1.02 },
        });
      });
    }, wait);
  });

  // 화면 위쪽 여러 지점에서 별이 사방으로 펑펑 터진 뒤 천천히 내려옵니다. (가운데 → 바깥 순서로 번지듯)
  const bursts = compact
    ? [
        { x: 0.5, y: 0.3 },
        { x: 0.2, y: 0.22 },
        { x: 0.8, y: 0.22 },
      ]
    : [
        { x: 0.5, y: 0.28 },
        { x: 0.28, y: 0.2 },
        { x: 0.72, y: 0.2 },
        { x: 0.1, y: 0.35 },
        { x: 0.9, y: 0.35 },
      ];
  bursts.forEach((origin, i) => {
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: compact ? 45 : 90,
        spread: 360,
        startVelocity: compact ? 28 : 40,
        decay: 0.92,
        gravity: 0.45,
        ticks: 320,
        scalar: compact ? 0.9 : 1.3,
        shapes: ["star"],
        origin,
      });
    }, 650 + i * 160);
  });
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
