# E2E-TRAVEL-TOOLS — 여행 준비 Smoke(항공/숙소/동행, 3개 흐름)

- **Category:** E2E_TEST
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 57
- **Task Status:** DONE

> `tests/e2e/travel-tools.spec.ts` 신규 작성. `TASK-E2E-PUBLIC-SMOKE`의 골격 파일에 잘못 섞여 있던 E2E-003/004/005(사람 확인 후 이동)를 이 Expected File로 옮겨와 정리했다. 흐름3(항공: 국가/지역/출발일/귀국일 입력→"계속"→요약→외부 이동)/흐름4(숙소 동일)/흐름5(동행 구하기 탭 비로그인 시 로그인 안내 카드) 모두 실제 `FlightTab`/`HotelTab`/`MateWriteTab` markup 기준으로 작성했다. 항공/숙소 "보러 가기"는 `<a href>`가 아니라 `window.open()`을 호출하는 버튼이라 실제로 열리는 `popup` 페이지 URL로 검증하고, 외부 URL이 설정되지 않은 환경에서는 "설정되지 않았습니다" 오류 카드 검증으로 자동 분기한다(로컬/CI 어느 쪽이든 안전).
>
> **주의(사람 확인 필요)**: `playwright.config.ts` 기본 `baseURL`을 `127.0.0.1`→`localhost`로 고친 뒤(`E2E-PUBLIC-SMOKE`에서 발견한 하이드레이션 버그 수정)에야 이 Task의 폼 입력(select/onChange 등 실제 React 상태 변경)이 정상 동작함을 확인했다. `npm run lint`/`typecheck`/`format:check` PASS. `npx playwright test tests/e2e/public-smoke.spec.ts tests/e2e/travel-tools.spec.ts --project=chromium` 실행 결과 5개 모두 실제 PASS.

---

## Context

**여행 준비 Smoke(항공/숙소/동행, 3개 흐름)**. Playwright(Chromium)로 핵심 사용자 흐름을 검증하는 End-to-End 테스트 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-011`
- `REQ-FUNC-019`
- `REQ-FUNC-027`
- `REQ-FUNC-031`
- `REQ-FUNC-032`
- `REQ-NF-017`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** `/travel-tools`
- **Page Entry:** `src/app/travel-tools/page.tsx`

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `PAGE-SCR003`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `tests/e2e/travel-tools.spec.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 흐름3: 항공 조건 입력→요약→외부 이동(새 탭 검증, 클릭만 확인). 흐름4: 숙소 동일. 흐름5: 동행 탭 비로그인 시 로그인 안내 노출. Chromium만 사용.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 외부 이동 URL에 입력값 쿼리 미포함을 어서션.

## Test Cases

- TC-FUNC-011 (REQ-FUNC-011)
- TC-FUNC-019 (REQ-FUNC-019)
- TC-FUNC-027 (REQ-FUNC-027)
- TC-FUNC-031 (REQ-FUNC-031)
- TC-FUNC-032 (REQ-FUNC-032)
- TC-NF-017 (REQ-NF-017)

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
