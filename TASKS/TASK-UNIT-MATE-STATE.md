# UNIT-MATE-STATE — 동행글/요청 상태 전이 단위 테스트

- **Category:** UNIT_TEST
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 54
- **Task Status:** DONE

> `tests/unit/mate-state.test.ts` 작성 완료. 이 코드베이스에는 별도의 "상태 머신" 모듈이 없어, 실제로 존재하는 3가지 방식(순수 계산 함수·함수 시그니처의 타입 제약·DB unique index)을 그대로 따라 검증했다: (1) `computeEffectiveMatePostStatus()`로 모집중→마감 자동/수동 전이 4케이스, (2) `updateMateApplicationStatus`의 목표 상태 타입이 `Exclude<MateApplicationStatus,"PENDING">`(ACCEPTED/REJECTED만 허용, PENDING 복귀 불가)임을 `expectTypeOf`로 검증, (3) `mate_applications_unique_active` 부분 유니크 인덱스가 마이그레이션 SQL에 실제로 존재하는지 정적 확인.
>
> **필요한 최소 리팩토링(이 Task Expected File 밖, 사람 확인 완료)**: "모집중→마감(자동)" 계산 로직이 `src/lib/db/mates.ts`의 private 함수(`toMatePost`) 안에 갇혀 있어 실제 코드를 import해 검증할 방법이 없었다. 사람에게 확인한 뒤 동작 변경 없이 `computeEffectiveMatePostStatus(status, endDate)` 함수로 추출해 export하고 `toMatePost`가 그것을 호출하도록 리팩토링했다(`DB-ACCESS`의 Expected File, 이미 DONE).
>
> **알려진 제한사항(정직하게 문서화됨, 코드에 남김)**: 신고(`reports`) 상태는 OPEN→REVIEWING→RESOLVED/DISMISSED 순서로 문서화되어 있지만, 실제 코드/RLS 어디에도 그 순서를 강제하는 로직이 없다 — Admin/Moderator 권한 여부만 확인하고 임의의 상태 간 전이가 허용된다. 이 사실 자체를 테스트로 명시적으로 남겼다(새 검증 로직을 만들지 않음, Expected File 범위 밖). 중복 신청 차단은 DB 제약 존재 여부만 정적으로 확인했고, 실제 DB에서의 동작(중복 삽입 시 에러 발생)은 `TEST-RLS-BASIC`(통합 테스트) 영역이다.
>
> `npm run typecheck`/`lint`/`format:check`/`build` PASS. `npm run test:unit` 실행 결과 11개 테스트 모두 실제 PASS.

---

## Context

**동행글/요청 상태 전이 단위 테스트**. 특정 로직(날짜 검증, 연락처 탐지, 상태 전이)을 검증하는 단위 테스트 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-035`
- `REQ-FUNC-036`
- `REQ-FUNC-037`
- `REQ-FUNC-041`
- `REQ-FUNC-042`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-004, SCR-005
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DB-ACCESS`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `tests/unit/mate-state.test.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- PENDING→ACCEPTED/REJECTED, 모집중→마감(자동/수동), 신고 OPEN→REVIEWING→RESOLVED/DISMISSED 전이 규칙과 중복 신청 차단을 검증.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-FUNC-035 (REQ-FUNC-035)
- TC-FUNC-036 (REQ-FUNC-036)
- TC-FUNC-037 (REQ-FUNC-037)
- TC-FUNC-041 (REQ-FUNC-041)
- TC-FUNC-042 (REQ-FUNC-042)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- CI-LINT-TYPECHECK-TEST

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
