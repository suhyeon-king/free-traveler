-- DB-SCHEMA-BASE — Supabase 테이블 스키마(6개 제한)
-- REQ-FUNC-028/029/030/031/034/037/038/039/040/041/042/077
--
-- 정확히 6개 테이블만 만든다: profiles, mate_posts, mate_applications,
-- user_blocks, reports, app_settings. 그 이상 추가하지 않는다(DEC-006).
-- 여행지·안전정보·대표 소개는 이 스키마에 포함하지 않는다(src/data 정적 데이터로 관리).

create extension if not exists pgcrypto;

-- 공통 updated_at 자동 갱신 트리거 함수.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — 닉네임/연령대/성별(선택)/여행 스타일/성인 확인 상태(REQ-FUNC-028/029)
-- 정확한 생년월일은 저장하지 않는다(is_adult, adult_verified_at만 저장).
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  age_range text not null check (
    age_range in ('19-24', '25-29', '30-34', '35-39', '40-49', '50+')
  ),
  gender text check (gender in ('male', 'female', 'undisclosed')),
  travel_style text[] not null default '{}',
  is_adult boolean not null default false,
  adult_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_travel_style_not_empty check (cardinality(travel_style) > 0)
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- mate_posts — 동행 모집글(REQ-FUNC-030/031/037/038)
-- end_date 경과 여부에 따른 자동 마감 표시는 배치 작업 없이 조회 시 계산한다
-- (DB-ACCESS 계층 책임). status 컬럼은 작성자의 수동 마감만 반영한다.
-- ---------------------------------------------------------------------------
create table mate_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  country text not null,
  region text,
  start_date date not null,
  end_date date not null,
  headcount integer not null check (headcount >= 1),
  age_range text,
  gender_preference text check (gender_preference in ('male', 'female', 'any')),
  travel_style text[] not null default '{}',
  title text not null check (char_length(title) between 1 and 100),
  description text not null check (char_length(description) between 1 and 2000),
  status text not null default 'RECRUITING' check (status in ('RECRUITING', 'CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mate_posts_date_range check (end_date >= start_date)
);

create index mate_posts_country_idx on mate_posts (country);
create index mate_posts_author_idx on mate_posts (author_id);

create trigger mate_posts_set_updated_at
  before update on mate_posts
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- mate_applications — 참가 요청(REQ-FUNC-034)
-- 500자 이내 참가 메시지. 작성자/요청자만 열람 가능하도록 RLS로 제한한다
-- (DB-RLS-BASE 책임). 동일 글에 대한 중복 PENDING/ACCEPTED 요청은 부분 유니크
-- 인덱스로 차단한다.
-- ---------------------------------------------------------------------------
create table mate_applications (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references mate_posts (id) on delete cascade,
  applicant_id uuid not null references profiles (id) on delete cascade,
  message text not null check (char_length(message) <= 500),
  status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index mate_applications_unique_active
  on mate_applications (post_id, applicant_id)
  where status in ('PENDING', 'ACCEPTED');

create trigger mate_applications_set_updated_at
  before update on mate_applications
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- user_blocks — 사용자 간 차단 관계(REQ-FUNC-040)
-- ---------------------------------------------------------------------------
create table user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references profiles (id) on delete cascade,
  blocked_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_no_self_block check (blocker_id <> blocked_id),
  constraint user_blocks_unique_pair unique (blocker_id, blocked_id)
);

-- ---------------------------------------------------------------------------
-- reports — 글·사용자·요청 신고(REQ-FUNC-039/041/042)
-- 상태 변경(처리 완료/기각)만 제공하며, 세분화된 제재 워크플로와 범용 감사
-- 로그는 만들지 않는다(EXCLUDED: REQ-FUNC-056/076).
-- ---------------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  target_type text not null check (target_type in ('POST', 'USER', 'APPLICATION')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 1 and 1000),
  status text not null default 'OPEN' check (
    status in ('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_status_idx on reports (status);

create trigger reports_set_updated_at
  before update on reports
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- app_settings — 관리자가 설정하는 항공·숙소 외부 URL(REQ-FUNC-077)
-- HTTPS 허용목록만 저장한다. Key-Value 구조이며 허용 Key를 제한한다.
-- ---------------------------------------------------------------------------
create table app_settings (
  key text primary key check (key in ('flight_outbound_url', 'hotel_outbound_url')),
  value text not null check (value ~ '^https://'),
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles (id)
);

create trigger app_settings_set_updated_at
  before update on app_settings
  for each row
  execute function set_updated_at();
