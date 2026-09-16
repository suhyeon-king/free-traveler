# Free Traveler — UI Coverage Analysis

- **Document ID:** UICOV-TRAVEL-001
- **기반 문서:** `docs/01_PRD.md.md`(PRD-TRAVEL-001), `docs/02_SRS_BASELINE.md.md`(SRS-TRAVEL-001), `docs/PROJECT_SCOPE.md`(SCOPE-TRAVEL-001)
- **목적:** SRS 전체 요구사항(REQ-FUNC-001~080, REQ-NF-001~034, 총 114건)을 5개 고정 디자인 Screen에 배치하고, 각 요구사항을 UI 성격별로 분류한다.

## 분류 기준

| 분류 | 정의 |
|---|---|
| **UI_DIRECT** | 사용자가 화면에서 직접 보거나 조작하는 요소(목록, 필터, 폼, 버튼, 배지, 패널, 링크 등)로 구현되는 요구사항 |
| **UI_STATE** | 화면 동작을 뒷받침하는 상태·로직(세션 유지, URL 동기화, 미저장 처리, 중복 방지 등)으로, 별도의 새로운 화면 요소를 만들지 않는 요구사항 |
| **NON_UI** | 화면에 직접 드러나지 않는 백엔드·데이터·보안·성능 요구사항 |
| **OPERATIONS** | 콘텐츠 거버넌스·모니터링·SLA·배포·비용 등 운영 프로세스 요구사항(다수가 `PROJECT_SCOPE.md`에서 EXCLUDED) |

`PROJECT_SCOPE 분류` 열은 `docs/PROJECT_SCOPE.md`의 상태(IMPLEMENT / IMPLEMENT(간소화) / EXCLUDED)를 그대로 인용한다.

---

## 1. 디자인 Screen 정의 (5개 고정)

### SCR-001 `/` 메인

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 국내·해외 여행지를 탐색해 후보를 좁히고, 여행지·국가 안전정보를 확인한 뒤 다음 행동으로 이동한다 |
| 주요 영역 | 전역 내비게이션/푸터, 통합 검색, 국내·해외 탭 및 필터, 여행지 목록, 즐겨찾기 토글, 대표 소개 미리보기 카드, 여행지 상세 **Drawer/Modal**, 국가 안전정보 **Drawer/Modal**, 빠른 이동 카드(여행 준비/동행 조회/계정) |
| 상태 | 목록·검색·필터 상태, 빈 결과 상태, Drawer/Modal open/close 상태, 안전정보 stale 경고 상태, 즐겨찾기 상태(localStorage), 공유 링크 상태 |
| 이동 목적지 | 대표 소개(SCR-002), 여행 준비(SCR-003), 동행 조회(SCR-004), 계정(SCR-005), 외교부 등 공식 출처(새 탭) |

### SCR-002 `/about` 대표 소개

| 항목 | 내용 |
|---|---|
| 사용자 목표 | `free_traveler`의 여행 경험과 편집 원칙을 확인해 콘텐츠 신뢰도를 판단한다 |
| 주요 영역 | 프로필 히어로, `50+ Trips`/`30+ Countries` 수치 카드, 철학·편집 원칙, 방문 권역 지도 또는 목록, 여행 타임라인, 추천 여행지 6, 문의·SNS 링크 |
| 상태 | 정적 콘텐츠 중심(추천 여행지·국가 링크의 유효성만 동적으로 검사) |
| 이동 목적지 | 추천 여행지 클릭 시 SCR-001 여행지 상세 Drawer, 방문 국가 클릭 시 SCR-001 관련 여행지/안전정보 Drawer |

### SCR-003 `/travel-tools` 통합 여행 준비

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 항공·숙소 조건을 정리해 외부 예약 사이트로 이동하거나, 동행 모집글을 작성한다 |
| 주요 영역 | **3개 탭**: ① 항공 탭(REQ-FUNC-011~018), ② 숙소 탭(REQ-FUNC-019~026), ③ 동행 작성 탭(REQ-FUNC-029, 031~033, 080 안전수칙 동의). 각 탭은 입력 폼, 필드별 오류, 요약 화면, 비전달 고지, 외부 이동/제출 버튼으로 구성 |
| 상태 | 탭 선택 상태, 폼 입력 상태(브라우저 세션 한정, 서버 미저장), 검증 오류 상태, 요약 확인 상태, 외부 이동 오류/재시도 상태, 연락처 패턴 탐지 차단 상태, 동행글 제출 완료 상태 |
| 이동 목적지 | 항공/숙소: 외부 일반 페이지(새 탭). 동행 작성 완료 후: SCR-004 상세 패널. 미인증 사용자: SCR-005 로그인 탭 |

### SCR-004 `/mates` 동행 조회

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 조건에 맞는 동행 모집글을 찾아 상세 내용을 확인하고 참가를 요청한다 |
| 주요 영역 | 필터(국가·지역·기간·연령대·성별·여행 스타일·모집 상태), 모집글 목록, **동행 상세 패널**(작성자 표시 정보·조건·설명·모집 상태 배지·참가 요청 제출·신고/차단 트리거) |
| 상태 | 필터 상태, 목록 로딩/빈 결과 상태, 상세 패널 open 상태, 참가 요청 제출/중복 차단 상태, 자동 마감(종료일 경과 계산) 표시 상태 |
| 이동 목적지 | 로그인·성인 확인 필요 시 SCR-005 로그인 탭, 요청 승인·거절/차단 관리는 SCR-005 내 활동 탭, 새 모집글 작성은 SCR-003 동행 작성 탭 |

### SCR-005 `/account` 계정·관리

| 항목 | 내용 |
|---|---|
| 사용자 목표 | 로그인·가입·성인 확인을 완료하고, 내 프로필·활동(작성 글, 참가 요청, 차단, 신고)과 간단한 관리자 기능을 관리한다 |
| 주요 영역 | **4개 탭**: ① 로그인·가입(REQ-FUNC-027, 066), ② 프로필(REQ-FUNC-029), ③ 내 활동(작성 글 수정·마감·삭제, 요청 승인·거절, 차단 관리, 신고 내역), ④ 간단 관리자(신고 큐·상태 변경, 외부 URL 설정) — 관리자 탭은 Moderator/Admin 권한에서만 노출 |
| 상태 | 로그인 여부, 성인 확인 여부, 탭 선택 상태, 프로필 저장 상태, 요청 승인/거절 상태, 차단 목록 상태, 권한별 탭 노출 상태 |
| 이동 목적지 | 로그인 완료 후 진입 전 화면(SCR-001/003/004)으로 복귀, 내 활동에서 작성 글 클릭 시 SCR-004 상세 패널로 이동 |

> API Route, 인증 callback(`/auth/callback` 등), 404/500/오류 라우트는 기술 Route이며 위 5개 디자인 Screen에 포함하지 않는다.

---

## 2. Requirement 매핑

### 2-1. F1 Destination Guide (REQ-FUNC-001~010)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-001 | UI_DIRECT | IMPLEMENT | SCR-001 | 국내·해외 탭 목록 |
| REQ-FUNC-002 | UI_DIRECT | IMPLEMENT | SCR-001 | 필터 UI |
| REQ-FUNC-003 | UI_DIRECT | IMPLEMENT | SCR-001 | 키워드 검색 |
| REQ-FUNC-004 | UI_DIRECT | IMPLEMENT | SCR-001 | 여행지 상세 Drawer/Modal 필드 |
| REQ-FUNC-005 | UI_DIRECT | IMPLEMENT | SCR-001 | 빈 결과 안내+초기화 버튼 |
| REQ-FUNC-006 | UI_DIRECT | IMPLEMENT | SCR-001 | 상세 Drawer→안전정보 Drawer 연결 |
| REQ-FUNC-007 | UI_DIRECT | IMPLEMENT(간소화) | SCR-001 | 대체텍스트·출처 표시(작가·라이선스 간소화) |
| REQ-FUNC-008 | NON_UI | IMPLEMENT | — | 콘텐츠 수량 데이터 검증(비가시) |
| REQ-FUNC-009 | UI_DIRECT | IMPLEMENT | SCR-001 | 관련 여행지 6개 |
| REQ-FUNC-010 | UI_STATE | IMPLEMENT | SCR-001 | 필터 URL 동기화 |

### 2-2. F2 Flight Link-out (REQ-FUNC-011~018)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-011 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 입력 폼 |
| REQ-FUNC-012 | UI_STATE | IMPLEMENT | SCR-003(항공 탭) | 국가→지역 종속 옵션 로직 |
| REQ-FUNC-013 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 날짜 오류 표시 |
| REQ-FUNC-014 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 요약 화면 |
| REQ-FUNC-015 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 비전달 고지 문구 |
| REQ-FUNC-016 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 외부 이동 버튼 |
| REQ-FUNC-017 | UI_STATE | IMPLEMENT | SCR-003(항공 탭) | 서버 미저장(클라이언트 상태) |
| REQ-FUNC-018 | UI_DIRECT | IMPLEMENT | SCR-003(항공 탭) | 오류/재시도 표시 |

### 2-3. F3 Hotel Link-out (REQ-FUNC-019~026)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-019 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 입력 폼 |
| REQ-FUNC-020 | UI_STATE | IMPLEMENT | SCR-003(숙소 탭) | 국가→지역 종속 옵션 로직 |
| REQ-FUNC-021 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 날짜 오류 표시 |
| REQ-FUNC-022 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 요약 화면 |
| REQ-FUNC-023 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 비전달 고지 문구 |
| REQ-FUNC-024 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 외부 이동 버튼 |
| REQ-FUNC-025 | UI_STATE | IMPLEMENT | SCR-003(숙소 탭) | 서버 미저장(클라이언트 상태) |
| REQ-FUNC-026 | UI_DIRECT | IMPLEMENT | SCR-003(숙소 탭) | 오류/재시도 표시 |

### 2-4. F4 Travel Mate (REQ-FUNC-027~045)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-027 | UI_DIRECT | IMPLEMENT | SCR-005(로그인 탭) | 비회원 로그인 유도 |
| REQ-FUNC-028 | UI_STATE | IMPLEMENT | SCR-005(로그인 탭) | 성인 확인 상태 저장(생년월일 미저장) |
| REQ-FUNC-029 | UI_DIRECT | IMPLEMENT | SCR-005(프로필 탭) | 프로필 필드, 작성 시 SCR-003 동행 탭에서도 참조 |
| REQ-FUNC-030 | UI_DIRECT | IMPLEMENT | SCR-004 | 필터 UI |
| REQ-FUNC-031 | UI_DIRECT | IMPLEMENT | SCR-003(동행 작성 탭) | 작성 폼 |
| REQ-FUNC-032 | UI_DIRECT | IMPLEMENT | SCR-003(동행 작성 탭) | 연락처 탐지 차단 안내 |
| REQ-FUNC-033 | UI_STATE | IMPLEMENT | SCR-004 | 응답에서 연락처 필드 제외 |
| REQ-FUNC-034 | UI_DIRECT | IMPLEMENT | SCR-004(상세 패널) | 참가 요청 제출 |
| REQ-FUNC-035 | UI_STATE | IMPLEMENT | SCR-004(상세 패널) | 중복 요청 차단 로직 |
| REQ-FUNC-036 | UI_DIRECT | IMPLEMENT(간소화) | SCR-005(내 활동 탭) | 승인/거절 처리 |
| REQ-FUNC-037 | UI_DIRECT | IMPLEMENT | SCR-004 | 자동 마감 배지(조회 시 계산) |
| REQ-FUNC-038 | UI_DIRECT | IMPLEMENT | SCR-005(내 활동 탭) | 수동 마감·수정·삭제 |
| REQ-FUNC-039 | UI_DIRECT | IMPLEMENT | SCR-004(상세 패널) | 신고 트리거, 접수 내역은 SCR-005 |
| REQ-FUNC-040 | UI_DIRECT | IMPLEMENT | SCR-005(내 활동 탭) | 차단/해제 관리, 트리거는 SCR-004 |
| REQ-FUNC-041 | UI_DIRECT | IMPLEMENT(간소화) | SCR-005(관리자 탭) | 신고 상태 필터 큐 |
| REQ-FUNC-042 | UI_DIRECT | IMPLEMENT(간소화) | SCR-005(관리자 탭) | 신고 상태 변경 |
| REQ-FUNC-043 | UI_DIRECT | IMPLEMENT(간소화) | SCR-004, SCR-005 | 인앱 Toast 알림(이메일 제외) |
| REQ-FUNC-044 | NON_UI | IMPLEMENT | — | Supabase RLS 정책 |
| REQ-FUNC-045 | OPERATIONS | EXCLUDED | — | 자동 삭제·보존 파이프라인 미구현 |

### 2-5. F5 Country Safety (REQ-FUNC-046~056)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-046 | NON_UI | IMPLEMENT | — | 해외 국가 안전정보 커버리지(콘텐츠 데이터) |
| REQ-FUNC-047 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | 8개 카테고리 표시 |
| REQ-FUNC-048 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | 출처·확인일 표시 |
| REQ-FUNC-049 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | 외교부 링크(새 탭) |
| REQ-FUNC-050 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | stale 경고 배지(렌더링 시 계산) |
| REQ-FUNC-051 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | 중대 경보 상단 텍스트 |
| REQ-FUNC-052 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | 국가/지역 범위 구분 표시 |
| REQ-FUNC-053 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | 긴급연락처 표시 |
| REQ-FUNC-054 | UI_DIRECT | IMPLEMENT | SCR-001, SCR-003(항공 탭) | 공식 판단 대체 불가 고지 |
| REQ-FUNC-055 | OPERATIONS | EXCLUDED | — | 별도 CMS 작성·검수·게시 워크플로 미구현 |
| REQ-FUNC-056 | OPERATIONS | EXCLUDED | — | 변경 이력 DB 보존 미구현 |

### 2-6. F6 About free_traveler (REQ-FUNC-057~063)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-057 | UI_DIRECT | IMPLEMENT | SCR-002 | 대표명·수치 카드 |
| REQ-FUNC-058 | UI_DIRECT | IMPLEMENT | SCR-002 | 소개문·철학 |
| REQ-FUNC-059 | UI_DIRECT | IMPLEMENT | SCR-002 | 방문 권역 지도/목록 |
| REQ-FUNC-060 | UI_DIRECT | IMPLEMENT | SCR-002 | 여행 타임라인 |
| REQ-FUNC-061 | UI_DIRECT | IMPLEMENT(간소화) | SCR-002 | 이미지 메타 표시 |
| REQ-FUNC-062 | UI_DIRECT | IMPLEMENT(간소화) | SCR-002 | 문의·SNS 링크 |
| REQ-FUNC-063 | UI_DIRECT | IMPLEMENT | SCR-002 | 추천 여행지 6개(→SCR-001 Drawer) |

### 2-7. F7 Common, Admin, Governance (REQ-FUNC-064~080)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-FUNC-064 | UI_DIRECT | IMPLEMENT | 전역(5개 Screen 공통) | 내비게이션·푸터 |
| REQ-FUNC-065 | UI_STATE | IMPLEMENT | 전역(5개 Screen 공통) | 반응형 레이아웃 동작 |
| REQ-FUNC-066 | UI_DIRECT | IMPLEMENT | SCR-005(로그인 탭) | 가입·인증·로그인·로그아웃·재설정 |
| REQ-FUNC-067 | UI_DIRECT | IMPLEMENT | SCR-001 | 통합 검색 |
| REQ-FUNC-068 | UI_DIRECT | IMPLEMENT | SCR-001 | 즐겨찾기(localStorage) |
| REQ-FUNC-069 | UI_DIRECT | IMPLEMENT | SCR-001, SCR-004 | URL 공유 |
| REQ-FUNC-070 | NON_UI | IMPLEMENT | — | SEO 메타데이터(비가시) |
| REQ-FUNC-071 | OPERATIONS | EXCLUDED | — | 행동 분석 이벤트 파이프라인 미구현 |
| REQ-FUNC-072 | OPERATIONS | EXCLUDED | — | 콘텐츠 CRUD/CMS 미구현 |
| REQ-FUNC-073 | OPERATIONS | EXCLUDED | — | 미디어 업로드·라이선스 워크플로 미구현 |
| REQ-FUNC-074 | OPERATIONS | EXCLUDED | — | 게시 완전성 자동 게이트 미구현 |
| REQ-FUNC-075 | OPERATIONS | EXCLUDED | — | stale 현황 대시보드 미구현 |
| REQ-FUNC-076 | OPERATIONS | EXCLUDED | — | 범용 감사 로그 미구현 |
| REQ-FUNC-077 | UI_DIRECT | IMPLEMENT | SCR-005(관리자 탭) | 외부 URL 설정 |
| REQ-FUNC-078 | UI_DIRECT | IMPLEMENT | 전역(5개 Screen 공통) | 오류 화면 복구 행동(전용 Screen 아님) |
| REQ-FUNC-079 | UI_STATE | IMPLEMENT | 전역(5개 Screen 공통) | ARIA/시맨틱 상태 |
| REQ-FUNC-080 | UI_DIRECT | IMPLEMENT | SCR-003(동행 작성 탭) | 안전수칙 동의 체크박스, 정책 본문은 전역 푸터 링크 |

### 2-8. NF Performance (REQ-NF-001~007)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-001 | NON_UI | IMPLEMENT | — | LCP 목표(전 Screen 공통) |
| REQ-NF-002 | NON_UI | IMPLEMENT | — | INP 목표 |
| REQ-NF-003 | NON_UI | IMPLEMENT | — | CLS 목표 |
| REQ-NF-004 | NON_UI | EXCLUDED | — | 동시 50명 부하 측정 미수행 |
| REQ-NF-005 | NON_UI | IMPLEMENT | — | 쓰기 API 응답시간 목표 |
| REQ-NF-006 | UI_STATE | IMPLEMENT | 전역(이미지 렌더링) | lazy load/priority |
| REQ-NF-007 | OPERATIONS | EXCLUDED | — | Lighthouse CI 게이트 미구현 |

### 2-9. NF Reliability and Recovery (REQ-NF-008~011)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-008 | OPERATIONS | EXCLUDED | — | 가용성 SLA 모니터링 미구현 |
| REQ-NF-009 | OPERATIONS | EXCLUDED | — | 5xx 모니터링 미구현 |
| REQ-NF-010 | OPERATIONS | EXCLUDED | — | 백업 RPO/RTO 미구현 |
| REQ-NF-011 | OPERATIONS | EXCLUDED | — | 외부 링크 자동 검사+알림 미구현 |

### 2-10. NF Security and Privacy (REQ-NF-012~018)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-012 | NON_UI | IMPLEMENT | — | TLS |
| REQ-NF-013 | NON_UI | IMPLEMENT | — | RLS 서버 검증 |
| REQ-NF-014 | NON_UI | IMPLEMENT | — | CSRF/SameSite |
| REQ-NF-015 | NON_UI | IMPLEMENT | — | 입력 검증/XSS 차단 |
| REQ-NF-016 | NON_UI | IMPLEMENT | — | 비밀키 환경변수 |
| REQ-NF-017 | UI_STATE | IMPLEMENT | SCR-003 | 항공·호텔 원시 입력 미보존 |
| REQ-NF-018 | OPERATIONS | EXCLUDED | — | 개인정보 삭제 파이프라인 미구현 |

### 2-11. NF Safety and Moderation (REQ-NF-019~022)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-019 | NON_UI | IMPLEMENT | — | 신고 접수 응답시간 목표 |
| REQ-NF-020 | OPERATIONS | EXCLUDED | — | 24h 90% SLA 측정 미구현 |
| REQ-NF-021 | NON_UI | EXCLUDED | — | 서버 속도 제한(429) 미구현 |
| REQ-NF-022 | OPERATIONS | EXCLUDED | — | Moderator 조치 감사 로그 미구현 |

### 2-12. NF Accessibility (REQ-NF-023~025)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-023 | UI_STATE | IMPLEMENT | 전역(5개 Screen 공통) | WCAG 2.2 AA 목표 |
| REQ-NF-024 | OPERATIONS | IMPLEMENT | — | axe 자동 검사(QA 프로세스) |
| REQ-NF-025 | OPERATIONS | IMPLEMENT | — | 키보드·스크린리더 수동 검사(QA 프로세스) |

### 2-13. NF Content, Freshness, SEO, Copyright (REQ-NF-026~030)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-026 | NON_UI | IMPLEMENT | — | 콘텐츠 완전성(데이터 검수) |
| REQ-NF-027 | NON_UI | IMPLEMENT | — | 안전정보 커버리지(데이터) |
| REQ-NF-028 | UI_DIRECT | IMPLEMENT | SCR-001(안전 Drawer/Modal) | stale 경고 배지(REQ-FUNC-050과 동일 메커니즘) |
| REQ-NF-029 | NON_UI | EXCLUDED | — | 미디어 라이선스 메타 100% 미구현 |
| REQ-NF-030 | NON_UI | IMPLEMENT | — | SEO 메타 누락 점검(비가시) |

### 2-14. NF Maintainability, Monitoring, Cost (REQ-NF-031~034)

| ID | UI 분류 | PROJECT_SCOPE 분류 | Screen | 비고 |
|---|---|---|---|---|
| REQ-NF-031 | OPERATIONS | IMPLEMENT | — | TS strict/lint/test(개발 프로세스) |
| REQ-NF-032 | OPERATIONS | EXCLUDED | — | 구조화 로그 미구현 |
| REQ-NF-033 | OPERATIONS | EXCLUDED | — | 5분 내 오류 알림 미구현 |
| REQ-NF-034 | OPERATIONS | IMPLEMENT | — | 월 인프라 비용 목표 |

---

## 3. 검증 요약

### 3-1. Requirement 총수

| 구분 | 건수 |
|---|---:|
| REQ-FUNC-001~080 | 80 |
| REQ-NF-001~034 | 34 |
| **합계** | **114** |

### 3-2. UI 분류별 집계

| UI 분류 | REQ-FUNC | REQ-NF | 합계 |
|---|---:|---:|---:|
| UI_DIRECT | 57 | 1 | 58 |
| UI_STATE | 10 | 3 | 13 |
| NON_UI | 4 | 16 | 20 |
| OPERATIONS | 9 | 14 | 23 |
| **합계** | **80** | **34** | **114** |

### 3-3. PROJECT_SCOPE 분류별 집계 (docs/PROJECT_SCOPE.md와 일치)

| PROJECT_SCOPE 분류 | REQ-FUNC | REQ-NF | 합계 |
|---|---:|---:|---:|
| IMPLEMENT / IMPLEMENT(간소화) | 71 | 21 | 92 |
| EXCLUDED | 9 | 13 | 22 |
| **합계** | **80** | **34** | **114** |

### 3-4. Screen별 배치 건수 (UI_DIRECT·UI_STATE 항목 기준, 복수 Screen에 걸친 요구사항은 주 Screen에서 1회 집계)

| Screen | 배치된 Requirement 수 |
|---|---:|
| SCR-001 `/` 메인 | 21 |
| SCR-002 `/about` | 7 |
| SCR-003 `/travel-tools` | 20 |
| SCR-004 `/mates` | 6 |
| SCR-005 `/account` | 11 |
| 전역(5개 Screen 공통) | 6 |
| Screen 미지정(NON_UI/OPERATIONS) | 43 |
| **합계** | **114** |

> 5개 디자인 Screen(SCR-001~005)만 정의했으며, API Route·인증 callback·404/500 오류 라우트는 기술 Route로서 별도 디자인 Screen으로 세지 않았다. `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 기록된 요구사항은 본 문서에서도 동일하게 EXCLUDED로 유지했으며 구현 범위로 되돌리지 않았다.
