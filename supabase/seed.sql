-- DB-SEED-BASE — 로컬 개발용 Seed 데이터
--
-- 로컬 개발/E2E 테스트 환경(`supabase start` + `supabase db reset`)에서만 사용한다.
-- 실제 개인정보를 포함하지 않으며 전부 가상 데이터다. 6개 테이블 범위 안에서만
-- 데이터를 생성한다.

-- 테스트용 auth.users. 로컬 Supabase(Docker)에서만 유효한 더미 계정이며,
-- 실제 서비스 배포 프로젝트에는 이 INSERT를 적용하지 않는다.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'seed-user-1@example.com', crypt('seed-password', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'seed-user-2@example.com', crypt('seed-password', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'seed-admin@example.com', crypt('seed-password', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"],"role":"admin"}', '{}'
  )
on conflict (id) do nothing;

insert into profiles (id, nickname, age_range, gender, travel_style, is_adult, adult_verified_at)
values
  (
    '11111111-1111-1111-1111-111111111111', '여행하는수현', '25-29', 'female',
    array['배낭여행', '도시여행'], true, now()
  ),
  (
    '22222222-2222-2222-2222-222222222222', '산책러', '30-34', 'male',
    array['자연여행', '미식여행'], true, now()
  ),
  (
    '33333333-3333-3333-3333-333333333333', '운영자', '35-39', 'undisclosed',
    array['운영'], true, now()
  )
on conflict (id) do nothing;

insert into mate_posts (
  id, author_id, country, region, start_date, end_date, headcount,
  age_range, gender_preference, travel_style, title, description, status
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111',
    '일본', '도쿄', current_date + 30, current_date + 34, 3,
    '25-29', 'any', array['도시여행', '미식여행'],
    '도쿄 벚꽃 시즌 함께 걸을 동행 구합니다',
    '도쿄 도심을 여유롭게 걸으며 벚꽃 명소를 둘러볼 동행을 찾습니다. 사진 촬영에 관심 있으신 분 환영합니다.',
    'RECRUITING'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
    '베트남', '다낭', current_date - 10, current_date - 5, 2,
    '30-34', 'any', array['휴양', '미식여행'],
    '다낭 해변 휴양 동행(마감 표시 테스트용)',
    'end_date가 이미 지난 샘플 모집글이다. 배치 작업 없이 조회 시 자동 마감 표시가 되는지 확인하는 용도다(REQ-FUNC-037).',
    'RECRUITING'
  )
on conflict (id) do nothing;

insert into mate_applications (id, post_id, applicant_id, message, status)
values
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    '안녕하세요! 저도 벚꽃 시즌에 도쿄 여행을 계획 중인데 함께하고 싶습니다.',
    'PENDING'
  )
on conflict (id) do nothing;

insert into reports (id, reporter_id, target_type, target_id, reason, status)
values
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'POST',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '게시글 본문에 개인 연락처를 직접 노출하고 있어 신고합니다(샘플 데이터).',
    'OPEN'
  )
on conflict (id) do nothing;

insert into app_settings (key, value)
values
  ('flight_outbound_url', 'https://www.google.com/travel/flights'),
  ('hotel_outbound_url', 'https://www.google.com/travel/hotels')
on conflict (key) do update set value = excluded.value;
