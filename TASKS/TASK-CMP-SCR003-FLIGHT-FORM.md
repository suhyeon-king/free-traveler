# CMP-SCR003-FLIGHT-FORM — 항공편 탭(입력·검증·요약·외부이동·Tip)

- **Category:** COMPONENT
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 17
- **Task Status:** DONE

> `src/components/scr-003/FlightTab.tsx` 작성 완료. 국가 변경 시 지역 재계산/초기화, 과거일·역전 날짜 차단(HTML `min` 속성 + JS 검증 이중 방어), 요약 단계(비전달 고지+공식 판단 대체 불가 고지), "항공편 보러 가기"(`openOutboundLink`), URL 미설정/허용목록 밖이면 오류+재시도 UI, Tip 3개(가로 스크롤). 국가·지역·날짜는 React 상태로만 유지하고 어디로도 전송하지 않는다.
>
> **설계 판단**: `outboundUrl`은 이 Component가 직접 조회하지 않고 **prop으로 받는다** — `FLIGHT_OUTBOUND_URL`은 `NEXT_PUBLIC_` 없는 서버 전용 환경변수라 Client Component에서 읽을 수 없고, `app_settings` 조회도 서버 전용(RLS/Server Client) 작업이라 Client Component 안에서 할 수 없다(SCR-001 조립 때 겪은 RSC 직렬화 제약과 동일한 이유). 실제 값 연결은 `PAGE-SCR003`이 서버에서 `getAppSetting("flight_outbound_url")` 또는 환경변수를 미리 읽어 문자열로 전달해야 한다.
> 국가·지역 목록은 이 Component 내부의 로컬 데이터(다른 Task 소유 파일을 건드리지 않기 위함)로, 11개국 예시만 포함한다(전체 국가 목록은 아님).

---

## Context

**항공편 탭(입력·검증·요약·외부이동·Tip)**. SCR-003 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-011`
- `REQ-FUNC-012`
- `REQ-FUNC-013`
- `REQ-FUNC-014`
- `REQ-FUNC-015`
- `REQ-FUNC-016`
- `REQ-FUNC-017`
- `REQ-FUNC-018`
- `REQ-FUNC-054`
- `REQ-NF-017`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Form·Tabs / Alert·Toast(비전달 고지) / Do Not(내부 가격비교 문구 금지)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `INFRA-OUTBOUND-LINKS`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-003/FlightTab.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 국가·지역·출발일·귀국일 필수 입력, 국가 변경 시 지역 재계산, 과거일·역전 날짜 차단, 요약 단계+비전달 고지, "항공편 보러 가기" 새 탭 이동, Tip 3개, 안전 고지 재노출.

## Visual AC

- 필드별 오류 영역 노출, 요약 카드 Desktop 좌우/Mobile 세로 스택, Tip 가로 3열/스크롤.

## Security/Privacy AC

- 입력값(국가·지역·날짜)을 서버 DB·로그·쿼리 파라미터로 저장·전달하지 않는다. 외부 이동 새 탭+`noopener,noreferrer`.

## Test Cases

- TC-FUNC-011 (REQ-FUNC-011)
- TC-FUNC-012 (REQ-FUNC-012)
- TC-FUNC-013 (REQ-FUNC-013)
- TC-FUNC-014 (REQ-FUNC-014)
- TC-FUNC-015 (REQ-FUNC-015)
- TC-FUNC-016 (REQ-FUNC-016)
- TC-FUNC-017 (REQ-FUNC-017)
- TC-FUNC-018 (REQ-FUNC-018)
- TC-FUNC-054 (REQ-FUNC-054)
- TC-NF-017 (REQ-NF-017)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- UNIT-TRAVEL-DATES
- E2E-TRAVEL-TOOLS
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
