This is Website for haan 35th Year Event

하안종합사회복지관 개관 35주년 기념행사 참여 페이지 (Next.js 16 + Tailwind CSS 4).

## 흐름

```
[행사장 스크린  /]  ── QR(/go) ──▶  [/go]  ── redirect ──▶  [모바일 /join]
   QR + 실시간 참여 인원                                       참여 / 불참 응답
   목표 인원 달성 시 축하 이펙트                                결과 화면 + 참여 현황
```

- `/` 행사장 PC·스크린용. 3초마다 집계를 새로 불러오고, 목표 인원에 도달하면 축하 이펙트가 터집니다.
- `/go` QR에 들어가는 고정 주소. 목적지를 바꿀 때는 `src/app/go/page.tsx`만 고치면 되고, QR은 다시 인쇄하지 않아도 됩니다.
- `/join` QR로 들어오는 모바일 화면. 기기마다 응답이 하나만 집계되고, 다시 응답하면 이전 응답을 덮어씁니다.

## 구조

```
src/
  config/event.ts        행사 정보·문구·목표 인원 (mock 플래그로 MOCK 배지 표시)
  app/
    page.tsx             행사장 화면
    join/page.tsx        모바일 응답 화면
    go/page.tsx          QR 리다이렉트
    api/rsvp/route.ts    GET 집계 / POST 응답 / DELETE 초기화(개발 전용)
  components/            DisplayView, JoinView, EventQr, ProgressMeter, LogoSlot, MockBadge ...
  lib/
    rsvp-store.ts        저장소 (현재 MOCK: 서버 메모리) ← DB 연결 시 이 파일만 교체
    rsvp.ts              공용 타입 + API 호출
    my-response.ts       이 기기의 응답 기억 (localStorage)
    celebrate.ts         축하 이펙트 (canvas-confetti)
```

## 교체해야 할 것

- **로고**: `LogoSlot`(회색 점선 칸)을 실제 로고 `<Image>`로 바꿉니다.
- **MOCK 값**: `src/config/event.ts`의 문구·일시·장소·목표 인원. 확정되면 값을 바꾸고 `mock: false`로 설정합니다.
- **DB (Supabase)**: `supabase/schema.sql`을 Supabase SQL Editor에서 실행하고, `.env.local`에 `SUPABASE_SECRET_KEY`를 넣으면 Supabase에 저장됩니다. 키가 없으면 MOCK(서버 메모리)으로 동작하며, 재시작하면 초기화되고 Vercel처럼 인스턴스가 여러 개인 환경에서는 집계가 맞지 않습니다.
- **브랜드 색**: `src/app/globals.css`의 `--color-brand` 계열을 로고 색에 맞춥니다.
- **도메인**: 배포 후 환경변수 `NEXT_PUBLIC_SITE_URL`에 실제 주소를 넣으면 QR이 그 주소로 만들어집니다.

## 실행

```bash
npm install
npm run dev
```

- 개발 서버의 행사장 화면 상단에는 `MOCK 테스트` 도구(+1 / +10 참여, 초기화)가 있어 축하 이펙트를 바로 확인할 수 있습니다. 배포 빌드에서는 보이지 않습니다.
- 휴대폰으로 QR을 테스트하려면 PC와 같은 Wi-Fi에서 `http://<PC 내부 IP>:3000`으로 행사장 화면을 열어야 합니다. `localhost`로 열면 QR에도 localhost가 들어가 휴대폰에서 열리지 않습니다.
