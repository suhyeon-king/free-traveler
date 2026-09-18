# CMP-SCR001-HERO-SEARCH — 검색 Hero + 통합 검색

- **Category:** COMPONENT
- **Priority:** P1
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 6
- **Task Status:** DONE

> `src/components/scr-001/HeroSearch.tsx` 작성 완료. 클라이언트 측 한글 부분 일치로 `DESTINATIONS`+`COUNTRY_SAFETY`를 통합 검색하고 결과에 "여행지"/"안전정보" 유형 라벨을 표시한다. `rounded.pill` 검색창, Hero 최소 높이 520px(Desktop 560px). "여행 준비 시작하기" CTA → `/travel-tools`(E2E-001과 동일 문구/링크). 검색어는 전적으로 클라이언트 메모리에만 있고 어디로도 전송하지 않는다. `onSelectDestination`/`onSelectSafety` 콜백은 옵션이며 Page Owner가 실제 Drawer 상태에 연결해야 한다.

---

## Context

**검색 Hero + 통합 검색**. SCR-001 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-003`
- `REQ-FUNC-067`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Search·Filter / Hero 높이 규칙

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DATA-DESTINATIONS`
- `DATA-SAFETY`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-001/HeroSearch.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 국가·도시·테마 키워드로 여행지·안전정보를 통합 검색하고 결과 유형 라벨을 표시한다. 검색창은 `/travel-tools` CTA를 포함한다.

## Visual AC

- 둥근 Pill 검색창(`rounded.pill`), Desktop Hero 높이 520~600px 내. Mobile은 검색창+CTA만 세로 배치.

## Security/Privacy AC

- 검색어를 서버 로그에 원문 저장하지 않는다(집계용 이벤트만 허용).

## Test Cases

- TC-FUNC-003 (REQ-FUNC-003)
- TC-FUNC-067 (REQ-FUNC-067)

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
