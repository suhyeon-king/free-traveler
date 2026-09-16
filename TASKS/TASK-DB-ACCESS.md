# DB-ACCESS — 데이터 접근 계층(서버 액션/쿼리)

- **Category:** DB
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 46

> 이 문서는 계획 Task다. 실제 코드는 작성되지 않았으며 상태는 `NOT_STARTED`다.

---

## Context

**데이터 접근 계층(서버 액션/쿼리)**. Supabase PostgreSQL 스키마·정책·데이터 접근 계층을 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-030`
- `REQ-FUNC-033`
- `REQ-FUNC-034`
- `REQ-FUNC-035`
- `REQ-FUNC-036`
- `REQ-FUNC-037`
- `REQ-FUNC-038`
- `REQ-FUNC-039`
- `REQ-FUNC-040`
- `REQ-FUNC-041`
- `REQ-FUNC-042`
- `REQ-FUNC-043`
- `REQ-FUNC-077`
- `REQ-NF-005`
- `REQ-NF-019`

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
- `DB-RLS-BASE`
- `INFRA-AUTH`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/lib/db/mates.ts`
- `src/lib/db/reports.ts`
- `src/lib/db/admin.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 동행글/참가요청/신고/차단/관리자 설정에 대한 CRUD·상태 전이 함수, 이메일·연락처 필드 응답 제외.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 모든 쓰기 작업은 RLS를 통과한 세션에서만 수행.

## Test Cases

- TC-FUNC-030 (REQ-FUNC-030)
- TC-FUNC-033 (REQ-FUNC-033)
- TC-FUNC-034 (REQ-FUNC-034)
- TC-FUNC-035 (REQ-FUNC-035)
- TC-FUNC-036 (REQ-FUNC-036)
- TC-FUNC-037 (REQ-FUNC-037)
- TC-FUNC-038 (REQ-FUNC-038)
- TC-FUNC-039 (REQ-FUNC-039)
- TC-FUNC-040 (REQ-FUNC-040)
- TC-FUNC-041 (REQ-FUNC-041)
- TC-FUNC-042 (REQ-FUNC-042)
- TC-FUNC-043 (REQ-FUNC-043)
- TC-FUNC-077 (REQ-FUNC-077)
- TC-NF-005 (REQ-NF-005)
- TC-NF-019 (REQ-NF-019)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- UNIT-MATE-STATE
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
