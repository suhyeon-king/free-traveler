# PAGE-SCR001 — 메인 페이지 조립

- **Category:** PAGE_OWNER
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 1

> 이 문서는 계획 Task다. 실제 코드는 작성되지 않았으며 상태는 `NOT_STARTED`다.

---

## Context

**메인 페이지 조립**. 승인된 디자인 Screen SCR-001을 실제 Next.js Route Page로 조립하는 Page Owner Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-064`
- `REQ-FUNC-065`
- `REQ-FUNC-078`
- `REQ-FUNC-079`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-001
- **Route:** `/`
- **Page Entry:** `src/app/page.tsx`

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Header·Footer / Desktop·Mobile 규칙 / Page Section 최대 폭·상하 여백 / Hero 높이 규칙 / Section별 제목·설명·본문·CTA 계층 / 화면별 Section 순서와 최소 콘텐츠 수 / 완성형 Empty State 규칙

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `CMP-SCR001-HERO-SEARCH`
- `CMP-SCR001-DESTINATIONS`
- `CMP-SCR001-SAFETY-PANEL`
- `CMP-SCR001-MATE-PREVIEW`
- `CMP-SCR001-ABOUT-SUMMARY`
- `DATA-DESTINATIONS`
- `DATA-SAFETY`
- `DATA-REPRESENTATIVE`
- `SHR-HEADER-FOOTER`
- `SHR-DRAWER-MODAL`
- `SHR-EMPTY-STATE`
- `SHR-FAVORITES-STORAGE`
- `SHR-SHARE-LINK`
- `SHR-SEO-METADATA`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/app/page.tsx`(신규 조립)

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- Section 순서를 검색 Hero → 국내 여행지 6 → 해외 여행지 6 → 여행 동기 6 → 국가별 주의사항 6 → 최근 동행글 3/완성형 Empty → free_traveler 소개 순으로 그대로 재현한다.
- Section별 데이터 출처: 국내·해외 카드=DATA-DESTINATIONS, 테마=DATA-DESTINATIONS(theme 필드), 안전정보=DATA-SAFETY, 최근 동행글=DB-ACCESS(mate_posts), 대표 소개=DATA-REPRESENTATIVE.
- 여행지·안전정보 상세는 같은 화면 Drawer/Modal로만 열고 별도 라우트를 만들지 않는다.
- Next.js 기본 Starter 화면(로고·"Get started by editing" 문구·기본 링크 등)을 완전히 제거하고 위 Section으로 교체한다(`starter_template_forbidden=true`).
- `design-reference/UI_CONTRACT.md` SCR-001 상태 정의를 그대로 구현한다: Loading(Card Grid 스켈레톤, `design-reference/D-001/DESIGN.md` Loading 규칙에 따라 실제 콘텐츠와 동일한 크기의 회색 스켈레톤만 사용하고 전체화면 스피너 단독 사용은 지양) · Success · Empty(⑥ 최근 동행글 Section만 해당, 나머지 Section은 정적 시드로 항상 채움) · Error(여행지/안전정보/동행글 목록 로드 실패 시 Section 단위 인라인 오류 메시지+재시도 버튼, 전체 페이지를 무너뜨리지 않음).

## Visual AC

- Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, Section 상하 여백 64~96px, Hero 높이 520~600px로 제한해 다음 Section 상단이 보인다.
- Mobile 390px: Section 상하 여백 40~64px, Card Grid 1열/가로 스크롤.
- Lorem ipsum·"준비 중"·"정보 확인 필요"·내용 없는 Card 금지. 최근 동행글 0건 시 사유+이용 방법+CTA가 있는 완성형 Empty State 표시(빈 화면처럼 보이지 않음).

## Security/Privacy AC

- 항공·호텔 관련 내용 없음(SCR-003 소관). 외부 출처 링크(외교부 등)는 새 탭 + `noopener,noreferrer`. 즐겨찾기는 서버 전송 없이 `localStorage`에만 저장.

## Test Cases

- TC-FUNC-064 (REQ-FUNC-064)
- TC-FUNC-065 (REQ-FUNC-065)
- TC-FUNC-078 (REQ-FUNC-078)
- TC-FUNC-079 (REQ-FUNC-079)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-PUBLIC-SMOKE
- MANUAL-A11Y-KEYBOARD
- RELEASE-CHECK-LIGHTHOUSE

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
