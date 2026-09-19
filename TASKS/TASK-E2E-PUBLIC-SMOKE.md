# E2E-PUBLIC-SMOKE — 공개 탐색 Smoke(홈+대표소개, 2개 흐름)

- **Category:** E2E_TEST
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 56
- **Task Status:** DONE

> `tests/e2e/public-smoke.spec.ts`는 이전 Wave에서 골격(추측 role/name)으로 먼저 작성되어 있었다. 이번 Task에서 PAGE-SCR001/PAGE-SCR002/PAGE-SCR003의 실제 markup으로 전부 갱신하고 `npx playwright test tests/e2e/public-smoke.spec.ts --project=chromium`을 실제로 반복 실행해 **5개 모두 실제 PASS**를 확인했다(이전 골격은 한 번도 실행된 적이 없었다).
>
> **발견·수정한 실제 문제 3건(모두 사람 확인 완료)**:
> 1. `free_traveler`/`탭 라벨` 텍스트가 페이지 여러 곳에 반복돼 `getByText(regex)`가 strict-mode 위반을 일으킴 — heading role 지정, `exact:true`, 패널 스코프(`#panel-flight`/`#panel-hotel`) 지정으로 해결(이 Task의 Expected File 안에서 해결).
> 2. `FlightTab`/`HotelTab`의 "보러 가기"는 `<a href>`가 아니라 `window.open()`을 호출하는 `<button>`이라 기존 골격의 `href`/`target`/`rel` 속성 검증 방식 자체가 성립하지 않았다 — 실제로 열리는 `popup` 페이지의 URL을 검증하는 방식으로 재작성했고, `FLIGHT_OUTBOUND_URL`/`HOTEL_OUTBOUND_URL`이 설정되지 않은 환경(예: 이 값을 시크릿으로 등록하지 않은 CI)에서는 "설정되지 않았습니다" 오류 카드 검증으로 자동 분기하도록 만들어 로컬/CI 어느 쪽이든 안전하게 통과하게 했다(이 Task의 Expected File 안에서 해결).
> 3. **가장 심각한 문제(사람 확인 후 Expected File 밖 수정)**: `playwright.config.ts`의 기본 `baseURL`이 `http://127.0.0.1:3000`이었는데, Next.js 개발 서버가 자신을 `localhost`로 인식해 `127.0.0.1` 접근을 다른 오리진으로 보고 클라이언트 번들/하이드레이션 관련 리소스를 차단하고 있었다(HMR 웹소켓 오류로 발견). 그 결과 Playwright로 연 모든 페이지가 **클라이언트 하이드레이션이 전혀 일어나지 않는 상태**(React state/onClick 전부 무동작)였고, 지금까지의 Playwright Smoke는 CSS만으로 동작하는 부분만 우연히 통과해온 것으로 확인됐다. 사람에게 확인한 뒤 `playwright.config.ts`의 `DEFAULT_BASE_URL`을 `http://localhost:3000`으로 고쳤다(이 Task의 Expected File 밖, 사전 확인 받음). 재실행 결과 실제 폼 입력(국가/지역/날짜 select·input) 후 상태 전이(요약 화면 전환)까지 정상 동작함을 확인했다.
>
> **알려진 제한사항**: 이번 수정으로 향후 작성될 `TEST-RLS-BASIC`을 제외한 모든 Playwright 테스트(이미 있는 `E2E-TRAVEL-TOOLS`/`E2E-MATE-AUTH` 포함)가 실제로 하이드레이션된 상태에서 재검증되어야 한다 — `E2E-MATE-AUTH`는 이 Task보다 먼저 완료 처리됐고 당시에는 이 하이드레이션 버그가 아직 발견되지 않았었다(다만 그 파일은 환경변수 미설정으로 전부 skip 상태라 실제로 하이드레이션에 의존하는 코드 경로를 검증하지 못한 채였다 — 재검증 필요 시 사람 확인 후 진행).

---

## Context

**공개 탐색 Smoke(홈+대표소개, 2개 흐름)**. Playwright(Chromium)로 핵심 사용자 흐름을 검증하는 End-to-End 테스트 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-001`
- `REQ-FUNC-006`
- `REQ-FUNC-047`
- `REQ-FUNC-057`
- `REQ-NF-024`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-001, SCR-002
- **Route:** `/`, `/about`
- **Page Entry:** `src/app/page.tsx`, `src/app/about/page.tsx`

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `PAGE-SCR001`
- `PAGE-SCR002`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `tests/e2e/public-smoke.spec.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 흐름1: 홈 진입→여행지 탐색→상세 Drawer→안전정보 Drawer. 흐름2: 대표 소개 진입→추천 여행지 클릭→홈 상세 연결. Playwright **Chromium**만 사용.

## Visual AC

- 핵심 요소 렌더링 확인(스크린샷 비교는 범위 아님).

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-FUNC-001 (REQ-FUNC-001)
- TC-FUNC-006 (REQ-FUNC-006)
- TC-FUNC-047 (REQ-FUNC-047)
- TC-FUNC-057 (REQ-FUNC-057)
- TC-NF-024 (REQ-NF-024)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- (자체 검증 Task)

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
- Playwright는 Chromium 프로젝트만 사용한다 — Firefox/WebKit 등 다중 브라우저 매트릭스나 시각 회귀 테스트를 추가하지 않는다.
