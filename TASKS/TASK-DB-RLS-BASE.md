# DB-RLS-BASE — Row Level Security 정책

- **Category:** DB
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 45
- **Task Status:** DONE

> `supabase/policies/rls.sql` 작성 완료. 6개 테이블 전체에 RLS를 활성화했다. **설계 판단**: Admin/Moderator 판별에 `profiles`에 없는 `role` 컬럼이 필요했으나, DB-SCHEMA-BASE(이미 완료·Expected Files 밖)를 건드리지 않기 위해 새 컬럼·테이블 대신 Supabase Auth JWT의 `app_metadata.role` 클레임을 읽는 `is_admin_or_moderator()` 함수로 판별했다(6개 테이블 제한 유지). `mate_posts`는 비로그인 사용자도 조회 가능하지만 로그인 사용자에게는 상호 차단 관계를 필터링한다. `mate_applications`/`reports`는 본인·상대(글 작성자)·Admin/Moderator만 열람 가능하다. `app_settings`는 SELECT는 공개(항공/숙소 URL을 비로그인도 읽어야 함), 쓰기는 Admin/Moderator만 가능하다.
>
> **실제 적용 검증**: `npx supabase db query --linked -f supabase/policies/rls.sql`로 실제 프로젝트에 적용했다. `pg_policies` 조회로 6개 테이블에 정책이 정확히 생성됨을 확인했다(profiles 3, mate_posts 4, mate_applications 4, user_blocks 3, reports 3, app_settings 3). 권한별 부정 접근(403/빈 결과) 동작 자체의 통합 테스트는 `TEST-RLS-BASIC`에서 별도로 수행해야 한다 — 이 Task에서는 정책 존재·개수만 확인했다.

---

## Context

**Row Level Security 정책**. Supabase PostgreSQL 스키마·정책·데이터 접근 계층을 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-044`
- `REQ-NF-013`

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

- `supabase/policies/rls.sql`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 본인 글·요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터 열람. 차단 관계 상호 비노출 쿼리 필터.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 권한별 부정 접근 테스트 통과 기준: 403 또는 빈 결과.

## Test Cases

- TC-FUNC-044 (REQ-FUNC-044)
- TC-NF-013 (REQ-NF-013)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- TEST-RLS-BASIC

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
