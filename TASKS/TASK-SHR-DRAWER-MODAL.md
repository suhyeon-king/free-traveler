# SHR-DRAWER-MODAL — Drawer/Modal 원시 컴포넌트

- **Category:** SHARED
- **Priority:** P1
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 32
- **Task Status:** DONE

> `src/components/shared/Drawer.tsx`(Desktop 좌/우 Drawer, Mobile Bottom Sheet), `src/components/shared/Modal.tsx`(Desktop 중앙 Modal, Mobile Bottom Sheet) 작성 완료. 둘 다 Focus Trap(열릴 때 내부 첫 요소로, 닫힐 때 트리거로 복귀), `Esc`/바깥(scrim) 클릭 닫힘, `rounded.md`(16px)·단일 그림자 톤·`rgba(0,0,0,0.5)` scrim을 디자인 값 그대로 적용했다. `SHR-A11Y-FOCUS`의 `getDialogAriaProps`를 재사용했다. Focus Trap 로직은 Expected Files가 파일별로 분리되어 있어 두 파일에 각각 구현했다(공용 lib 추출은 이 Task의 Expected Files 밖).

---

## Context

**Drawer/Modal 원시 컴포넌트**. 2개 이상 Screen이 공유하는 재사용 컴포넌트/유틸리티를 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-004`
- `REQ-FUNC-047`
- `REQ-FUNC-033`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** 전역(SCR-001,004 사용)
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Drawer·Modal

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- 없음 — 다른 Task의 완료를 기다리지 않고 독립적으로 시작할 수 있다.

## Expected Files

- `src/components/shared/Drawer.tsx`
- `src/components/shared/Modal.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- Desktop Drawer/중앙 Modal, Mobile Bottom Sheet. Focus Trap: 열릴 때 내부로, 닫힐 때 트리거로 복귀. `Esc`/바깥 클릭 닫힘.

## Visual AC

- 단일 그림자 톤, `rounded.md`.

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-FUNC-004 (REQ-FUNC-004)
- TC-FUNC-047 (REQ-FUNC-047)
- TC-FUNC-033 (REQ-FUNC-033)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- MANUAL-A11Y-KEYBOARD

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
