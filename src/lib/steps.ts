// 목표 인원에 맞춰 자동으로 정하는 "깔끔한 숫자"들. 목표(config/event.ts)만 바꾸면 눈금·버튼 단위가 같이 바뀝니다.

// x 에 가장 가까운 깔끔한 정수 (1, 2, 2.5, 5 × 10ⁿ). 예) 62.5 → 50, 25 → 25, 12 → 10
export function niceNumber(x: number) {
  if (x <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(x));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).filter(Number.isInteger);
  return candidates.reduce((best, c) => (Math.abs(c - x) < Math.abs(best - x) ? c : best));
}

// 리모컨 ±버튼 단위: 한 명씩 + 다섯 명씩 + 목표의 약 1/10 + 약 1/5. 예) 목표 100 → 1·5·10·20, 250 → 1·5·25·50
export function quickSteps(goal: number) {
  return [...new Set([1, 5, niceNumber(goal / 10), niceNumber(goal / 5)])].sort((a, b) => a - b);
}

// MOCK 테스트의 큰 단위 (+1 옆 버튼). 목표의 약 1/10. 예) 목표 100 → 10, 250 → 25
export function mockStep(goal: number) {
  return Math.max(2, niceNumber(goal / 10));
}
