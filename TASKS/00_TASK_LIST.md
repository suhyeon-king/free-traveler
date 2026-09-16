# Free Traveler — Task List

- **Document ID:** TASK-LIST-001
- **기반 문서:** `docs/06_SRS_UIUX_REVISED.md`, `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/UIUX_TRACEABILITY.md`, `design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, 실제 `src/app` 파일 트리
- **본 문서에서 구현 코드, Branch, Commit, Issue는 생성하지 않는다.**

## 0. 선행 검사

```
$ python scripts/validate_inputs.py
VALIDATE_INPUTS_PASS
Checks passed: 11/11
```

> 이 환경에서 `python3` 실행 파일은 Windows Store 스텁(App Execution Alias)으로 연결되어 있어 실제 인터프리터를 실행하지 못했다(빈 출력 + 비정상 종료 코드). 동일한 인터프리터를 가리키는 `python` 명령으로 실행해 11개 검사를 모두 통과했다. `VALIDATE_INPUTS_PASS`를 확인했으므로 아래 Task List를 생성한다.

## 1. 요약

### 1-1. Task 총수 및 Category별 개수

| Category | 개수 |
|---|---:|
| PAGE_OWNER | 5 |
| COMPONENT | 24 |
| SHARED | 11 |
| DATA | 3 |
| DB | 4 |
| INFRA | 4 |
| UNIT_TEST | 3 |
| INTEGRATION_TEST | 1 |
| E2E_TEST | 3 |
| MANUAL_CHECK | 1 |
| RELEASE_CHECK | 2 |
| CI_DEPLOY | 3 |
| **합계** | **64** |

### 1-2. Requirement 커버리지 요약

| 구분 | 건수 | 처리 |
|---|---:|---|
| REQ-FUNC-001~080 | 80 | IMPLEMENT 71건 → 본 Task List에 매핑 / EXCLUDED 9건 → §4 NON_IMPLEMENTATION |
| REQ-NF-001~034 | 34 | IMPLEMENT 21건 → 본 Task List에 매핑 / EXCLUDED 13건 → §4 NON_IMPLEMENTATION |
| **합계** | **114** | **누락 0건** — §5 Requirement Traceability 검증에서 114건 전체 등장을 확인했다 |

이 문서는 **완료 보고가 아니다.** 모든 Task는 아직 코드가 작성되지 않은 계획 단계이며, 상태는 전부 `NOT_STARTED`다.

---

## 2. Task List

### 2-1. PAGE_OWNER (5)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | PAGE-SCR001 | 메인 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-064,REQ-FUNC-065,REQ-FUNC-078,REQ-FUNC-079 | SCR-001 | `/` | `src/app/page.tsx` | CMP-SCR001-HERO-SEARCH, CMP-SCR001-DESTINATIONS, CMP-SCR001-SAFETY-PANEL, CMP-SCR001-MATE-PREVIEW, CMP-SCR001-ABOUT-SUMMARY, DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE, SHR-HEADER-FOOTER, SHR-DRAWER-MODAL, SHR-EMPTY-STATE, SHR-FAVORITES-STORAGE, SHR-SHARE-LINK, SHR-SEO-METADATA | `src/app/page.tsx`(신규 조립) | Section 순서를 검색 Hero → 국내 여행지 6 → 해외 여행지 6 → 여행 동기 6 → 국가별 주의사항 6 → 최근 동행글 3/완성형 Empty → free_traveler 소개 순으로 그대로 재현한다.<br>Section별 데이터 출처: 국내·해외 카드=DATA-DESTINATIONS, 테마=DATA-DESTINATIONS(theme 필드), 안전정보=DATA-SAFETY, 최근 동행글=DB-ACCESS(mate_posts), 대표 소개=DATA-REPRESENTATIVE.<br>여행지·안전정보 상세는 같은 화면 Drawer/Modal로만 열고 별도 라우트를 만들지 않는다.<br>Next.js 기본 Starter 화면(로고·"Get started by editing" 문구·기본 링크 등)을 완전히 제거하고 위 Section으로 교체한다(`starter_template_forbidden=true`).<br>UI_CONTRACT SCR-001 상태: Loading(Card Grid 스켈레톤)·Success·Empty(최근 동행글 Section만)·Error(Section 단위 인라인 오류+재시도)를 구현한다. | Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, Section 상하 여백 64~96px, Hero 높이 520~600px로 제한해 다음 Section 상단이 보인다.<br>Mobile 390px: Section 상하 여백 40~64px, Card Grid 1열/가로 스크롤.<br>Lorem ipsum·"준비 중"·"정보 확인 필요"·내용 없는 Card 금지. 최근 동행글 0건 시 사유+이용 방법+CTA가 있는 완성형 Empty State 표시(빈 화면처럼 보이지 않음). | 항공·호텔 관련 내용 없음(SCR-003 소관). 외부 출처 링크(외교부 등)는 새 탭 + `noopener,noreferrer`. 즐겨찾기는 서버 전송 없이 `localStorage`에만 저장. | E2E-PUBLIC-SMOKE, MANUAL-A11Y-KEYBOARD, RELEASE-CHECK-LIGHTHOUSE | P0 |
| 2 | PAGE-SCR002 | 대표 소개 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-064,REQ-FUNC-065,REQ-FUNC-078,REQ-FUNC-079 | SCR-002 | `/about` | `src/app/about/page.tsx` | CMP-SCR002-HERO-STATS, CMP-SCR002-INTRO, CMP-SCR002-TIMELINE, CMP-SCR002-COUNTRY-CHIPS, CMP-SCR002-GALLERY, CMP-SCR002-MEMORABLE-CTA, DATA-REPRESENTATIVE, SHR-HEADER-FOOTER, SHR-SEO-METADATA | `src/app/about/page.tsx`(신규) | Section 순서를 Profile Hero → 여행 지표 → 소개·철학 → Timeline → 방문 국가 → Gallery → 기억에 남는 여행지+CTA 순으로 재현한다.<br>전 Section 데이터 출처는 DATA-REPRESENTATIVE 단일 소스(`50+ Trips`/`30+ Countries` 수치 포함)이며 전역에서 값이 일관된다.<br>UI_CONTRACT SCR-002 상태: Success·Loading(이미지 지연 로드 스켈레톤)·Error(이미지 실패 시 placeholder+alt 유지, Section 유지)를 구현한다. | 최소 콘텐츠 수: Timeline 6개 이상, 방문 국가 30개국 이상(권역별), Gallery 8장 이상, 기억에 남는 여행지 4개.<br>Desktop: Timeline 좌우 교차, Mobile: Timeline 좌측 고정 1열 + Gallery 2열.<br>Lorem ipsum·"준비 중"·내용 없는 Card 금지. 모든 사진에 장소를 설명하는 alt 텍스트. | 이미지 출처·라이선스 메타데이터는 간소화(URL+alt만) 정책을 따른다. | E2E-PUBLIC-SMOKE, RELEASE-CHECK-LIGHTHOUSE | P0 |
| 3 | PAGE-SCR003 | 통합 여행 준비 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-064,REQ-FUNC-065,REQ-FUNC-078,REQ-FUNC-079 | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM, CMP-SCR003-MATE-WRITE, INFRA-OUTBOUND-LINKS, INFRA-AUTH, SHR-HEADER-FOOTER, SHR-TOAST-NOTIFY, SHR-SEO-METADATA | `src/app/travel-tools/page.tsx`(신규) | Section 순서를 Intro → 탭(항공편/숙소/동행 구하기) → 여행정보 Form → 입력 요약·외부 이동 → 찾기 Tip 3개 → 동행 작성 또는 로그인 안내·안전 안내 순으로 재현한다.<br>세 탭의 입력·검증·완료 상태를 서로 독립 유지(탭 전환 시 다른 탭 입력 보존).<br>동행 탭은 비로그인/성인 미확인 시 CMP-SCR003-MATE-WRITE 대신 로그인 안내 카드로 전환된다.<br>UI_CONTRACT SCR-003 상태: Loading(국가→지역 옵션 로드)·Success·Empty(국가 미선택 시 지역 비활성)·Error(날짜 검증·연락처 탐지·외부 URL 오류)·Unauthorized(동행 탭 미인증 시 안내 카드)를 구현한다. | 탭 데이터 출처: 항공=CMP-SCR003-FLIGHT-FORM(클라이언트 상태), 숙소=CMP-SCR003-HOTEL-FORM, 동행=DB-ACCESS(mate_posts insert).<br>Desktop: Form/요약 좌우 분할 또는 세로 스택, Tip 가로 3열. Mobile: 세로 스택, Tip 가로 스크롤.<br>Lorem ipsum·"준비 중"·"실시간 최저가 비교" 등 내부 가격비교 암시 문구 금지. | 국가·지역·날짜 입력값을 서버 액션, API Route, 외부 URL 쿼리 파라미터로 전송하지 않는다(REQ-FUNC-017,REQ-FUNC-025, REQ-NF-017). 외부 이동은 새 탭 + `noopener,noreferrer`, 목적지·날짜 쿼리 미부착. | UNIT-TRAVEL-DATES, UNIT-CONTACT-DETECTION, E2E-TRAVEL-TOOLS, RELEASE-CHECK-EXTERNAL-LINKS | P0 |
| 4 | PAGE-SCR004 | 동행 조회 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-064,REQ-FUNC-065,REQ-FUNC-078,REQ-FUNC-079 | SCR-004 | `/mates` | `src/app/mates/page.tsx` | CMP-SCR004-FILTER, CMP-SCR004-LIST, CMP-SCR004-DETAIL, CMP-SCR004-APPLY, CMP-SCR004-REPORT, CMP-SCR004-BLOCK, DB-ACCESS, SHR-HEADER-FOOTER, SHR-DRAWER-MODAL, SHR-EMPTY-STATE, SHR-TOAST-NOTIFY, SHR-SEO-METADATA | `src/app/mates/page.tsx`(신규) | Section 순서를 Intro+작성 CTA → Filter·결과 요약 → 동행 목록 → 상세 → 신청 방법 3단계 → 안전·신고·차단 안내+CTA 순으로 재현한다.<br>데이터 출처: 목록·필터=DB-ACCESS(mate_posts), 상세=DB-ACCESS+CMP-SCR004-DETAIL, 참가/신고/차단=DB-ACCESS mutation.<br>Desktop은 목록+상세 2열 분할, Mobile은 목록→상세 Drawer.<br>UI_CONTRACT SCR-004 상태: Loading(Filter 결과 스켈레톤)·Success·Empty(필터 결과 0건)·Error(중복 제출·신고/차단 실패 인라인 오류)·Unauthorized(참가 요청·신고·차단 미인증 시 안내 카드)를 구현한다. | 목록은 데이터가 있으면 최대 8개 우선 노출. 결과 0건 시 필터 초기화+작성 CTA+이용 방법이 있는 완성형 Empty State.<br>Lorem ipsum·"준비 중"·내용 없는 Card 금지. | 참가 요청·신고·차단은 로그인+성인 확인된 사용자만 가능(비로그인 시도는 안내 카드로 전환, 서버 401/RLS로 이중 차단). 모집글 응답에 연락처 필드 미포함. | E2E-MATE-AUTH, MANUAL-A11Y-KEYBOARD | P0 |
| 5 | PAGE-SCR005 | 계정·관리 페이지 조립 | PAGE_OWNER | IMPLEMENT | REQ-FUNC-064,REQ-FUNC-065,REQ-FUNC-078,REQ-FUNC-079 | SCR-005 | `/account` | `src/app/account/page.tsx` | CMP-SCR005-AUTH, CMP-SCR005-PROFILE, CMP-SCR005-MY-ACTIVITY, CMP-SCR005-ADMIN, DB-ACCESS, INFRA-AUTH, SHR-HEADER-FOOTER, SHR-EMPTY-STATE, SHR-TOAST-NOTIFY | `src/app/account/page.tsx`(신규) | 현재 역할(Guest/Member/Admin)에 맞는 Intro → 핵심 작업 → 도움말/다음 행동 구성만 렌더링하고, 역할에 없는 관리 영역은 렌더링하지 않는다.<br>Guest=CMP-SCR005-AUTH, Member=CMP-SCR005-PROFILE+MY-ACTIVITY, Admin=CMP-SCR005-ADMIN(신고 상태 변경+외부 URL 설정, 어떤 빌드에서도 생략 금지).<br>내 글 클릭 시 SCR-004 상세로, 새 글쓰기 CTA는 SCR-003 동행 탭으로 이동한다.<br>UI_CONTRACT SCR-005 상태: Loading(탭 전환 시 스켈레톤)·Success·Empty(각 목록 완성형 Empty State)·Error(로그인·프로필 저장·URL 형식 오류)·Unauthorized(비로그인 Guest 탭만 노출, 권한 없는 Admin 접근 시 안내+기본 탭 이동)를 구현한다. | Desktop: 좌측 세로 탭(240px)+우측 콘텐츠(최대 960px). Mobile: 상단 가로 스크롤 탭.<br>Lorem ipsum·"준비 중"·내용 없는 Card 금지. 내 글/참가 요청/차단 목록/신고 목록이 비어 있어도 사유+이용 방법+CTA가 있는 완성형 Empty State. | 생년월일 미저장, 성인 확인 boolean+시각만 저장. Admin 탭은 신고 상태와 외부 URL만 다루고 콘텐츠 CMS는 포함하지 않는다(REQ-FUNC-072 EXCLUDED). RLS로 타인 비공개 데이터 접근 차단. | E2E-MATE-AUTH, MANUAL-A11Y-KEYBOARD | P0 |

### 2-2. COMPONENT — SCR-001 (5)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 6 | CMP-SCR001-HERO-SEARCH | 검색 Hero + 통합 검색 | COMPONENT | IMPLEMENT | REQ-FUNC-003,REQ-FUNC-067 | SCR-001 | — | — | DATA-DESTINATIONS, DATA-SAFETY | `src/components/scr-001/HeroSearch.tsx` | 국가·도시·테마 키워드로 여행지·안전정보를 통합 검색하고 결과 유형 라벨을 표시한다. 검색창은 `/travel-tools` CTA를 포함한다. | 둥근 Pill 검색창(`rounded.pill`), Desktop Hero 높이 520~600px 내. Mobile은 검색창+CTA만 세로 배치. | 검색어를 서버 로그에 원문 저장하지 않는다(집계용 이벤트만 허용). | E2E-PUBLIC-SMOKE | P1 |
| 7 | CMP-SCR001-DESTINATIONS | 국내·해외 여행지 Card Grid + 상세 Drawer | COMPONENT | IMPLEMENT(간소화) | REQ-FUNC-001,REQ-FUNC-002,REQ-FUNC-004,REQ-FUNC-005,REQ-FUNC-006,REQ-FUNC-007,REQ-FUNC-009,REQ-FUNC-010,REQ-FUNC-068,REQ-FUNC-069 | SCR-001 | — | — | DATA-DESTINATIONS, SHR-DRAWER-MODAL, SHR-EMPTY-STATE, SHR-FAVORITES-STORAGE, SHR-SHARE-LINK | `src/components/scr-001/DestinationGrid.tsx`, `src/components/scr-001/DestinationDrawer.tsx` | 국내/해외 탭 오분류 0건, 국가·도시·계절·테마·기간 필터 AND 조건, 상세 Drawer에 소개·명소 5개↑·추천 시기·1일/3일 일정·예산·교통·음식 3개↑·에티켓·출처·수정일 표시, 해외 상세는 안전정보 Drawer로 연결, 관련 여행지 최대 6개, 필터 URL 동기화. | 카드 6+6개, 필터 결과 없음 시 300ms 이내 안내+초기화 버튼. 이미지 alt는 장소 설명 텍스트, 출처 URL 표시(작가·라이선스는 간소화). | 즐겨찾기는 서버 미전송(`localStorage`). 공유는 URL 복사 폴백 포함. | UNIT-TRAVEL-DATES(해당없음 — 데이터 검증은 DATA-DESTINATIONS), E2E-PUBLIC-SMOKE | P0 |
| 8 | CMP-SCR001-SAFETY-PANEL | 국가별 주의사항 Card Grid + 안전정보 Drawer | COMPONENT | IMPLEMENT | REQ-FUNC-047,REQ-FUNC-048,REQ-FUNC-049,REQ-FUNC-050,REQ-FUNC-051,REQ-FUNC-052,REQ-FUNC-053,REQ-FUNC-054 | SCR-001 | — | — | DATA-SAFETY, SHR-DRAWER-MODAL | `src/components/scr-001/SafetyGrid.tsx`, `src/components/scr-001/SafetyDrawer.tsx` | 8개 안전 카테고리, 출처·최종 확인일·편집자 표시, 외교부 링크 새 탭, 최종 확인 7일 초과 시 stale 경고, 중대 경보 상단 텍스트(색상 단독 아님), 국가/지역 범위 구분, 공식 판단 대체 불가 고지(SCR-003 항공 요약에도 재사용). | 카드 6개(시드 기준), 경보 단계는 텍스트 라벨 병기. stale 계산은 렌더링 시점에 수행(배치 작업 없음). | 외교부 링크 새 탭 + `noopener,noreferrer`. | E2E-PUBLIC-SMOKE, RELEASE-CHECK-EXTERNAL-LINKS | P0 |
| 9 | CMP-SCR001-MATE-PREVIEW | 최근 동행글 미리보기 + Empty State | COMPONENT | IMPLEMENT | REQ-FUNC-030,REQ-FUNC-037 | SCR-001 | — | — | DB-ACCESS, SHR-EMPTY-STATE | `src/components/scr-001/MatePreview.tsx` | 모집중 동행글 최신 3개(제목/국가·기간/모집 상태)와 "동행 더 보기" 링크. 0건 시 완성형 Empty State(이유+이용 방법+작성 CTA). 종료일 경과 글은 조회 시 자동 마감 표시로 계산. | 3개 카드 또는 Empty State, 큰 빈 여백 없음. | 연락처·비공개 필드 미노출. | E2E-PUBLIC-SMOKE | P1 |
| 10 | CMP-SCR001-ABOUT-SUMMARY | free_traveler 요약 배너 | COMPONENT | IMPLEMENT | REQ-FUNC-057 | SCR-001 | — | — | DATA-REPRESENTATIVE | `src/components/scr-001/AboutSummary.tsx` | 대표명·`50+ Trips`·`30+ Countries`를 `/about`과 동일 값으로 표시, "대표 소개 더 보기" CTA. | 좌우 분할(사진+텍스트), Desktop/Mobile 모두 자연스러운 한국어 완성 문장. | — | E2E-PUBLIC-SMOKE | P2 |

### 2-3. COMPONENT — SCR-002 (6)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 11 | CMP-SCR002-HERO-STATS | 프로필 Hero + 여행 지표 | COMPONENT | IMPLEMENT | REQ-FUNC-057 | SCR-002 | — | — | DATA-REPRESENTATIVE | `src/components/scr-002/HeroStats.tsx` | 대표 사진, 한 문장 소개, `50+ Trips`/`30+ Countries`/권역 수 지표 카드 3개를 DATA-REPRESENTATIVE 단일 값에서 렌더링. | Hero는 뷰포트 전체를 채우지 않음(다음 Section 상단 노출). | — | E2E-PUBLIC-SMOKE | P1 |
| 12 | CMP-SCR002-INTRO | 소개·철학 텍스트 | COMPONENT | IMPLEMENT | REQ-FUNC-058 | SCR-002 | — | — | DATA-REPRESENTATIVE | `src/components/scr-002/Intro.tsx` | 자기소개→시작 계기→철학→편집 원칙 순서의 문단 2~4개를 자연스러운 한국어 완성 문장으로 표시. | — | — | E2E-PUBLIC-SMOKE | P2 |
| 13 | CMP-SCR002-TIMELINE | 여행 Timeline | COMPONENT | IMPLEMENT | REQ-FUNC-060 | SCR-002 | — | — | DATA-REPRESENTATIVE | `src/components/scr-002/Timeline.tsx` | 연도·장소·한 줄 요약·사진이 있는 항목을 시간순으로 표시. | 최소 6개 항목. Desktop 좌우 교차, Mobile 좌측 고정 1열. | — | E2E-PUBLIC-SMOKE | P1 |
| 14 | CMP-SCR002-COUNTRY-CHIPS | 방문 국가 Chip(권역별) | COMPONENT | IMPLEMENT | REQ-FUNC-059 | SCR-002 | — | — | DATA-REPRESENTATIVE | `src/components/scr-002/CountryChips.tsx` | 아시아/유럽/북미/오세아니아 권역별로 국가 Chip을 그룹화하고 클릭 시 SCR-001 관련 여행지/안전정보로 이동. | 총 30개국 이상, 연결 오류 0건. Mobile은 권역별 가로 스크롤. | — | E2E-PUBLIC-SMOKE | P1 |
| 15 | CMP-SCR002-GALLERY | 여행 Gallery | COMPONENT | IMPLEMENT(간소화) | REQ-FUNC-061 | SCR-002 | — | — | DATA-REPRESENTATIVE | `src/components/scr-002/Gallery.tsx` | 서로 다른 여행지의 실제 사진을 그리드로 표시, 각 사진에 장소 설명 alt 텍스트. | 최소 8장. Mobile 2열 그리드. 출처 URL만 표시(작가·라이선스 메타는 간소화). | — | E2E-PUBLIC-SMOKE | P2 |
| 16 | CMP-SCR002-MEMORABLE-CTA | 기억에 남는 여행지 + CTA 배너 | COMPONENT | IMPLEMENT(간소화) | REQ-FUNC-062,REQ-FUNC-063 | SCR-002 | — | — | DATA-REPRESENTATIVE | `src/components/scr-002/MemorableCta.tsx` | 여행지 카드 4개(→ SCR-001 Drawer 연결, 비공개 여행지 자동 제외), 하단 "여행 준비 시작하기"(`/travel-tools`)·"동행 찾아보기"(`/mates`) CTA, 빈 문의/SNS 링크는 렌더링하지 않음. | — | 허용된 프로토콜의 링크만 연다(javascript: 등 차단). | E2E-PUBLIC-SMOKE | P2 |

### 2-4. COMPONENT — SCR-003 (3, 규칙 9: 항공·숙소·동행 작성 분리)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 17 | CMP-SCR003-FLIGHT-FORM | 항공편 탭(입력·검증·요약·외부이동·Tip) | COMPONENT | IMPLEMENT | REQ-FUNC-011,REQ-FUNC-012,REQ-FUNC-013,REQ-FUNC-014,REQ-FUNC-015,REQ-FUNC-016,REQ-FUNC-017,REQ-FUNC-018,REQ-FUNC-054, REQ-NF-017 | SCR-003 | — | — | INFRA-OUTBOUND-LINKS | `src/components/scr-003/FlightTab.tsx` | 국가·지역·출발일·귀국일 필수 입력, 국가 변경 시 지역 재계산, 과거일·역전 날짜 차단, 요약 단계+비전달 고지, "항공편 보러 가기" 새 탭 이동, Tip 3개, 안전 고지 재노출. | 필드별 오류 영역 노출, 요약 카드 Desktop 좌우/Mobile 세로 스택, Tip 가로 3열/스크롤. | 입력값(국가·지역·날짜)을 서버 DB·로그·쿼리 파라미터로 저장·전달하지 않는다. 외부 이동 새 탭+`noopener,noreferrer`. | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS, RELEASE-CHECK-EXTERNAL-LINKS | P0 |
| 18 | CMP-SCR003-HOTEL-FORM | 숙소 탭(입력·검증·요약·외부이동·Tip) | COMPONENT | IMPLEMENT | REQ-FUNC-019,REQ-FUNC-020,REQ-FUNC-021,REQ-FUNC-022,REQ-FUNC-023,REQ-FUNC-024,REQ-FUNC-025,REQ-FUNC-026, REQ-NF-017 | SCR-003 | — | — | INFRA-OUTBOUND-LINKS | `src/components/scr-003/HotelTab.tsx` | 국가·지역·체크인·체크아웃 필수 입력, 국가 변경 시 지역 재계산, 체크아웃≤체크인 차단, 요약+비전달 고지, "숙소 보러 가기" 새 탭 이동, Tip 3개. | 위와 동일 반응형 규칙. | 입력값 서버 미저장·미전달. 외부 이동 새 탭+`noopener,noreferrer`. | UNIT-TRAVEL-DATES, E2E-TRAVEL-TOOLS, RELEASE-CHECK-EXTERNAL-LINKS | P0 |
| 19 | CMP-SCR003-MATE-WRITE | 동행 구하기 탭(작성 Form 또는 로그인 안내) | COMPONENT | IMPLEMENT | REQ-FUNC-027,REQ-FUNC-028,REQ-FUNC-029,REQ-FUNC-031,REQ-FUNC-032,REQ-FUNC-033,REQ-FUNC-080 | SCR-003 | — | — | DB-ACCESS, INFRA-AUTH | `src/components/scr-003/MateWriteTab.tsx` | 비로그인/성인 미확인 시 로그인 안내 카드, 인증 완료 시 제목/국가/지역/기간/인원/스타일/설명 입력+연락처 패턴 탐지 차단+안전수칙 동의 체크박스, 제출 완료 후 `/mates` 상세로 이동. | 동의 미체크 시 제출 버튼 비활성. Mobile은 섹션 아코디언. | 전화번호·이메일·메신저 ID 패턴 탐지 시 제출 차단+수정 안내. 정확한 생년월일 미저장. | UNIT-CONTACT-DETECTION, E2E-TRAVEL-TOOLS | P0 |

### 2-5. COMPONENT — SCR-004 (6, 규칙 10: 목록·필터·상세·참가·신고·차단 분리)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20 | CMP-SCR004-FILTER | 검색 Filter + 결과 요약 | COMPONENT | IMPLEMENT | REQ-FUNC-030 | SCR-004 | — | — | DB-ACCESS | `src/components/scr-004/MateFilter.tsx` | 국가·지역·기간·연령대·성별·여행 스타일·모집 상태 필터, 결과 "총 N개" 요약 텍스트, 차단 사용자 글 제외. | p95 1초 이내 결과(로컬 캐시/필터). | 차단 관계 상호 노출 금지. | E2E-MATE-AUTH | P1 |
| 21 | CMP-SCR004-LIST | 동행글 목록 Card List + Empty State | COMPONENT | IMPLEMENT | REQ-FUNC-030,REQ-FUNC-037 | SCR-004 | — | — | DB-ACCESS, SHR-EMPTY-STATE | `src/components/scr-004/MateList.tsx` | 최대 8개 카드(제목/국가·기간/인원/스타일/모집 상태), 종료일 경과 글은 조회 시 자동 마감 계산 표시. 0건 시 완성형 Empty State(필터 초기화+작성 CTA+이용 방법). | Desktop 카드 8개까지 스크롤, Mobile 1열. | — | E2E-MATE-AUTH | P0 |
| 22 | CMP-SCR004-DETAIL | 상세 패널(Desktop)/Drawer(Mobile) | COMPONENT | IMPLEMENT | REQ-FUNC-033,REQ-FUNC-069 | SCR-004 | — | — | DB-ACCESS, SHR-DRAWER-MODAL, SHR-SHARE-LINK | `src/components/scr-004/MateDetailPanel.tsx` | 작성자 표시 정보·조건·설명·모집 상태 노출, 연락처·이메일 절대 비노출, URL 공유 지원. | Desktop 목록(30%)+상세(70%) 고정 분할, Mobile Bottom Sheet Drawer. | API 응답 JSON/HTML에 이메일·전화번호 미포함. | E2E-MATE-AUTH | P0 |
| 23 | CMP-SCR004-APPLY | 참가 요청 제출 + 중복 차단 | COMPONENT | IMPLEMENT | REQ-FUNC-034,REQ-FUNC-035, REQ-NF-019 | SCR-004 | — | — | DB-ACCESS, INFRA-AUTH, SHR-TOAST-NOTIFY | `src/components/scr-004/ApplyForm.tsx` | 500자 이내 참가 메시지 비공개 제출, PENDING 저장, 동일 글 중복 PENDING/ACCEPTED 차단(DB unique + UI 오류). | 제출 완료 Toast, p95 3초 이내 응답 목표. | 비로그인/성인 미확인 시도는 안내 카드로 전환(서버 401 이중 방어). | UNIT-MATE-STATE, E2E-MATE-AUTH | P0 |
| 24 | CMP-SCR004-REPORT | 신고 트리거 | COMPONENT | IMPLEMENT | REQ-FUNC-039, REQ-NF-019 | SCR-004 | — | — | DB-ACCESS, INFRA-AUTH | `src/components/scr-004/ReportButton.tsx` | 글·사용자·요청 신고 폼(사유 코드+설명), 접수번호+접수 시각 3초 이내 표시. | — | 신고자·피신고자 상세는 관리자만 열람(RLS). | E2E-MATE-AUTH | P1 |
| 25 | CMP-SCR004-BLOCK | 차단 트리거 | COMPONENT | IMPLEMENT | REQ-FUNC-040 | SCR-004 | — | — | DB-ACCESS, INFRA-AUTH | `src/components/scr-004/BlockButton.tsx` | 차단 실행 시 즉시 상호 글·프로필·요청 노출 제한(관리는 SCR-005 내 활동 탭). | — | 차단 상태는 RLS/쿼리 필터로 서버에서도 강제. | E2E-MATE-AUTH | P1 |

### 2-6. COMPONENT — SCR-005 (4, 규칙 11: Auth·Profile·My Activity·Admin 분리)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 26 | CMP-SCR005-AUTH | 로그인·가입·재설정(Guest) | COMPONENT | IMPLEMENT | REQ-FUNC-027,REQ-FUNC-066 | SCR-005 | — | — | INFRA-AUTH | `src/components/scr-005/AuthTab.tsx` | 이메일 가입·인증·로그인·로그아웃·비밀번호 재설정, 로그인 후 가능한 기능 안내, 보안 안내(생년월일 미저장). | — | 인증되지 않은 세션은 동행 쓰기 권한 없음. | E2E-MATE-AUTH | P0 |
| 27 | CMP-SCR005-PROFILE | 프로필·성인 확인 요약(Member) | COMPONENT | IMPLEMENT | REQ-FUNC-028,REQ-FUNC-029 | SCR-005 | — | — | DB-ACCESS, INFRA-AUTH | `src/components/scr-005/ProfileTab.tsx` | 닉네임·연령대·여행 스타일(필수)·성별(선택)·성인 확인 완료 배지, 프로필 저장. | — | 정확한 생년월일 미저장, `is_adult`+확인 시각만 저장. | E2E-MATE-AUTH | P1 |
| 28 | CMP-SCR005-MY-ACTIVITY | 내 글·참가 요청·차단 목록(Member) | COMPONENT | IMPLEMENT(간소화) | REQ-FUNC-036,REQ-FUNC-037,REQ-FUNC-038,REQ-FUNC-039,REQ-FUNC-040,REQ-FUNC-043 | SCR-005 | — | — | DB-ACCESS, INFRA-AUTH, SHR-EMPTY-STATE, SHR-TOAST-NOTIFY | `src/components/scr-005/MyActivityTab.tsx` | 내 글 수정/마감/삭제, 들어온 참가 요청 승인/거절, 신고 내역 열람, 차단 목록 관리(해제), 상태 변경 인앱 Toast 알림(이메일 발송은 제외). | 각 목록 0건 시 완성형 Empty State(예: "차단한 사용자가 없어요"+이용 방법). | 본인 데이터만 RLS로 열람. | E2E-MATE-AUTH | P0 |
| 29 | CMP-SCR005-ADMIN | 신고 상태 변경·외부 URL 설정(Admin) | COMPONENT | IMPLEMENT(간소화) | REQ-FUNC-041,REQ-FUNC-042,REQ-FUNC-077 | SCR-005 | — | — | DB-ACCESS, INFRA-AUTH, INFRA-OUTBOUND-LINKS | `src/components/scr-005/AdminTab.tsx` | 신고 큐(OPEN/REVIEWING/RESOLVED/DISMISSED 필터+상태 변경), 항공·숙소 외부 URL 설정 Form(HTTPS 허용목록만 저장). Admin이 아니면 탭 자체를 렌더링하지 않는다. | — | 콘텐츠 CMS·감사 로그 기능은 포함하지 않는다(EXCLUDED). HTTP/`javascript:`/`data:` URL 저장 차단. | E2E-MATE-AUTH | P0 |

### 2-7. SHARED (11)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 30 | SHR-HEADER-FOOTER | 전역 Header/Footer | SHARED | IMPLEMENT | REQ-FUNC-064 | 전역(5개 Screen 공통) | — | — | — | `src/components/shared/Header.tsx`, `src/components/shared/Footer.tsx` | 5개 Screen에서 동일 컴포넌트 재사용, 핵심 내비게이션(메인/여행 준비/동행 찾기/대표 소개/계정)+정책 링크, Desktop 72px/Mobile 56px+햄버거. | 핵심 기능·정책 페이지에 2회 이내 이동. | — | E2E-PUBLIC-SMOKE | P0 |
| 31 | SHR-RESPONSIVE-LAYOUT | 반응형 레이아웃 토큰(Tailwind) | SHARED | IMPLEMENT | REQ-FUNC-065 | 전역 | — | — | — | `tailwind.config.ts`, `src/app/globals.css` | Desktop 1440px/Mobile 390px 기준 breakpoint·spacing·radius 토큰을 `design-reference/D-001/DESIGN.md`와 동일하게 정의. | 가로 스크롤·겹침 없이 320px~Desktop 대응. | — | MANUAL-A11Y-KEYBOARD, RELEASE-CHECK-LIGHTHOUSE | P0 |
| 32 | SHR-DRAWER-MODAL | Drawer/Modal 원시 컴포넌트 | SHARED | IMPLEMENT | REQ-FUNC-004,REQ-FUNC-047,REQ-FUNC-033 | 전역(SCR-001,004 사용) | — | — | — | `src/components/shared/Drawer.tsx`, `src/components/shared/Modal.tsx` | Desktop Drawer/중앙 Modal, Mobile Bottom Sheet. Focus Trap: 열릴 때 내부로, 닫힐 때 트리거로 복귀. `Esc`/바깥 클릭 닫힘. | 단일 그림자 톤, `rounded.md`. | — | MANUAL-A11Y-KEYBOARD | P1 |
| 33 | SHR-EMPTY-STATE | 완성형 Empty State 원시 컴포넌트 | SHARED | IMPLEMENT | REQ-FUNC-005 | 전역(SCR-001,004,005 사용) | — | — | — | `src/components/shared/EmptyState.tsx` | 사유 문장+이용 방법+다음 행동 CTA 3요소를 props로 강제(누락 시 타입 에러)하는 재사용 컴포넌트. | 빈 화면처럼 보이지 않게 최소 여백/아이콘 규칙 적용. | — | MANUAL-A11Y-KEYBOARD | P1 |
| 34 | SHR-TOAST-NOTIFY | Toast 인앱 알림 | SHARED | IMPLEMENT | REQ-FUNC-043 | 전역(SCR-003,004,005 사용) | — | — | — | `src/components/shared/Toast.tsx` | 참가 요청 접수·승인/거절·신고 접수 등 상태 변경을 3~5초 노출 Toast로 알림, 이메일 발송 없이 대체. | — | — | E2E-MATE-AUTH | P1 |
| 35 | SHR-ERROR-NOTFOUND | 404/오류 복구 화면 | SHARED | IMPLEMENT | REQ-FUNC-078 | 전역 | — | `src/app/not-found.tsx` | — | `src/app/not-found.tsx`, `src/components/shared/ErrorState.tsx` | 404·권한 없음·외부 연결 실패 화면에 홈/이전/재시도 중 최소 1개 복구 행동 제공. | — | — | E2E-PUBLIC-SMOKE | P1 |
| 36 | SHR-A11Y-FOCUS | 접근성 포커스·ARIA 유틸리티 | SHARED | IMPLEMENT | REQ-FUNC-079, REQ-NF-023 | 전역 | — | — | — | `src/lib/a11y.ts`, `src/components/shared/VisuallyHidden.tsx` | 폼·모달·탭·알림에 올바른 시맨틱 HTML+ARIA 상태, 44×44px 이상 터치 영역, 3px 포커스 링(`colors.focus-ring`). | 색상만으로 상태 구분 금지(텍스트 라벨 병기). | — | MANUAL-A11Y-KEYBOARD | P1 |
| 37 | SHR-SEO-METADATA | 페이지별 SEO 메타데이터 유틸리티 | SHARED | IMPLEMENT | REQ-FUNC-070, REQ-NF-030 | 전역 | — | — | — | `src/lib/seo.ts` | 5개 Screen에 고유 title/description/canonical/Open Graph 제공하는 공통 헬퍼. | — | — | RELEASE-CHECK-LIGHTHOUSE | P2 |
| 38 | SHR-IMAGE-OPTIMIZATION | 이미지 최적화 컴포넌트 | SHARED | IMPLEMENT | REQ-NF-006 | 전역 | — | — | — | `src/components/shared/OptimizedImage.tsx` | Next.js `<Image>` 기반 반응형 크기+lazy load, Hero/LCP 이미지는 `priority`. | — | — | RELEASE-CHECK-LIGHTHOUSE | P2 |
| 39 | SHR-FAVORITES-STORAGE | 즐겨찾기 localStorage 유틸리티 | SHARED | IMPLEMENT | REQ-FUNC-068 | 전역(SCR-001 사용) | — | — | — | `src/lib/favorites.ts` | 여행지 즐겨찾기 토글·조회, 중복 즐겨찾기 생성 방지, 서버 전송 없음. | — | 개인 기기 `localStorage`에만 저장. | E2E-PUBLIC-SMOKE | P2 |
| 40 | SHR-SHARE-LINK | URL 공유 유틸리티 | SHARED | IMPLEMENT | REQ-FUNC-069 | 전역(SCR-001,004 사용) | — | — | — | `src/lib/share.ts` | Web Share API 우선 시도, 실패 시 URL 클립보드 복사 폴백. | — | — | E2E-PUBLIC-SMOKE | P2 |

### 2-8. DATA (3, 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 41 | DATA-DESTINATIONS | 여행지 정적 데이터(국내 10+, 해외 15개국 30도시+) | DATA | IMPLEMENT | REQ-FUNC-001,REQ-FUNC-004,REQ-FUNC-007,REQ-FUNC-008,REQ-FUNC-009, REQ-NF-026 | — | — | — | — | `src/data/destinations.ts` | `src/data`에 국내 10개 이상·해외 15개국 30개 도시 이상, 각 항목에 소개 300자↑·명소 5개↑·추천 시기·1일/3일 일정·예산·교통·음식 3개↑·에티켓·출처·수정일 필드를 스키마로 강제. | 이미지 필드는 URL+alt만(라이선스 메타 간소화). | — | 콘텐츠 검수 체크리스트, E2E-PUBLIC-SMOKE | P0 |
| 42 | DATA-SAFETY | 국가 안전정보 정적 데이터(해외 15개국 전체) | DATA | IMPLEMENT | REQ-FUNC-046,REQ-FUNC-048, REQ-NF-027,REQ-NF-028 | — | — | — | — | `src/data/safety.ts` | 소개된 해외 15개국 전체에 8개 안전 카테고리+출처명/URL+`verified_at`+편집자 필드 스키마 강제. | — | — | 콘텐츠 검수 체크리스트, E2E-PUBLIC-SMOKE | P0 |
| 43 | DATA-REPRESENTATIVE | 대표 프로필 정적 데이터 | DATA | IMPLEMENT | REQ-FUNC-057,REQ-FUNC-058,REQ-FUNC-059,REQ-FUNC-060,REQ-FUNC-061,REQ-FUNC-062,REQ-FUNC-063 | — | — | — | — | `src/data/representative.ts` | 대표명·`50+ Trips`·`30+ Countries`·철학·타임라인(6+)·방문국가(30+)·갤러리(8+)·추천 여행지(4+) 단일 데이터 소스. | — | — | 콘텐츠 검수 체크리스트, E2E-PUBLIC-SMOKE | P0 |

### 2-9. DB (4, 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 44 | DB-SCHEMA-BASE | Supabase 테이블 스키마(6개 제한) | DB | IMPLEMENT | REQ-FUNC-028,REQ-FUNC-029,REQ-FUNC-030,REQ-FUNC-031,REQ-FUNC-034,REQ-FUNC-037,REQ-FUNC-038,REQ-FUNC-039,REQ-FUNC-040,REQ-FUNC-041,REQ-FUNC-042,REQ-FUNC-077 | — | — | — | — | `supabase/migrations/0001_schema.sql` | 정확히 6개 테이블만 생성: `profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings`. 감사 로그·미디어 자산·콘텐츠 CMS 테이블은 만들지 않는다(EXCLUDED). | — | 개인정보 최소 수집(정확한 생년월일 컬럼 없음). | TEST-RLS-BASIC | P0 |
| 45 | DB-RLS-BASE | Row Level Security 정책 | DB | IMPLEMENT | REQ-FUNC-044, REQ-NF-013 | — | — | — | DB-SCHEMA-BASE | `supabase/policies/rls.sql` | 본인 글·요청, 요청 대상 작성자, Moderator/Admin만 비공개 데이터 열람. 차단 관계 상호 비노출 쿼리 필터. | — | 권한별 부정 접근 테스트 통과 기준: 403 또는 빈 결과. | TEST-RLS-BASIC | P0 |
| 46 | DB-ACCESS | 데이터 접근 계층(서버 액션/쿼리) | DB | IMPLEMENT | REQ-FUNC-030,REQ-FUNC-033,REQ-FUNC-034,REQ-FUNC-035,REQ-FUNC-036,REQ-FUNC-037,REQ-FUNC-038,REQ-FUNC-039,REQ-FUNC-040,REQ-FUNC-041,REQ-FUNC-042,REQ-FUNC-043,REQ-FUNC-077, REQ-NF-005,REQ-NF-019 | — | — | — | DB-SCHEMA-BASE, DB-RLS-BASE, INFRA-AUTH | `src/lib/db/mates.ts`, `src/lib/db/reports.ts`, `src/lib/db/admin.ts` | 동행글/참가요청/신고/차단/관리자 설정에 대한 CRUD·상태 전이 함수, 이메일·연락처 필드 응답 제외. | — | 모든 쓰기 작업은 RLS를 통과한 세션에서만 수행. | UNIT-MATE-STATE, TEST-RLS-BASIC | P0 |
| 47 | DB-SEED-BASE | 로컬 개발용 Seed 데이터 | DB | IMPLEMENT | (지원 Task — REQ 직접 매핑 없음, NF-031 개발 인프라 지원) | — | — | — | DB-SCHEMA-BASE | `supabase/seed.sql` | 로컬 개발·E2E 테스트용 동행글/신청/신고 샘플 데이터를 6개 테이블 범위 내에서 생성. | — | 실제 개인정보 미포함(가상 데이터만). | E2E-MATE-AUTH | P2 |

### 2-10. INFRA (4)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 48 | INFRA-AUTH | Supabase Auth·성인 확인 | INFRA | IMPLEMENT | REQ-FUNC-027,REQ-FUNC-028,REQ-FUNC-066 | — | `/auth/callback`(기술 Route) | — | DB-SCHEMA-BASE | `src/lib/auth.ts`, `src/app/auth/callback/route.ts` | 이메일 가입·인증·로그인·로그아웃·재설정, 성인 확인 boolean+시각 저장(생년월일 미저장). | — | 세션·역할 검증은 서버에서 수행(NF-013 연계). | E2E-MATE-AUTH | P0 |
| 49 | INFRA-ENV-SECRETS | 환경변수·비밀키 관리 | INFRA | IMPLEMENT | REQ-NF-016 | — | — | — | — | `.env.example` | Supabase URL/Key, 외부 URL 기본값 등을 환경변수로 관리하고 클라이언트 번들에 비밀키를 포함하지 않는다. | — | 빌드 산출물에 비밀키 노출 여부 점검 항목 포함. | CI-LINT-TYPECHECK-TEST | P0 |
| 50 | INFRA-SECURITY-BASELINE | CSRF·입력 검증 기본기 | INFRA | IMPLEMENT | REQ-NF-014,REQ-NF-015 | — | — | — | — | `src/lib/security.ts` | 서버 액션 CSRF 방어(SameSite 쿠키), 사용자 입력 검증·이스케이프로 저장 XSS 차단. | — | OWASP 기반 점검 항목 포함. | CI-LINT-TYPECHECK-TEST | P1 |
| 51 | INFRA-OUTBOUND-LINKS | 외부 링크 안전 이동 유틸리티 | INFRA | IMPLEMENT | REQ-FUNC-016,REQ-FUNC-018,REQ-FUNC-024,REQ-FUNC-026,REQ-FUNC-077 | — | `/api/*`(기술 Route 일부) | — | — | `src/lib/outbound-link.ts` | 허용목록(HTTPS만) 검증 후 새 탭+`noopener,noreferrer`로 이동, 허용목록 밖/미설정 URL은 이동 차단+오류+재시도. | — | 목적지·날짜 쿼리 파라미터 부착 금지. | RELEASE-CHECK-EXTERNAL-LINKS | P0 |

### 2-11. UNIT_TEST (3, 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 52 | UNIT-TRAVEL-DATES | 날짜 검증 단위 테스트 | UNIT_TEST | IMPLEMENT | REQ-FUNC-013,REQ-FUNC-021 | SCR-003 | — | — | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM | `tests/unit/travel-dates.test.ts` | 과거 출발일/체크인, 귀국일<출발일, 체크아웃≤체크인 등 경계값 케이스를 모두 차단하는지 검증. | — | — | CI-LINT-TYPECHECK-TEST | P0 |
| 53 | UNIT-CONTACT-DETECTION | 연락처 패턴 탐지 단위 테스트 | UNIT_TEST | IMPLEMENT | REQ-FUNC-032 | SCR-003 | — | — | CMP-SCR003-MATE-WRITE | `tests/unit/contact-detection.test.ts` | 전화번호·이메일·메신저 ID 패턴 기준 테스트셋에서 탐지율 95% 이상, 오탐 5% 이하를 검증. | — | — | CI-LINT-TYPECHECK-TEST | P0 |
| 54 | UNIT-MATE-STATE | 동행글/요청 상태 전이 단위 테스트 | UNIT_TEST | IMPLEMENT | REQ-FUNC-035,REQ-FUNC-036,REQ-FUNC-037,REQ-FUNC-041,REQ-FUNC-042 | SCR-004, SCR-005 | — | — | DB-ACCESS | `tests/unit/mate-state.test.ts` | PENDING→ACCEPTED/REJECTED, 모집중→마감(자동/수동), 신고 OPEN→REVIEWING→RESOLVED/DISMISSED 전이 규칙과 중복 신청 차단을 검증. | — | — | CI-LINT-TYPECHECK-TEST | P0 |

### 2-12. INTEGRATION_TEST (1, 필수)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 55 | TEST-RLS-BASIC | RLS 기본 정책 통합 테스트 | INTEGRATION_TEST | IMPLEMENT | REQ-FUNC-044, REQ-NF-013 | — | — | — | DB-RLS-BASE | `tests/rls/basic-policies.test.ts` | 익명/타인/본인/Moderator/Admin 역할별로 6개 테이블에 대한 읽기·쓰기 권한을 실제 Supabase 클라이언트로 검증(부정 접근은 403 또는 빈 결과). | — | 실제 프로덕션 키가 아닌 테스트 프로젝트 키만 사용. | CI-LINT-TYPECHECK-TEST | P0 |

### 2-13. E2E_TEST (3, 필수 — 핵심 흐름 7개를 3개 Task로 묶음)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 56 | E2E-PUBLIC-SMOKE | 공개 탐색 Smoke(홈+대표소개, 2개 흐름) | E2E_TEST | IMPLEMENT | REQ-FUNC-001,REQ-FUNC-006,REQ-FUNC-047,REQ-FUNC-057, REQ-NF-024 | SCR-001, SCR-002 | `/`, `/about` | `src/app/page.tsx`, `src/app/about/page.tsx` | PAGE-SCR001, PAGE-SCR002 | `tests/e2e/public-smoke.spec.ts` | 흐름1: 홈 진입→여행지 탐색→상세 Drawer→안전정보 Drawer. 흐름2: 대표 소개 진입→추천 여행지 클릭→홈 상세 연결. Playwright **Chromium**만 사용. | 핵심 요소 렌더링 확인(스크린샷 비교는 범위 아님). | — | (자체 검증 Task) | P0 |
| 57 | E2E-TRAVEL-TOOLS | 여행 준비 Smoke(항공/숙소/동행, 3개 흐름) | E2E_TEST | IMPLEMENT | REQ-FUNC-011,REQ-FUNC-019,REQ-FUNC-027,REQ-FUNC-031,REQ-FUNC-032, REQ-NF-017 | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PAGE-SCR003 | `tests/e2e/travel-tools.spec.ts` | 흐름3: 항공 조건 입력→요약→외부 이동(새 탭 검증, 클릭만 확인). 흐름4: 숙소 동일. 흐름5: 동행 탭 비로그인 시 로그인 안내 노출. Chromium만 사용. | — | 외부 이동 URL에 입력값 쿼리 미포함을 어서션. | (자체 검증 Task) | P0 |
| 58 | E2E-MATE-AUTH | 동행 인증 흐름 Smoke(로그인/참가/계정, 2개 흐름) | E2E_TEST | IMPLEMENT | REQ-FUNC-027,REQ-FUNC-034,REQ-FUNC-036,REQ-FUNC-066 | SCR-004, SCR-005 | `/mates`, `/account` | `src/app/mates/page.tsx`, `src/app/account/page.tsx` | PAGE-SCR004, PAGE-SCR005 | `tests/e2e/mate-auth.spec.ts` | 흐름6: 로그인→동행글 상세→참가 요청 제출→작성자 계정에서 승인. 흐름7: 계정 페이지 역할별 탭 노출(Guest/Member) 확인. Chromium만 사용. | — | 테스트 계정은 더미 데이터만 사용. | (자체 검증 Task) | P0 |

### 2-14. MANUAL_CHECK (1)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 59 | MANUAL-A11Y-KEYBOARD | 키보드·스크린리더 수동 점검 | MANUAL_CHECK | IMPLEMENT | REQ-NF-025 | SCR-001~005 | 전체 | 전체 | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 | `docs/checklists/A11Y_MANUAL_CHECK.md`(점검 기록) | 5개 Screen의 핵심 사용자 흐름(검색, 폼 입력, 모달 닫기, 신고 제출 등)을 키보드만으로 완료 가능한지 브라우저에서 수동 확인하고 결과를 기록한다. | 포커스 순서·가시성 육안 확인. | — | (릴리스 전 수동 실행) | P1 |

### 2-15. RELEASE_CHECK (2)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 60 | RELEASE-CHECK-LIGHTHOUSE | 배포 전 Lighthouse 수동 확인 | RELEASE_CHECK | IMPLEMENT | REQ-NF-001,REQ-NF-002,REQ-NF-003 | SCR-001~005 | 전체 | 전체 | PAGE-SCR001, PAGE-SCR002, PAGE-SCR003, PAGE-SCR004, PAGE-SCR005 | `docs/checklists/LIGHTHOUSE_CHECK.md` | 실제 브라우저에서 5개 Screen의 LCP/INP/CLS를 Lighthouse로 측정하고 목표(LCP≤2.5s 등)와 비교 기록(자동 CI 게이트는 제외 범위). | — | — | (릴리스 전 수동 실행) | P1 |
| 61 | RELEASE-CHECK-EXTERNAL-LINKS | 외부 링크 브라우저 확인 | RELEASE_CHECK | IMPLEMENT | REQ-FUNC-016,REQ-FUNC-024,REQ-FUNC-049 | SCR-001, SCR-003 | 전체 | 전체 | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM, CMP-SCR001-SAFETY-PANEL | `docs/checklists/EXTERNAL_LINKS_CHECK.md` | 실제 브라우저에서 항공·숙소 외부 이동 링크와 외교부 안전정보 링크가 새 탭으로 정상 열리는지 확인 기록(자동 주기 점검은 EXCLUDED 대체). | — | — | (릴리스 전 수동 실행) | P1 |

### 2-16. CI_DEPLOY (3)

| Seq | Task ID | 제목 | Category | Implementation Status | Requirement Ref | Screen | Route | Page Entry | Depends On | Expected Files | Functional AC | Visual AC | Security/Privacy AC | Verify | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 62 | CI-LINT-TYPECHECK-TEST | CI: Lint·타입체크·테스트 게이트 | CI_DEPLOY | IMPLEMENT | REQ-NF-031 | — | — | — | — | `.github/workflows/ci.yml` | main 병합 전 `next lint`, `tsc --noEmit`, 단위/통합 테스트가 모두 통과해야 병합 가능. | — | — | (CI 자체) | P0 |
| 63 | DEPLOY-VERCEL-SETUP | Vercel 배포 설정 확인 | CI_DEPLOY | IMPLEMENT | REQ-NF-012,REQ-NF-034 | — | — | — | CI-LINT-TYPECHECK-TEST | `vercel.json`(필요 시), `docs/checklists/VERCEL_DEPLOY_CHECK.md` | Vercel 프로젝트 연결, 환경변수 동기화, TLS는 플랫폼 기본 제공 확인, 월 인프라 비용 목표(10만원 이하) 재확인. | — | — | (배포 전 확인) | P1 |
| 64 | SUPABASE-ENV-VERIFY | Supabase 프로젝트/환경 확인 | CI_DEPLOY | IMPLEMENT | (지원 Task — ASM-01 Supabase 가용성 전제 확인) | — | — | — | DB-SCHEMA-BASE, INFRA-ENV-SECRETS | `docs/checklists/SUPABASE_ENV_CHECK.md` | Supabase 프로젝트의 Auth/Postgres/Storage 사용 가능 여부와 환경변수 매핑을 배포 전 확인. | — | 프로덕션 키를 저장소에 커밋하지 않았는지 확인. | (배포 전 확인) | P1 |

---

## 3. 핵심 Page Owner 의존 관계 요약

| Page Owner | 의존 Component 수 | 의존 Data/DB/Infra | 비고 |
|---|---:|---|---|
| PAGE-SCR001 | 5 (HERO-SEARCH, DESTINATIONS, SAFETY-PANEL, MATE-PREVIEW, ABOUT-SUMMARY) | DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE | Next.js Starter 화면·문구 제거 필수(§2-1 Seq 1 Functional AC) |
| PAGE-SCR002 | 6 (HERO-STATS, INTRO, TIMELINE, COUNTRY-CHIPS, GALLERY, MEMORABLE-CTA) | DATA-REPRESENTATIVE | — |
| PAGE-SCR003 | 3 (FLIGHT-FORM, HOTEL-FORM, MATE-WRITE) | INFRA-OUTBOUND-LINKS, INFRA-AUTH | 3개 Component가 각각 항공/숙소/동행 작성 영역을 분리 소유(규칙 9) |
| PAGE-SCR004 | 6 (FILTER, LIST, DETAIL, APPLY, REPORT, BLOCK) | DB-ACCESS | 목록·필터·상세·참가·신고·차단 각각 분리(규칙 10) |
| PAGE-SCR005 | 4 (AUTH, PROFILE, MY-ACTIVITY, ADMIN) | DB-ACCESS, INFRA-AUTH | Auth·Profile·My Activity·Admin 각각 분리(규칙 11) |

각 Page Owner는 정확히 1개의 `page_entry`만 소유하며(규칙 16), 어떤 Component/Shared/Data/DB/Infra Task도 `src/app/**/page.tsx`를 Expected Files에 포함하지 않는다.

---

## 4. NON_IMPLEMENTATION (EXCLUDED, 22건 — Task 없음)

`docs/PROJECT_SCOPE.md` 기준 EXCLUDED로 확정된 요구사항이다. 상세 구현 Task를 만들지 않으며, 아래 표로 추적표에서 삭제되지 않게 보존한다.

| Requirement | 근거(왜 EXCLUDED인가) | 후속 방향 |
|---|---|---|
| REQ-FUNC-045 | 자동 탈퇴 비식별화·30일 삭제 파이프라인은 정적 데이터·간단 Supabase 구성 범위를 벗어남 | 후속 버전에서 개인정보 삭제 파이프라인 별도 기획 시 재검토 |
| REQ-FUNC-055 | Editor/Admin 콘텐츠 작성·검수·게시 워크플로(CMS) 제외, 콘텐츠는 `src/data`로 직접 관리 | 콘텐츠 운영자가 늘어나면 경량 CMS 도입 검토 |
| REQ-FUNC-056 | 범용 변경 이력 보존(감사 로그) 제외, git 커밋 이력으로 대체 | 운영 규모 확대 시 별도 감사 로그 테이블 추가 검토 |
| REQ-FUNC-071 | 행동 분석 이벤트 파이프라인은 별도 분석 인프라가 필요해 제외 | Vercel Analytics 기본 페이지뷰로 최소 대체, 정식 이벤트 트래킹은 후속 검토 |
| REQ-FUNC-072 | 여행지·콘텐츠 CRUD(CMS) 제외, 정적 데이터로 직접 관리 | 콘텐츠 양 증가 시 관리자 CRUD 도입 검토 |
| REQ-FUNC-073 | 미디어 업로드·라이선스 승인 워크플로 제외, 이미지는 URL+alt만 사용 | 자체 이미지 자산 필요 시 Storage 업로드 흐름 별도 기획 |
| REQ-FUNC-074 | 게시 전 자동 완전성 게이트 제외, 수동 콘텐츠 검수 체크리스트로 대체 | 콘텐츠 CMS 도입 시 함께 재검토 |
| REQ-FUNC-075 | stale 현황 대시보드 제외, 공개 페이지 렌더링 시 stale 배지만 계산 | 안전정보 운영 인력 확대 시 대시보드 검토 |
| REQ-FUNC-076 | 범용 감사 로그(actor/action/before/after) 제외 | REQ-FUNC-056과 동일 후속 방향 |
| REQ-NF-004 | 동시 사용자 50명 조건의 정량 부하 측정 제외(정적 데이터 클라이언트 필터로 체감 응답 확보) | 트래픽 증가 시 부하 테스트 도구 도입 검토 |
| REQ-NF-007 | Lighthouse CI 자동 게이트 제외, RELEASE-CHECK-LIGHTHOUSE로 수동 대체 | CI 인프라 확장 시 자동화 재검토 |
| REQ-NF-008 | 가용성 99.5% SLA 모니터링 제외, Vercel 플랫폼 기본 가용성에 의존 | 유료 모니터링 도구 도입 시 재검토 |
| REQ-NF-009 | 5xx 비율 모니터링 제외 | REQ-NF-008과 동일 후속 방향 |
| REQ-NF-010 | 별도 백업 RPO/RTO 정책 제외, Supabase 기본 백업에 의존 | 데이터 중요도 상승 시 백업 정책 수립 검토 |
| REQ-NF-011 | 외부 링크 주 1회 자동 검사+Admin 알림 제외, RELEASE-CHECK-EXTERNAL-LINKS로 수동 대체 | 운영 자동화 확대 시 스케줄러 도입 검토 |
| REQ-NF-018 | 개인정보 내보내기/삭제 자동화 파이프라인 제외 | REQ-FUNC-045와 동일 후속 방향 |
| REQ-NF-020 | 신고 24h 90% 1차 검토 SLA 측정 대시보드 제외, 신고 상태값만 관리자 탭에서 확인 | 운영 인력 확대 시 SLA 대시보드 검토 |
| REQ-NF-021 | 서버 측 속도 제한(429) 인프라 제외, 클라이언트 중복 제출 방지만 적용 | 어뷰징 발생 시 Rate Limiting 도입 검토 |
| REQ-NF-022 | Moderator 조치 감사 로그 추적성 제외 | REQ-FUNC-056과 동일 후속 방향 |
| REQ-NF-029 | 미디어 라이선스 메타데이터 100% 제외, alt_text만 필수 | REQ-FUNC-073과 동일 후속 방향 |
| REQ-NF-032 | 구조화 로그(request_id 등) 제외, Vercel 기본 로그만 사용 | 운영 규모 확대 시 로깅 인프라 도입 검토 |
| REQ-NF-033 | 5xx>1% 등 자동 오류 알림 제외 | REQ-NF-008과 동일 후속 방향 |

---

## 5. Requirement Traceability 검증

| 구분 | 건수 | 검증 방법 |
|---|---:|---|
| REQ-FUNC-001~080 전체 | 80 | IMPLEMENT 71건은 §2 Task List `Requirement Ref` 열에서, EXCLUDED 9건은 §4 표에서 각각 정확히 1회 이상 등장 확인 |
| REQ-NF-001~034 전체 | 34 | IMPLEMENT 21건은 §2 Task List `Requirement Ref` 열에서, EXCLUDED 13건은 §4 표에서 각각 정확히 1회 이상 등장 확인 |
| **합계** | **114** | **누락 Requirement ID 없음(0건)** |

**미완료 고지:** 본 문서는 계획 산출물이며, §2의 어떤 Task도 아직 구현되지 않았다. 실제 구현·테스트 결과가 나오기 전까지 이 저장소는 "완료"로 보고하지 않는다.
