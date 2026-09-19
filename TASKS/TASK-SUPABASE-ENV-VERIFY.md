# SUPABASE-ENV-VERIFY — Supabase 프로젝트/환경 확인

- **Category:** CI_DEPLOY
- **Priority:** P1
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 64
- **Task Status:** DONE

> `docs/checklists/SUPABASE_ENV_CHECK.md` 작성 완료. Auth(`/auth/v1/settings` 200)/Postgres(`/rest/v1` 응답) 사용 가능 확인, `.env`/`.env.local` 미커밋 확인(Security AC), Storage는 이 프로젝트가 사용하지 않음(정적 데이터 정책, 규칙 16)을 실제로 확인했다.
>
> **실제 운영 버그 발견·수정(사람 확인 완료)**: 확인 과정에서 실제 배포 프로젝트가 6개 테이블 전부에서 `anon` 역할에 "permission denied"를 반환하는 것을 발견했다 — RLS 정책은 정상이지만 그 이전 단계인 Postgres 기본 GRANT가 마이그레이션에 전혀 없었다. 그 결과 비로그인 사용자의 `/mates` 목록·홈 최근 동행글·항공/숙소 URL 조회가 실제로는 권한 오류였는데 코드의 `try/catch`가 조용히 빈 값으로 가려왔다. 사람에게 확인한 뒤 `supabase/policies/rls.sql`(`DB-RLS-BASE`의 Expected File, 이미 DONE)에 역할별 GRANT 문을 추가하고 `npx supabase db query --linked`로 실제 프로젝트에 적용했다. 적용 후 의도한 접근 범위(공개 테이블은 anon 200, 그 외는 여전히 401)와 정확히 일치함을 실제로 재검증했고, `mate_posts` 정책이 서브쿼리로 참조하는 `user_blocks`에도 anon SELECT가 필요하다는 것을 추가로 발견해 함께 수정했다. Playwright 재실행으로 기존 동작이 깨지지 않았음을 확인했다(5/5 PASS).
>
> **알려진 제한사항**: `authenticated` 역할 기준 접근은 실제 로그인 세션이 필요해 이번에는 `anon` 역할만 HTTP로 직접 검증했다(실제 테스트 계정이 채워지면 `TEST-RLS-BASIC`에서 함께 검증됨). Supabase 요금제/사용량 확인은 사람이 대시보드에서 직접 해야 한다(체크리스트에 남겨둠).

---

## Context

**Supabase 프로젝트/환경 확인**. CI 파이프라인 또는 배포 플랫폼(Vercel/Supabase) 설정을 확인하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- (지원 Task — 특정 Requirement ID에 직접 매핑되지 않음. `TASKS/00_TASK_LIST.md`의 비고 참조)

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** —
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DB-SCHEMA-BASE`
- `INFRA-ENV-SECRETS`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `docs/checklists/SUPABASE_ENV_CHECK.md`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- Supabase 프로젝트의 Auth/Postgres/Storage 사용 가능 여부와 환경변수 매핑을 배포 전 확인.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 프로덕션 키를 저장소에 커밋하지 않았는지 확인.

## Test Cases

- 이 Task 자체가 테스트 Task이거나 지원 Task다. 아래 **Verify**에 명시된 절차로 검증한다.

## Verify

- (배포 전 확인)

## Definition of Done

- 위 **Functional AC**, **Visual AC**, **Security/Privacy AC** 항목을 모두 충족한다.
- **Expected Files**에 명시된 파일만 신규 생성·수정했고 그 밖의 파일은 건드리지 않았다.
- **Test Cases**에 해당하는 테스트가 작성되어 있고(해당 Task 범위인 경우) 통과한다.
- **Verify**에 연결된 Task/체크리스트 기준으로 교차 확인했다.
- **Forbidden** 항목을 위반하지 않았다.
- `docs/UIUX_TRACEABILITY.md`의 관련 Requirement 상태와 모순되지 않는다(EXCLUDED 항목을 구현 범위로 되돌리지 않았다).

## Forbidden

- Airbnb 로고·워드마크·색상 값(#ff385c 등)·폰트명·문구·컴포넌트를 그대로 가져오지 않는다.
- "예약하기", "결제", "장바구니" 등 구매·예약·결제를 암시하는 UI나 문구를 넣지 않는다.
- 별점(★), 후기, 리뷰 인용문, "매너온도" 같은 평판 점수를 넣지 않는다.
- 실제 데이터가 없는 실시간 통계(예: "실시간 N명 대기중")를 조작해서 표시하지 않는다.
- "최저가 실시간 비교", "항공권 비교"처럼 내부 가격 비교·실시간 검색 기능이 있는 것처럼 표현하지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요" 같은 자리표시자 문구를 사용하지 않는다.
- 이 Task Detail의 **Expected Files** 목록 밖의 파일을 수정하지 않는다.
- 자동 Merge Runner, EC2, AWS 인프라를 도입하지 않는다 — 배포는 Vercel, 데이터베이스는 Supabase만 사용한다.
