-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
create table if not exists public.rsvp_responses (
  voter_id   text primary key,
  status     text not null check (status in ('attend', 'decline')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 브라우저에서 직접 접근하지 못하도록 RLS 를 켜고 정책은 두지 않습니다.
-- 서버(API Route)는 secret key 로 접근하므로 RLS 의 영향을 받지 않습니다.
alter table public.rsvp_responses enable row level security;
