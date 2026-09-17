# INFRA-OUTBOUND-LINKS — 외부 링크 안전 이동 유틸리티

- **Category:** INFRA
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 51
- **Task Status:** DONE

> `src/lib/outbound-link.ts`가 작성되었다(`validateOutboundUrl`/`openOutboundLink`). FLIGHT_OUTBOUND_URL/HOTEL_OUTBOUND_URL 등 실제 URL 값 연결과 UI(오류·재시도)는 `CMP-SCR003-FLIGHT-FORM`/`CMP-SCR003-HOTEL-FORM`/`CMP-SCR005-ADMIN` 범위다. TC-FUNC-016/018/024/026/077은 `docs/PROJECT_SCOPE.md`상 Playwright(`E2E-TRAVEL-TOOLS`)로 검증하도록 지정되어 있어 이 Task에서 별도 Unit Test를 추가하지 않았다.

---

## Context

**외부 링크 안전 이동 유틸리티**. 인증·보안·외부 링크 등 인프라 계층 유틸리티를 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-016`
- `REQ-FUNC-018`
- `REQ-FUNC-024`
- `REQ-FUNC-026`
- `REQ-FUNC-077`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** —
- **Route:** `/api/*`(기술 Route 일부)
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- 없음 — 다른 Task의 완료를 기다리지 않고 독립적으로 시작할 수 있다.

## Expected Files

- `src/lib/outbound-link.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 허용목록(HTTPS만) 검증 후 새 탭+`noopener,noreferrer`로 이동, 허용목록 밖/미설정 URL은 이동 차단+오류+재시도.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 목적지·날짜 쿼리 파라미터 부착 금지.

## Test Cases

- TC-FUNC-016 (REQ-FUNC-016)
- TC-FUNC-018 (REQ-FUNC-018)
- TC-FUNC-024 (REQ-FUNC-024)
- TC-FUNC-026 (REQ-FUNC-026)
- TC-FUNC-077 (REQ-FUNC-077)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

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
