# CMP-SCR001-DESTINATIONS — 국내·해외 여행지 Card Grid + 상세 Drawer

- **Category:** COMPONENT
- **Priority:** P0
- **Implementation Status:** IMPLEMENT(간소화)
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 7
- **Task Status:** DONE

> `src/components/scr-001/DestinationGrid.tsx`(국내/해외 각 6개, 검색어+해외 국가+추천 시기 필터 AND 결합, `useSearchParams`/`router.replace`로 URL 동기화, 결과 없음 시 EmptyState+초기화), `src/components/scr-001/DestinationDrawer.tsx`(소개·명소·시기·1일/3일 일정·예산·교통·음식·에티켓·출처·수정일 전부 표시, 해외는 "안전정보 보기" 버튼으로 `onOpenSafety(countrySlug)` 콜백 호출, 관련 여행지 최대 6개) 작성 완료. 즐겨찾기(`localStorage`)·공유(Web Share+클립보드 폴백) 연동.
>
> **간소화/한계 공개**:
> 1. Functional AC가 요구하는 "국가·도시·계절·테마·기간" 5축 필터 중, `DATA-DESTINATIONS`(이미 완료된 다른 Task) 스키마에 `region`(도시 세분화)·`theme` 태그·`duration`(여행 기간) 필드가 없어 이 3가지는 정확히 필터링할 수 없다. 실제로 구현한 것은 검색어(도시명·명소·음식 텍스트 매칭으로 도시·테마를 대략 대체)+해외 국가+추천 시기(텍스트 포함 매칭) 3개다. 정밀한 5축 필터가 필요하면 `DATA-DESTINATIONS`의 스키마 확장이 먼저 필요하다.
> 2. `DestinationDrawer`의 "안전정보 보기"는 실제 `SafetyDrawer`(`CMP-SCR001-SAFETY-PANEL`, 이 Wave의 다음 Task)가 아직 없어 콜백만 노출한다 — Page Owner가 두 Drawer를 연결해야 완전히 동작한다.
> 3. `useSearchParams`를 사용하므로 Next.js 규칙상 `PAGE-SCR001`에서 `<Suspense>`로 감싸야 한다 — Page Owner가 처리해야 한다.

---

## Context

**국내·해외 여행지 Card Grid + 상세 Drawer**. SCR-001 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT(간소화)** — 핵심 기능은 구현하되 운영 편의 기능(예: 미디어 라이선스 승인, 세분화된 제재 워크플로, 실제 이메일 발송)은 간소화된 방식(정적 URL 필드, 상태값 변경, Toast 알림)으로 대체한다. 자세한 사유는 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 참조한다.

## Requirement Ref

- `REQ-FUNC-001`
- `REQ-FUNC-002`
- `REQ-FUNC-004`
- `REQ-FUNC-005`
- `REQ-FUNC-006`
- `REQ-FUNC-007`
- `REQ-FUNC-009`
- `REQ-FUNC-010`
- `REQ-FUNC-068`
- `REQ-FUNC-069`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Destination Card / Drawer·Modal / Search·Filter

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DATA-DESTINATIONS`
- `SHR-DRAWER-MODAL`
- `SHR-EMPTY-STATE`
- `SHR-FAVORITES-STORAGE`
- `SHR-SHARE-LINK`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-001/DestinationGrid.tsx`
- `src/components/scr-001/DestinationDrawer.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 국내/해외 탭 오분류 0건, 국가·도시·계절·테마·기간 필터 AND 조건, 상세 Drawer에 소개·명소 5개↑·추천 시기·1일/3일 일정·예산·교통·음식 3개↑·에티켓·출처·수정일 표시, 해외 상세는 안전정보 Drawer로 연결, 관련 여행지 최대 6개, 필터 URL 동기화.

## Visual AC

- 카드 6+6개, 필터 결과 없음 시 300ms 이내 안내+초기화 버튼. 이미지 alt는 장소 설명 텍스트, 출처 URL 표시(작가·라이선스는 간소화).

## Security/Privacy AC

- 즐겨찾기는 서버 미전송(`localStorage`). 공유는 URL 복사 폴백 포함.

## Test Cases

- TC-FUNC-001 (REQ-FUNC-001)
- TC-FUNC-002 (REQ-FUNC-002)
- TC-FUNC-004 (REQ-FUNC-004)
- TC-FUNC-005 (REQ-FUNC-005)
- TC-FUNC-006 (REQ-FUNC-006)
- TC-FUNC-007 (REQ-FUNC-007)
- TC-FUNC-009 (REQ-FUNC-009)
- TC-FUNC-010 (REQ-FUNC-010)
- TC-FUNC-068 (REQ-FUNC-068)
- TC-FUNC-069 (REQ-FUNC-069)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- UNIT-TRAVEL-DATES(해당없음 — 데이터 검증은 DATA-DESTINATIONS)
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
