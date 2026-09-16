# CMP-SCR001-SAFETY-PANEL — 국가별 주의사항 Card Grid + 안전정보 Drawer

- **Category:** COMPONENT
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 8

> 이 문서는 계획 Task다. 실제 코드는 작성되지 않았으며 상태는 `NOT_STARTED`다.

---

## Context

**국가별 주의사항 Card Grid + 안전정보 Drawer**. SCR-001 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-047`
- `REQ-FUNC-048`
- `REQ-FUNC-049`
- `REQ-FUNC-050`
- `REQ-FUNC-051`
- `REQ-FUNC-052`
- `REQ-FUNC-053`
- `REQ-FUNC-054`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Destination Card(안전 배지) / Drawer·Modal / Alert·Toast(경보 상단 표시)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DATA-SAFETY`
- `SHR-DRAWER-MODAL`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-001/SafetyGrid.tsx`
- `src/components/scr-001/SafetyDrawer.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 8개 안전 카테고리, 출처·최종 확인일·편집자 표시, 외교부 링크 새 탭, 최종 확인 7일 초과 시 stale 경고, 중대 경보 상단 텍스트(색상 단독 아님), 국가/지역 범위 구분, 공식 판단 대체 불가 고지(SCR-003 항공 요약에도 재사용).

## Visual AC

- 카드 6개(시드 기준), 경보 단계는 텍스트 라벨 병기. stale 계산은 렌더링 시점에 수행(배치 작업 없음).

## Security/Privacy AC

- 외교부 링크 새 탭 + `noopener,noreferrer`.

## Test Cases

- TC-FUNC-047 (REQ-FUNC-047)
- TC-FUNC-048 (REQ-FUNC-048)
- TC-FUNC-049 (REQ-FUNC-049)
- TC-FUNC-050 (REQ-FUNC-050)
- TC-FUNC-051 (REQ-FUNC-051)
- TC-FUNC-052 (REQ-FUNC-052)
- TC-FUNC-053 (REQ-FUNC-053)
- TC-FUNC-054 (REQ-FUNC-054)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-PUBLIC-SMOKE
- RELEASE-CHECK-EXTERNAL-LINKS

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
