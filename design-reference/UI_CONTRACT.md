# Free Traveler — UI Contract

- **기반 문서:** `docs/03_UI_COVERAGE_ANALYSIS.md`, `docs/04_UIUX_PLAN.md`, `docs/STITCH_VALIDATION_REPORT.md`, `design-reference/D-001/DESIGN.md`
- **목적:** 승인된 5개 Screen(SCR-001~005)을 Next.js App Router 구현 계약으로 확정한다. 여기 기록된 영역 순서·Component·상태·이동·금지 기능은 `design-reference/SCREEN_ROUTE_CONTRACT.json`과 1:1로 대응한다.
- **화면 구분:** 핵심 화면 4개(여행지 탐색 / 항공 / 숙소 / 동행 찾기, 이 중 항공·숙소는 SCR-003 한 화면에 통합) + 보조 화면 1개(대표 소개) + 지원 화면 1개(계정·관리, SCR-005).

---

## SCR-001

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-001 |
| **Route** | `/` |
| **Page Entry** | `src/app/page.tsx` |
| **분류** | 핵심(여행지 탐색) |
| **영역 순서** | Header → ① 검색 Hero → ② 국내 여행지 Card Grid(6) → ③ 해외 여행지 Card Grid(6) → ④ 여행 동기 Chip(6) → ⑤ 국가별 주의사항 Card Grid(6)+Drawer 연결 → ⑥ 최근 동행글 List(3)/완성형 Empty State → ⑦ free_traveler 요약+CTA → Footer |
| **주요 Component** | `Header`, `Footer`, `SearchBarPill`, `DestinationCardGrid`, `ThemeChipList`, `SafetyCardGrid`, `DestinationDrawer`, `SafetyDrawer`, `MatePostMiniList`, `EmptyState`, `RepresentativeSummaryCard` |
| **상태** | Loading(Card Grid 스켈레톤) · Success · Empty(⑥ 최근 동행글만, 나머지 Section은 정적 시드로 항상 채움) · Error(목록 로드 실패 시 Section 단위 인라인 오류+재시도) |
| **사용자 행동** | 키워드 검색, 테마 Chip 클릭(목록 필터), 즐겨찾기 토글(localStorage), 여행지 Card 클릭(→ 상세 Drawer), 안전정보 Card/상세 Drawer 내 "안전정보 보기" 클릭(→ 안전정보 Drawer), 동행글 Card 클릭, CTA 버튼 클릭 |
| **다른 화면으로의 이동** | Hero/빠른 이동 CTA → `/travel-tools`(SCR-003) · 최근 동행글 "더 보기"/Empty CTA → `/mates`(SCR-004) · free_traveler 요약 CTA → `/about`(SCR-002) · 계정 아이콘 → `/account`(SCR-005) · 여행지·안전정보 상세는 Drawer/Modal로 **같은 화면 안에서** 처리(라우트 이동 없음) |
| **Desktop·Mobile 규칙** | Desktop 1440px: 콘텐츠 최대 폭 1200~1280px, Section 상하 여백 64~96px, Hero 높이 520~600px(다음 Section 상단 노출). Mobile 390px: Section 상하 여백 40~64px, Card Grid 1열/가로 스크롤, Header 햄버거 축소 |
| **금지 기능** | 별점·후기·매너온도, 조작된 실시간 통계, Airbnb 상표·문구, 예약/결제 UI, 광고 배너, `D-001/DESIGN.md` Color Token 외 임의 색상 |

## SCR-002

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-002 |
| **Route** | `/about` |
| **Page Entry** | `src/app/about/page.tsx` |
| **분류** | 보조(대표 소개) |
| **영역 순서** | Header → ① 프로필 Hero → ② 여행 지표(3) → ③ 소개 문단(2~4) → ④ 여행 Timeline(6+) → ⑤ 방문 국가 Chip(권역별, 30개국+) → ⑥ 여행 Gallery(8장+) → ⑦ 기억에 남는 여행지(4)+CTA Banner → Footer |
| **주요 Component** | `Header`, `Footer`, `ProfileHero`, `StatCard`, `IntroText`, `Timeline`, `CountryChipGroup`, `PhotoGallery`, `DestinationCardGrid`, `CTABanner` |
| **상태** | Success(정적 콘텐츠, 시드 데이터로 상시 충족) · Loading(이미지 지연 로드 스켈레톤) · Error(이미지 로드 실패 시 대체 placeholder+alt 유지, Section 자체는 유지) |
| **사용자 행동** | 방문 국가 Chip 클릭, 추천 여행지 Card 클릭, 하단 CTA 클릭 |
| **다른 화면으로의 이동** | 방문 국가/추천 여행지 클릭 → `/`(SCR-001) 관련 여행지·안전정보 Drawer · 하단 CTA Banner → `/travel-tools`(SCR-003), `/mates`(SCR-004) |
| **Desktop·Mobile 규칙** | Desktop: 최대 폭 1200~1280px, Timeline 좌우 교차 배치. Mobile: Timeline 좌측 고정 1열, Gallery 2열, Chip 권역별 가로 스크롤 |
| **금지 기능** | 별점·후기, Airbnb 상표·문구, 예약/결제 UI, 광고, 임의 색상 |

## SCR-003

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-003 |
| **Route** | `/travel-tools` |
| **Page Entry** | `src/app/travel-tools/page.tsx` |
| **분류** | 핵심(항공 + 숙소, 동일 화면 3-Tab 통합) |
| **영역 순서** | Header → ① Intro(이용 3단계 요약) → ② 탭 바(항공편/숙소/동행 구하기) → ③ 조건 입력 Form(활성 탭) → ④ 입력 요약+외부 이동 Action Card → ⑤ 비전달 고지+Tip(3) → ⑥ 동행 탭: 로그인 안내 카드 또는 작성 Form+안전 안내 → Footer |
| **주요 Component** | `Header`, `Footer`, `IntroSection`, `TabBar`, `TripConditionForm`, `SummaryActionCard`, `NonTransmissionNotice`, `TipChipList`, `MateWriteForm`, `LoginGuideCard` |
| **상태** | Loading(국가→지역 옵션 로드) · Success(요약/외부 이동 가능) · Empty(국가 미선택 시 지역 비활성+안내) · Error(날짜 검증 실패, 연락처 패턴 탐지 차단, 외부 URL 오류+재시도) · Unauthorized(동행 탭에서 비로그인/성인 미확인 시 작성 Form 대신 안내 카드) |
| **사용자 행동** | 탭 전환, 국가·지역·날짜 입력/검증, "계속" → 요약 확인, "항공편/숙소 보러 가기" 클릭(새 탭 외부 이동), 동행 모집글 작성 필드 입력+안전수칙 동의, "로그인/가입하기" 클릭 |
| **다른 화면으로의 이동** | 항공/숙소 외부 이동 → 설정된 외부 사이트(새 탭, `noopener,noreferrer`) · 동행 탭 미인증 → `/account`(SCR-005) · 동행글 작성 완료 → `/mates`(SCR-004) 상세 |
| **Desktop·Mobile 규칙** | 항공/숙소/동행 세 탭의 입력·검증·완료 상태를 서로 독립적으로 유지. Desktop: Form과 요약 Card 좌우 분할 또는 세로 스택, Tip 가로 3열. Mobile: Form→요약→고지 세로 스택, Tip 가로 스크롤, 동행 작성 Form은 섹션 아코디언 |
| **금지 기능** | "항공권 비교"·"최저가 실시간 비교"·"실시간" 배지 등 내부 가격 비교·실시간 검색 암시 문구, 별점·후기·매너온도, 조작된 실시간 통계("실시간 N명 대기중"), 입력값 서버 DB/로그/쿼리 저장·전달, 예약/결제 UI |

## SCR-004

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-004 |
| **Route** | `/mates` |
| **Page Entry** | `src/app/mates/page.tsx` |
| **분류** | 핵심(동행 찾기) |
| **영역 순서** | Header → ① Intro+작성 CTA → ② 검색 Filter+결과 요약 → ③ 동행글 Card List(최대 8)/완성형 Empty State → ④ 목록+상세 분할(Desktop)/목록→상세 Drawer(Mobile) → ⑤ 신청 방법 3단계 안내 → ⑥ 안전/신고/차단 안내+CTA → Footer |
| **주요 Component** | `Header`, `Footer`, `IntroCTA`, `MateFilterBar`, `MatePostCardList`, `MateDetailPanel`, `MateDetailDrawer`, `ApplyStepGuide`, `SafetyNoticeCTA`, `EmptyState` |
| **상태** | Loading(Filter 결과 스켈레톤) · Success · Empty(필터 결과 0건 시 초기화+작성 CTA+이용 방법) · Error(참가 요청 중복 제출, 신고/차단 처리 실패 인라인 오류) · Unauthorized(비로그인/성인 미확인 시 참가 요청·신고·차단 대신 안내 카드) |
| **사용자 행동** | Filter 적용, 동행글 Card 클릭(→ 상세), 참가 요청 메시지 제출, 신고/차단 트리거, "동행글 작성하기" CTA 클릭 |
| **다른 화면으로의 이동** | 미인증 사용자 참가 요청 시도 → `/account`(SCR-005) 로그인 탭 · "동행글 작성하기" → `/travel-tools`(SCR-003) 동행 탭 · 하단 안전 안내 CTA → `/travel-tools`(SCR-003) |
| **Desktop·Mobile 규칙** | Desktop 1440px: 목록(30%)+상세 패널(70%) 2열 고정 분할. Mobile 390px: 목록 1열, Card 선택 시 하단 Bottom Sheet Drawer로 상세 오픈 |
| **금지 기능** | 별점·후기·매너온도, 공개 연락처 노출, 조작된 실시간 통계, Airbnb 상표·문구, 예약/결제 UI |

## SCR-005

| 항목 | 내용 |
|---|---|
| **Screen ID** | SCR-005 |
| **Route** | `/account` |
| **Page Entry** | `src/app/account/page.tsx` |
| **분류** | 지원(계정·관리, 로그인·프로필·내 활동·간단 관리자) |
| **영역 순서(역할별 탭, 역할에 없는 탭은 렌더링하지 않음)** | Header → **Guest**: Intro → 로그인/가입/비밀번호 재설정 Form → 로그인 후 가능한 기능 안내 → 보안 안내. **Member**: 프로필·성인 확인 요약 → 내 글(수정/마감/삭제) → 참가 요청(승인/거절) → 차단 목록(완성형 Empty State 가능) → 새 동행글 작성 CTA. **Admin**: 관리 Intro → 신고 상태 변경(OPEN/REVIEWING/RESOLVED/DISMISSED) → 항공·숙소 외부 URL 설정 → Footer |
| **주요 Component** | `Header`, `Footer`, `AccountTabNav`(역할 기반 노출), `AuthForms`, `ProfileSummaryCard`, `MyPostList`, `RequestList`, `BlockList`, `EmptyState`, `AdminReportQueue`, `OutboundUrlForm` |
| **상태** | Loading(탭 전환 시 목록/프로필 스켈레톤) · Success · Empty(내 글/참가 요청/차단 목록/신고 목록 각각 완성형 Empty State) · Error(로그인 실패, 프로필 저장 실패, 외부 URL HTTPS 형식 오류) · Unauthorized(비로그인 시 Guest 탭만 노출, 권한 없는 Admin 탭 직접 접근 시 안내+기본 탭 이동) |
| **사용자 행동** | 로그인/가입/재설정 제출, 탭 전환, 프로필 수정, 동행글 수정/마감/삭제, 참가 요청 승인/거절, 차단 해제, (Admin) 신고 상태 변경, (Admin) 외부 URL 저장 |
| **다른 화면으로의 이동** | 로그인 완료 후 진입 전 화면(`/`, `/travel-tools`, `/mates`)으로 복귀 · 내 글 클릭 → `/mates`(SCR-004) 상세 · 새 동행글 작성 CTA → `/travel-tools`(SCR-003) 동행 탭 |
| **Desktop·Mobile 규칙** | Desktop 1440px: 좌측 세로 탭 내비게이션(240px)+우측 콘텐츠(최대 960px). Mobile 390px: 상단 가로 스크롤 탭, 콘텐츠 세로 1열 |
| **금지 기능** | 후기 작성 기능("후기 작성 안내" 등), Admin 탭(신고 상태 변경·외부 URL 설정) 생략, 복잡한 통계 Dashboard, 별점, Airbnb 상표·문구, 예약/결제 UI |

---

## 공통 규칙 (5개 Screen 전체)

- Header·Footer는 `design-reference/D-001/DESIGN.md`에 정의된 동일 컴포넌트를 5개 Screen 모두 재사용한다.
- 모든 외부 이동 링크는 새 탭 + `noopener,noreferrer`를 적용하고 사용자 입력값을 쿼리로 붙이지 않는다.
- 최소 터치 영역 44×44px, 키보드 포커스 링을 모든 상호작용 요소에 적용한다.
- 인증 콜백(`/auth/callback` 등), API Route, `not-found`(404) 같은 기술 Route는 Screen 수에 포함하지 않으며 `SCREEN_ROUTE_CONTRACT.json`의 `technical_routes`에서만 기록한다.
