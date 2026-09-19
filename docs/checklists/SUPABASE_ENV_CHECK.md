# SUPABASE_ENV_CHECK — Supabase 프로젝트/환경 확인 (SUPABASE-ENV-VERIFY)

- **프로젝트:** `free-traveler` (ref `hqjbycmkhwhpajvororw`, ap-northeast-1)

## Claude Code가 확인한 부분 (자동, 실제 프로젝트 대상)

### 1. 환경변수 매핑 확인

- `.env`/`.env.local`이 `.gitignore`(`.env*` 규칙)에 걸려 있어 **저장소에 커밋되지
  않았음을 확인**했다(`git ls-files`로 추적되지 않음 확인, Security AC 충족).
- `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`가 로컬에 설정되어
  있고, 실제 프로젝트의 REST(`/rest/v1`)·Auth(`/auth/v1/settings`) 엔드포인트에
  연결됨을 확인했다.
- 이 코드베이스 어디에도 `SUPABASE_SERVICE_ROLE_KEY`가 상시 사용되지 않음을
  재확인했다(규칙 15) — `TEST-RLS-BASIC`의 선택적 Admin 티어에서만 로컬
  `.env.local`에 둘 수 있다.

### 2. Auth/Postgres 사용 가능 여부 확인

- `/auth/v1/settings` 엔드포인트가 HTTP 200으로 응답 — **Auth 사용 가능 확인**.
- `/rest/v1/<table>`(PostgREST) 엔드포인트가 응답 — **Postgres/PostgREST 사용
  가능 확인**.
- **Storage는 이 프로젝트에서 사용하지 않는다** — 여행지/대표 소개 콘텐츠는
  `src/data/*.ts` 정적 데이터로 관리하고(CLAUDE.md 규칙 16), 미디어 업로드 기능은
  EXCLUDED다(`docs/PROJECT_SCOPE.md`). 그래서 Supabase Storage 사용 가능 여부는
  "해당 없음(사용 안 함)"으로 기록한다.

### 3. 실제 운영 버그 발견·수정: anon/authenticated 기본 GRANT 누락

이 확인 과정에서 **실제 배포된 프로젝트가 6개 테이블 전부에서 `anon` 역할에
대해 "permission denied for table ..."를 반환**하는 것을 발견했다. RLS 정책
(`DB-RLS-BASE`)은 올바르게 설정되어 있었지만, 그보다 앞선 Postgres 기본 권한
(`GRANT SELECT/INSERT/... ON <table> TO anon/authenticated`)이 마이그레이션에
전혀 없었다 — RLS는 이미 있는 권한을 "제한"할 뿐 권한 자체를 부여하지 않는다.

**실제 영향**: 비로그인 사용자 기준으로 `/mates` 목록, 홈의 "최근 동행글"
미리보기, 항공/숙소 외부 URL 설정(`app_settings`) 조회가 전부 실제로는
"권한 없음" 오류였는데, 해당 코드의 `try/catch`가 오류를 조용히 삼키고 빈
배열/기본값으로 대체해 지금까지 단순히 "0개의 결과"·"환경변수 fallback
사용 중"으로만 보였다.

사람에게 확인한 뒤 `supabase/policies/rls.sql`(`DB-RLS-BASE`의 Expected File,
이미 DONE — 최소 추가 수정, 사람 확인 완료)에 각 테이블·역할별 GRANT 문을
추가하고, `npx supabase db query --linked`로 실제 프로젝트에 적용했다. 적용 후
`GRANT SELECT ... TO anon`을 준 테이블(`mate_posts`/`app_settings`)은 실제로
200을, 그 외 테이블(`profiles`/`mate_applications`/`user_blocks`/`reports`,
authenticated 전용으로 설계됨)은 여전히 anon에게 401을 반환함을 재확인해,
의도한 접근 범위와 정확히 일치함을 검증했다(RLS의 행 단위 제한은 그대로
유지됨 — GRANT는 표 단위 접근 자체만 열어준다).

추가로 `user_blocks`에도 `anon`에게 `SELECT` 권한을 줘야 했다 —
`mate_posts_select_public_excluding_blocked` 정책이 차단 관계를 걸러낼 때
`user_blocks`를 서브쿼리로 참조하는데, Postgres RLS는 정책식이 참조하는 모든
테이블에 대해 조회자가 최소 권한을 갖고 있어야 정책 자체를 평가할 수 있기
때문이다(실제 행은 `user_blocks_select_own_or_admin` 정책이 anon에게 항상
거짓이라 여전히 노출되지 않음 — 빈 배열만 반환됨을 실제로 확인).

`npx playwright test tests/e2e/public-smoke.spec.ts tests/e2e/travel-tools.spec.ts`
재실행으로 이 수정이 기존 동작을 깨지 않았음을 확인했다(5/5 PASS).

## 사람이 추가로 확인해야 하는 부분

- [ ] `authenticated` 역할(실제 로그인 세션)에서도 각 테이블 접근이 의도대로
      동작하는지 실제 계정으로 로그인해 확인한다(이번 확인은 `anon` 역할만
      HTTP로 직접 검증했다 — `TEST-RLS-BASIC`에 실제 테스트 계정을 채우면
      함께 검증된다).
- [ ] Supabase 대시보드에서 프로젝트 요금제(무료/Pro)와 사용량을 확인한다
      (`DEPLOY-VERCEL-SETUP`의 월 비용 목표 확인과 함께).

## 최종 판정

- [ ] 위 "사람이 추가로 확인해야 하는 부분"을 확인했다.
- [ ] 이 결과를 바탕으로 `TASKS/TASK-SUPABASE-ENV-VERIFY.md`의 Task Status를
      DONE으로 갱신했다.

> 확인자: _____________ / 확인 일시: _____________
