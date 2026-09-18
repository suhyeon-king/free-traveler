# DB-SEED-BASE — 로컬 개발용 Seed 데이터

- **Category:** DB
- **Priority:** P2
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 47
- **Task Status:** DONE

> `supabase/seed.sql` 작성 완료. 더미 `auth.users` 3명(일반 2명+`app_metadata.role: admin` 1명) + `profiles`/`mate_posts`(정상 1건+마감 표시 테스트용 1건)/`mate_applications`/`reports` 각 1건 + `app_settings` 2건(항공/숙소 URL) 샘플 데이터. 실제 개인정보 없음.
>
> **적용 여부**: 이 파일은 "로컬 개발용" 목적이 명시되어 있어, 앞서 실제 적용한 `DB-SCHEMA-BASE`/`DB-RLS-BASE`와 달리 **실제 배포 프로젝트(free-traveler)에는 적용하지 않았다.** `auth.users`에 더미 계정을 직접 INSERT하는 것은 로컬(Docker) Supabase 환경을 전제로 한 것이며, 실제 클라우드 프로젝트의 인증 테이블에 가짜 사용자를 심는 것은 이번 요청(스키마·RLS 적용)의 범위를 벗어난다고 판단해 먼저 확인이 필요하다.

---

## Context

**로컬 개발용 Seed 데이터**. Supabase PostgreSQL 스키마·정책·데이터 접근 계층을 구현하는 Task다.

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

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `supabase/seed.sql`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 로컬 개발·E2E 테스트용 동행글/신청/신고 샘플 데이터를 6개 테이블 범위 내에서 생성.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 실제 개인정보 미포함(가상 데이터만).

## Test Cases

- 이 Task 자체가 테스트 Task이거나 지원 Task다. 아래 **Verify**에 명시된 절차로 검증한다.

## Verify

- E2E-MATE-AUTH

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
- `profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings` 6개 테이블 외의 테이블을 추가하지 않는다(감사 로그·미디어 자산·콘텐츠 CMS 테이블 포함).
