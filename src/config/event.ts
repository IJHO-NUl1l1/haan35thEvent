// 행사 기본 정보.
// mock: true 인 값은 화면에 MOCK 배지가 붙습니다. 확정되면 값을 바꾸고 mock 을 false 로 바꾸세요.
export const EVENT = {
  orgName: "하안종합사회복지관",
  // 화면 제목 (두 줄)
  title: { kicker: "웹기반 온(ON)동네 복지안전망", name: '"Signal Light"' },
  // 소개 문구. 화면마다 따로 씁니다. lines 의 한 줄이 한 문단입니다.
  intro: {
    // 첫 화면 (행사장 스크린, /)
    display: {
      mock: false,
      lines: [
        '하안종합사회복지관은 웹기반 온(ON)동네 복지안전망 "Signal Light"를 통해 광명시의 구석구석으로 찾아가는 복지서비스를 실현하고자 합니다.',
        "'Signal Light'를 활용한 복지 사각지대 해소를 응원으로 함께 해주세요",
      ],
    },
    // QR 로 들어온 화면 (휴대폰, /join). 아직 첫 화면 문구를 그대로 복사해 둔 상태입니다.
    join: {
      mock: false,
      lines: [
        "'Signal Light'를 활용한 찾아가는 복지서비스의 복지 사각지대 해소를 응원으로 함께 해주세요",
      ],
    },
  },
  // 목표 인원. 이 숫자 하나만 바꾸면 모든 화면(진행 바, 결과 화면 물높이·눈금·문구, 리모컨, 목표 달성 버튼,
  // 축하 이펙트 시점)에 그대로 반영됩니다. 다른 파일에는 목표 숫자를 따로 적지 않습니다.
  goal: { mock: false, value: 300 },
} as const;
