-- DB-RLS-BASE — Row Level Security 정책
-- REQ-FUNC-044, REQ-NF-013
--
-- 본인 글·요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터를 열람할 수 있게
-- 하고, 차단 관계는 상호 비노출되도록 쿼리 필터를 건다. Admin/Moderator 여부는
-- 새 테이블이나 profiles 컬럼을 추가하지 않고 Supabase Auth의 JWT
-- `app_metadata.role` 클레임으로 판별한다(6개 테이블 제한 유지, DEC-006).
-- service_role 키는 RLS를 완전히 우회하므로 Client 코드에는 두지 않는다
-- (CLAUDE.md 규칙 14/15) — 이 정책은 anon/authenticated 세션 기준으로만 검증된다.

create or replace function is_admin_or_moderator()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'moderator'),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

create policy profiles_select_authenticated
  on profiles for select
  to authenticated
  using (true);

create policy profiles_insert_self
  on profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_self_or_admin
  on profiles for update
  to authenticated
  using (id = auth.uid() or is_admin_or_moderator())
  with check (id = auth.uid() or is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- mate_posts — 공개 목록(비로그인 포함)이지만 차단 관계는 상호 비노출한다.
-- ---------------------------------------------------------------------------
alter table mate_posts enable row level security;

create policy mate_posts_select_public_excluding_blocked
  on mate_posts for select
  using (
    auth.uid() is null
    or is_admin_or_moderator()
    or not exists (
      select 1
      from user_blocks b
      where (b.blocker_id = auth.uid() and b.blocked_id = mate_posts.author_id)
         or (b.blocker_id = mate_posts.author_id and b.blocked_id = auth.uid())
    )
  );

create policy mate_posts_insert_own
  on mate_posts for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from profiles p where p.id = auth.uid() and p.is_adult = true
    )
  );

create policy mate_posts_update_own_or_admin
  on mate_posts for update
  to authenticated
  using (author_id = auth.uid() or is_admin_or_moderator())
  with check (author_id = auth.uid() or is_admin_or_moderator());

create policy mate_posts_delete_own_or_admin
  on mate_posts for delete
  to authenticated
  using (author_id = auth.uid() or is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- mate_applications — 요청자·글 작성자·Moderator/Admin만 열람(REQ-FUNC-034/044).
-- ---------------------------------------------------------------------------
alter table mate_applications enable row level security;

create policy mate_applications_select_involved_or_admin
  on mate_applications for select
  to authenticated
  using (
    applicant_id = auth.uid()
    or is_admin_or_moderator()
    or exists (
      select 1 from mate_posts p
      where p.id = mate_applications.post_id and p.author_id = auth.uid()
    )
  );

create policy mate_applications_insert_own
  on mate_applications for insert
  to authenticated
  with check (
    applicant_id = auth.uid()
    and exists (
      select 1 from profiles pr where pr.id = auth.uid() and pr.is_adult = true
    )
    and not exists (
      select 1
      from mate_posts p
      join user_blocks b
        on (b.blocker_id = auth.uid() and b.blocked_id = p.author_id)
        or (b.blocker_id = p.author_id and b.blocked_id = auth.uid())
      where p.id = mate_applications.post_id
    )
  );

create policy mate_applications_update_post_author_or_admin
  on mate_applications for update
  to authenticated
  using (
    is_admin_or_moderator()
    or exists (
      select 1 from mate_posts p
      where p.id = mate_applications.post_id and p.author_id = auth.uid()
    )
  )
  with check (
    is_admin_or_moderator()
    or exists (
      select 1 from mate_posts p
      where p.id = mate_applications.post_id and p.author_id = auth.uid()
    )
  );

create policy mate_applications_delete_own_or_admin
  on mate_applications for delete
  to authenticated
  using (applicant_id = auth.uid() or is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- user_blocks — 본인 차단 목록만 열람·관리한다.
-- ---------------------------------------------------------------------------
alter table user_blocks enable row level security;

create policy user_blocks_select_own_or_admin
  on user_blocks for select
  to authenticated
  using (blocker_id = auth.uid() or is_admin_or_moderator());

create policy user_blocks_insert_own
  on user_blocks for insert
  to authenticated
  with check (blocker_id = auth.uid());

create policy user_blocks_delete_own
  on user_blocks for delete
  to authenticated
  using (blocker_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reports — 신고자와 Moderator/Admin만 열람. 대상자는 볼 수 없다.
-- ---------------------------------------------------------------------------
alter table reports enable row level security;

create policy reports_select_own_or_admin
  on reports for select
  to authenticated
  using (reporter_id = auth.uid() or is_admin_or_moderator());

create policy reports_insert_own
  on reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy reports_update_admin_only
  on reports for update
  to authenticated
  using (is_admin_or_moderator())
  with check (is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- app_settings — 항공·숙소 외부 URL은 비로그인 사용자도 읽어야 한다(공개 설정값).
-- 변경은 Admin/Moderator만 가능하다(REQ-FUNC-077).
-- ---------------------------------------------------------------------------
alter table app_settings enable row level security;

create policy app_settings_select_public
  on app_settings for select
  using (true);

create policy app_settings_insert_admin_only
  on app_settings for insert
  to authenticated
  with check (is_admin_or_moderator());

create policy app_settings_update_admin_only
  on app_settings for update
  to authenticated
  using (is_admin_or_moderator())
  with check (is_admin_or_moderator());

-- ---------------------------------------------------------------------------
-- 기본 권한(GRANT) — RLS 정책은 이미 존재하는 테이블 권한을 "제한"할 뿐, 권한
-- 자체를 부여하지는 않는다. 이 마이그레이션이 GRANT를 빠뜨려 실제 배포
-- 프로젝트에서 anon/authenticated 역할 모두 6개 테이블 전부에 대해
-- "permission denied for table ..."를 반환하던 실제 운영 버그를 수정한다
-- (SUPABASE-ENV-VERIFY에서 발견, 사람 확인 완료). RLS가 행 단위 접근을 이미
-- 강제하므로 아래 GRANT는 안전하다.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on profiles to authenticated;
grant insert, update on profiles to authenticated;

grant select on mate_posts to anon, authenticated;
grant insert, update, delete on mate_posts to authenticated;

grant select, insert, update, delete on mate_applications to authenticated;

-- anon에게도 SELECT를 준다 — mate_posts의 공개 조회 정책이 차단 관계를 걸러낼 때
-- user_blocks를 서브쿼리로 참조하는데, Postgres RLS는 정책식이 참조하는 테이블도
-- 조회자(anon 포함)가 최소 SELECT 권한을 갖고 있어야 평가할 수 있다. 실제로
-- user_blocks 행은 user_blocks_select_own_or_admin 정책이 anon에게는 항상 거짓이라
-- 여전히 노출되지 않는다(빈 결과만 반환).
grant select, insert, delete on user_blocks to authenticated;
grant select on user_blocks to anon;

grant select, insert, update on reports to authenticated;

grant select on app_settings to anon, authenticated;
grant insert, update on app_settings to authenticated;
