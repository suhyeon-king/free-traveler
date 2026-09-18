# DB-SCHEMA-BASE — Supabase 테이블 스키마(6개 제한)

- **Category:** DB
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 44
- **Task Status:** DONE

> `supabase/migrations/0001_schema.sql` 작성 완료. 정확히 6개 테이블(`profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings`)만 생성한다. `profiles`는 `is_adult`/`adult_verified_at`만 저장(생년월일 미저장), `app_settings`는 Key를 `flight_outbound_url`/`hotel_outbound_url`로 제한하고 값이 `https://`로 시작하도록 CHECK 제약을 걸었다(REQ-FUNC-077). `mate_applications`는 부분 유니크 인덱스로 동일 글 중복 PENDING/ACCEPTED 요청을 DB 레벨에서 차단한다.
>
> **검증 한계(정직하게 공개)**: 실제 Supabase 프로젝트가 아직 없어(`docs/PROJECT_STATE.md`) 이 SQL을 실행해 검증하지 못했다. `psql`/`psycopg2` 등 로컬 Postgres 클라이언트도 없어 수동 코드 리뷰(문법·제약조건 재확인)만 수행했다. 실제 실행 검증은 Supabase 프로젝트 생성 후(`SUPABASE-ENV-VERIFY`) 수행해야 한다.

---

## Context

**Supabase 테이블 스키마(6개 제한)**. Supabase PostgreSQL 스키마·정책·데이터 접근 계층을 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-028`
- `REQ-FUNC-029`
- `REQ-FUNC-030`
- `REQ-FUNC-031`
- `REQ-FUNC-034`
- `REQ-FUNC-037`
- `REQ-FUNC-038`
- `REQ-FUNC-039`
- `REQ-FUNC-040`
- `REQ-FUNC-041`
- `REQ-FUNC-042`
- `REQ-FUNC-077`

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

- 없음 — 다른 Task의 완료를 기다리지 않고 독립적으로 시작할 수 있다.

## Expected Files

- `supabase/migrations/0001_schema.sql`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 정확히 6개 테이블만 생성: `profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings`. 감사 로그·미디어 자산·콘텐츠 CMS 테이블은 만들지 않는다(EXCLUDED).

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 개인정보 최소 수집(정확한 생년월일 컬럼 없음).

## Test Cases

- TC-FUNC-028 (REQ-FUNC-028)
- TC-FUNC-029 (REQ-FUNC-029)
- TC-FUNC-030 (REQ-FUNC-030)
- TC-FUNC-031 (REQ-FUNC-031)
- TC-FUNC-034 (REQ-FUNC-034)
- TC-FUNC-037 (REQ-FUNC-037)
- TC-FUNC-038 (REQ-FUNC-038)
- TC-FUNC-039 (REQ-FUNC-039)
- TC-FUNC-040 (REQ-FUNC-040)
- TC-FUNC-041 (REQ-FUNC-041)
- TC-FUNC-042 (REQ-FUNC-042)
- TC-FUNC-077 (REQ-FUNC-077)

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
