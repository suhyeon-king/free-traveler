# CMP-SCR002-MEMORABLE-CTA — 기억에 남는 여행지 + CTA 배너

- **Category:** COMPONENT
- **Priority:** P2
- **Implementation Status:** IMPLEMENT(간소화)
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 16
- **Task Status:** DONE

> `src/components/scr-002/MemorableCta.tsx` 작성 완료. `getRecommendedDestinations()`(비공개/삭제 ID 자동 제외 이미 적용됨) 결과를 카드로 표시하고 `/?destination=<id>`로 이동(SCR-001 Drawer 자동 오픈은 `PAGE-SCR001`에서 이미 공개한 한계와 동일하게 아직 미연동). 하단 "여행 준비 시작하기"(`/travel-tools`)/"동행 찾아보기"(`/mates`) CTA. 문의·SNS 링크는 값이 없으면 렌더링하지 않고, `https:`/`mailto:` 외 프로토콜(예: `javascript:`)은 로컬 검증으로 차단한다.

---

## Context

**기억에 남는 여행지 + CTA 배너**. SCR-002 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT(간소화)** — 핵심 기능은 구현하되 운영 편의 기능(예: 미디어 라이선스 승인, 세분화된 제재 워크플로, 실제 이메일 발송)은 간소화된 방식(정적 URL 필드, 상태값 변경, Toast 알림)으로 대체한다. 자세한 사유는 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 참조한다.

## Requirement Ref

- `REQ-FUNC-062`
- `REQ-FUNC-063`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-002
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Destination Card / Section별 제목·설명·본문·CTA 계층

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DATA-REPRESENTATIVE`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-002/MemorableCta.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 여행지 카드 4개(→ SCR-001 Drawer 연결, 비공개 여행지 자동 제외), 하단 "여행 준비 시작하기"(`/travel-tools`)·"동행 찾아보기"(`/mates`) CTA, 빈 문의/SNS 링크는 렌더링하지 않음.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 허용된 프로토콜의 링크만 연다(javascript: 등 차단).

## Test Cases

- TC-FUNC-062 (REQ-FUNC-062)
- TC-FUNC-063 (REQ-FUNC-063)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-PUBLIC-SMOKE

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
