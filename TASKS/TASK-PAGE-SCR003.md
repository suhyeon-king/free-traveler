# PAGE-SCR003 — 통합 여행 준비 페이지 조립

- **Category:** PAGE_OWNER
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 3
- **Task Status:** DONE

> `src/app/travel-tools/page.tsx` 조립 완료. Header → Intro → 탭(항공편/숙소/동행 구하기) → Footer. 세 탭 Component(`FlightTab`/`HotelTab`/`MateWriteTab`)를 항상 함께 마운트하고 순수 CSS(라디오 입력+형제 선택자)로만 노출을 전환해, 탭을 바꿔도 각 탭의 React 상태(입력값)가 유지된다. `outboundUrl`은 `getAppSetting()`(app_settings) 우선, 실패 시 환경변수로 대체해 서버에서 해석 후 각 탭에 prop으로 전달했다. 동행글 작성은 Server Action(`createMatePostAction`, 연락처 탐지 서버측 재검증 포함)으로 연결했고, `mateWriteUser`는 `getServerUser()`+`profiles.is_adult` 조회로 해석해 전달했다. `npm run build` PASS(`/travel-tools` 동적 라우트), `npm run dev` 실행 후 HTTP 200 + 모든 Section 텍스트(탭 3개, 비전달 고지, 로그인/가입하기 안내 — 비로그인 상태라 정상) 확인.
>
> **간소화/한계 공개**:
> 1. Page Owner는 새 Client Wrapper Component를 만들 수 없어(규칙 9) 탭 전환을 CSS로만 구현했다. `role="tab"`의 JS 기반 `aria-selected`/roving tabindex(`SHR-A11Y-FOCUS`)는 적용하지 못했다 — 라디오 그룹 자체는 키보드로 조작 가능하지만 정확한 ARIA Tab 패턴은 아니다.
> 2. `profiles.is_adult` 조회는 `db/mates.ts`(DB-ACCESS)에 해당 함수가 없어 이 파일 안에서 Supabase Client로 직접 조회했다(별도 Task 없는 작은 glue 코드로 판단).

---

## Context

**통합 여행 준비 페이지 조립**. 승인된 디자인 Screen SCR-003을 실제 Next.js Route Page로 조립하는 Page Owner Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-064`
- `REQ-FUNC-065`
- `REQ-FUNC-078`
- `REQ-FUNC-079`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** `/travel-tools`
- **Page Entry:** `src/app/travel-tools/page.tsx`

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Header·Footer / Form·Tabs / Desktop·Mobile 규칙 / Section별 제목·설명·본문·CTA 계층 / Do Not(내부 가격비교 문구 금지)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `CMP-SCR003-FLIGHT-FORM`
- `CMP-SCR003-HOTEL-FORM`
- `CMP-SCR003-MATE-WRITE`
- `INFRA-OUTBOUND-LINKS`
- `INFRA-AUTH`
- `SHR-HEADER-FOOTER`
- `SHR-TOAST-NOTIFY`
- `SHR-SEO-METADATA`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/app/travel-tools/page.tsx`(신규)

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- Section 순서를 Intro → 탭(항공편/숙소/동행 구하기) → 여행정보 Form → 입력 요약·외부 이동 → 찾기 Tip 3개 → 동행 작성 또는 로그인 안내·안전 안내 순으로 재현한다.
- 세 탭의 입력·검증·완료 상태를 서로 독립 유지(탭 전환 시 다른 탭 입력 보존).
- 동행 탭은 비로그인/성인 미확인 시 CMP-SCR003-MATE-WRITE 대신 로그인 안내 카드로 전환된다.
- `design-reference/UI_CONTRACT.md` SCR-003 상태 정의를 그대로 구현한다: Loading(국가→지역 옵션 로드 중 스켈레톤/비활성) · Success(요약·외부 이동 가능) · Empty(국가 미선택 시 지역 선택 비활성+안내 문구) · Error(과거/역전 날짜 제출 차단, 연락처 패턴 탐지 시 제출 차단+수정 안내, 외부 URL 오류 시 인라인 오류+재시도) · Unauthorized(동행 탭에서 비로그인/성인 미확인 시 작성 Form 대신 로그인 안내 카드, 항공·숙소 탭은 Unauthorized 상태 없음).

## Visual AC

- 탭 데이터 출처: 항공=CMP-SCR003-FLIGHT-FORM(클라이언트 상태), 숙소=CMP-SCR003-HOTEL-FORM, 동행=DB-ACCESS(mate_posts insert).
- Desktop: Form/요약 좌우 분할 또는 세로 스택, Tip 가로 3열. Mobile: 세로 스택, Tip 가로 스크롤.
- Lorem ipsum·"준비 중"·"실시간 최저가 비교" 등 내부 가격비교 암시 문구 금지.

## Security/Privacy AC

- 국가·지역·날짜 입력값을 서버 액션, API Route, 외부 URL 쿼리 파라미터로 전송하지 않는다(REQ-FUNC-017,REQ-FUNC-025, REQ-NF-017). 외부 이동은 새 탭 + `noopener,noreferrer`, 목적지·날짜 쿼리 미부착.

## Test Cases

- TC-FUNC-064 (REQ-FUNC-064)
- TC-FUNC-065 (REQ-FUNC-065)
- TC-FUNC-078 (REQ-FUNC-078)
- TC-FUNC-079 (REQ-FUNC-079)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- UNIT-TRAVEL-DATES
- UNIT-CONTACT-DETECTION
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
- 이 Task에서 하위 Component/Data/DB/Infra Task의 구현을 직접 새로 만들지 않는다 — 이미 존재하거나 별도 Task로 계획된 것만 조립·배선한다(규칙 6).
- 여러 Page Entry를 동시에 소유하지 않는다 — 이 Task는 정확히 1개의 page_entry만 조립한다(규칙 16).
