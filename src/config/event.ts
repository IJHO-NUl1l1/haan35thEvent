// MOCK 테스트 도구(+1 / +10 참여, 초기화)를 배포 환경에서도 보여줄지 여부.
// 켜져 있으면 누구나 실제 DB 에 가짜 참여자를 넣거나 전부 지울 수 있으니, 행사 전에 반드시 false 로 바꾸세요.
// 개발 서버에서는 이 값과 상관없이 항상 보입니다.
export const MOCK_TOOLS_ENABLED = true;

// 행사 기본 정보.
// mock: true 인 값은 화면에 MOCK 배지가 붙습니다. 확정되면 값을 바꾸고 mock 을 false 로 바꾸세요.
export const EVENT = {
  orgName: "하안종합사회복지관",
  // 화면 제목 (두 줄)
  title: { kicker: "웹기반 온(ON)동네 복지안전망", name: '"Signal Light"' },
  intro: {
    mock: true,
    lines: [
      "하안종합사회복지관은 웹기반 온(ON)",
      "오셔서 자리를 빛내 주세요.",
    ],
  },
  // 참여 인원이 이 숫자에 도달하면 축하 이펙트가 터집니다.
  goal: { mock: false, value: 100 },
} as const;
