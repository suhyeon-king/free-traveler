# Free Traveler — UI/UX Traceability Matrix

- **Document ID:** UIUX-TRACE-001
- **기반 문서:** `docs/02_SRS_BASELINE.md`, `docs/PROJECT_SCOPE.md`, `docs/03_UI_COVERAGE_ANALYSIS.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `docs/05_UIUX_APPROVED.md`, `docs/06_SRS_UIUX_REVISED.md`
- **범위:** REQ-FUNC-001~080, REQ-NF-001~034 **114건 전체** (삭제 없음)

## 열 정의

| 열 | 의미 |
|---|---|
| **Requirement** | Baseline SRS의 REQ ID(문구·ID 변경 없음) |
| **Implementation Status** | `docs/PROJECT_SCOPE.md` 기준 IMPLEMENT / IMPLEMENT(간소화) / EXCLUDED |
| **Screen** | 요구사항이 배치된 승인 Screen(SCR-001~005), 전역 공통, 또는 화면 없음(`—`) |
| **Route** | 대응 Next.js Route (`design-reference/SCREEN_ROUTE_CONTRACT.json` 기준) |
| **Page Entry** | 대응 페이지 파일 경로 |
| **Task** | 구현 Task ID. Task가 아직 생성되지 않았으므로 IMPLEMENT 계열은 `PENDING_TASK_GENERATION`, EXCLUDED는 `N/A (EXCLUDED)` |
| **Test** | 대응 테스트 케이스(Baseline SRS §5.1/5.2 `TC-FUNC-XXX`/`TC-NF-XXX`와 번호 대응). 아직 작성·실행되지 않았으므로 `(NOT_STARTED)`로 표기, EXCLUDED는 `N/A (EXCLUDED)` |
| **Status** | 행 전체 진행 상태: IMPLEMENT 계열은 `NOT_STARTED`(아직 미구현, 거짓 기록 금지), EXCLUDED는 `EXCLUDED` |

> 본 문서의 모든 IMPLEMENT/IMPLEMENT(간소화) 행은 **아직 구현되지 않았다.** Task 생성과 실제 코드 작성·검증 이전까지 `Status`는 항상 `NOT_STARTED`로 유지한다.

---

## F1. Destination Guide (REQ-FUNC-001~010) — SCR-001

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-001 (국내·해외 목록 구분) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-001 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-002 (국가·도시·계절·테마·기간 필터) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-002 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-003 (키워드 검색) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-003 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-004 (상세 필수 콘텐츠 항목) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-004 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-005 (빈 결과 안내+초기화) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-005 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-006 (해외 상세→안전정보 연결) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-006 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-007 (대표 이미지 메타데이터) | IMPLEMENT(간소화) | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-007 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-008 (게시 수량 검증) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-FUNC-008 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-009 (관련 여행지 최대 6) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-009 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-010 (필터 URL 동기화) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-010 (NOT_STARTED) | NOT_STARTED |

## F2. Flight Link-out (REQ-FUNC-011~018) — SCR-003(항공 탭)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-011 (항공 입력 필드) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-011 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-012 (국가→지역 종속) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-012 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-013 (날짜 검증) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-013 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-014 (요약 단계) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-014 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-015 (비전달 고지) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-015 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-016 (외부 이동 새 탭) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-016 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-017 (서버 미저장) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-017 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-018 (URL 오류 차단·재시도) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-018 (NOT_STARTED) | NOT_STARTED |

## F3. Hotel Link-out (REQ-FUNC-019~026) — SCR-003(숙소 탭)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-019 (호텔 입력 필드) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-019 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-020 (국가→지역 종속) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-020 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-021 (날짜 검증) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-021 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-022 (요약 단계) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-022 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-023 (비전달 고지) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-023 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-024 (외부 이동 새 탭) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-024 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-025 (서버 미저장) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-025 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-026 (URL 오류 차단·재시도) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-026 (NOT_STARTED) | NOT_STARTED |

## F4. Travel Mate (REQ-FUNC-027~045) — SCR-003 / SCR-004 / SCR-005

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-027 (이메일 인증 세션 요구) | IMPLEMENT | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-027 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-028 (성인 확인 상태 저장) | IMPLEMENT | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-028 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-029 (동행 프로필 필드) | IMPLEMENT | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-029 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-030 (동행글 필터) | IMPLEMENT | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-030 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-031 (모집글 작성 입력) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-031 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-032 (공개 연락처 탐지 차단) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-032 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-033 (연락처 비노출) | IMPLEMENT | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-033 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-034 (참가 메시지 제출) | IMPLEMENT | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-034 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-035 (중복 요청 차단) | IMPLEMENT | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-035 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-036 (승인·거절 처리) | IMPLEMENT(간소화) | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-036 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-037 (자동 마감) | IMPLEMENT | SCR-004 | `/mates` | `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-037 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-038 (수동 마감·수정·삭제) | IMPLEMENT | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-038 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-039 (신고) | IMPLEMENT | SCR-004, SCR-005 | `/mates`, `/account` | `src/app/mates/page.tsx`, `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-039 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-040 (차단·해제) | IMPLEMENT | SCR-005, SCR-004 | `/account`, `/mates` | `src/app/account/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-040 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-041 (Moderator 신고 큐) | IMPLEMENT(간소화) | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-041 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-042 (Moderator 조치 기록) | IMPLEMENT(간소화) | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-042 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-043 (인앱 알림+이메일 선택) | IMPLEMENT(간소화) | SCR-004, SCR-005 | `/mates`, `/account` | `src/app/mates/page.tsx`, `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-043 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-044 (RLS 비공개 데이터 보호) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-FUNC-044 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-045 (탈퇴 비식별화·30일 삭제) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |

## F5. Country Safety (REQ-FUNC-046~056) — SCR-001

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-046 (해외 국가 안전정보 커버리지) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-FUNC-046 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-047 (8개 안전 카테고리) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-047 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-048 (출처·확인일·편집자) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-048 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-049 (외교부 링크) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-049 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-050 (stale 7일 경고) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-050 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-051 (중대 경보 상단 표시) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-051 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-052 (국가/지역 범위 구분) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-052 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-053 (긴급연락처) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-053 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-054 (공식 판단 대체 불가 고지) | IMPLEMENT | SCR-001, SCR-003 | `/`, `/travel-tools` | `src/app/page.tsx`, `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-054 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-055 (Editor/Admin 작성·검수·게시) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-056 (변경 이력 보존) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |

## F6. About free_traveler (REQ-FUNC-057~063) — SCR-002

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-057 (대표명·수치 표시) | IMPLEMENT | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-057 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-058 (소개문·철학) | IMPLEMENT | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-058 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-059 (방문 권역/국가 목록) | IMPLEMENT | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-059 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-060 (여행 타임라인) | IMPLEMENT | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-060 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-061 (대표 이미지 메타) | IMPLEMENT(간소화) | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-061 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-062 (문의·SNS 링크) | IMPLEMENT(간소화) | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-062 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-063 (추천 여행지 6개) | IMPLEMENT | SCR-002 | `/about` | `src/app/about/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-063 (NOT_STARTED) | NOT_STARTED |

## F7. Common, Admin, Governance (REQ-FUNC-064~080)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-FUNC-064 (전역 내비/푸터) | IMPLEMENT | 전역(5개 Screen 공통) | 전역 | 공통 레이아웃(`src/app/layout.tsx`) | PENDING_TASK_GENERATION | TC-FUNC-064 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-065 (반응형 레이아웃) | IMPLEMENT | 전역(5개 Screen 공통) | 전역 | 공통 레이아웃(`src/app/layout.tsx`) | PENDING_TASK_GENERATION | TC-FUNC-065 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-066 (가입·인증·로그인·로그아웃·재설정) | IMPLEMENT | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-066 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-067 (통합 검색) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-067 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-068 (즐겨찾기) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-068 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-069 (URL 공유) | IMPLEMENT | SCR-001, SCR-004 | `/`, `/mates` | `src/app/page.tsx`, `src/app/mates/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-069 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-070 (SEO 메타데이터) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-FUNC-070 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-071 (행동 분석 이벤트) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-072 (콘텐츠 CRUD/CMS) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-073 (미디어 업로드·라이선스) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-074 (게시 완전성 게이트) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-075 (stale 현황 대시보드) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-076 (감사 로그) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-FUNC-077 (외부 URL 설정) | IMPLEMENT | SCR-005 | `/account` | `src/app/account/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-077 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-078 (오류 화면 복구 행동) | IMPLEMENT | 전역(5개 Screen 공통) | 전역 | 공통 오류 컴포넌트 | PENDING_TASK_GENERATION | TC-FUNC-078 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-079 (ARIA/시맨틱) | IMPLEMENT | 전역(5개 Screen 공통) | 전역 | 공통 컴포넌트 | PENDING_TASK_GENERATION | TC-FUNC-079 (NOT_STARTED) | NOT_STARTED |
| REQ-FUNC-080 (약관·안전수칙 동의) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-FUNC-080 (NOT_STARTED) | NOT_STARTED |

---

## NF-1. Performance (REQ-NF-001~007)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-001 (LCP) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-001 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-002 (INP) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-002 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-003 (CLS) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-003 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-004 (필터 응답 부하 조건) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-005 (쓰기 API 응답시간) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-005 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-006 (이미지 최적화) | IMPLEMENT | 전역(5개 Screen 공통) | 전역 | 공통 이미지 컴포넌트 | PENDING_TASK_GENERATION | TC-NF-006 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-007 (Lighthouse CI 게이트) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |

## NF-2. Reliability and Recovery (REQ-NF-008~011)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-008 (가용성 99.5%) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-009 (5xx 비율) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-010 (백업 RPO/RTO) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-011 (외부 링크 자동 검사+알림) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |

## NF-3. Security and Privacy (REQ-NF-012~018)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-012 (TLS) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-012 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-013 (RLS 서버 검증) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-013 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-014 (CSRF/SameSite) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-014 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-015 (입력 검증/XSS) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-015 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-016 (비밀키 환경변수) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-016 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-017 (항공·호텔 원시입력 미보존) | IMPLEMENT | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | PENDING_TASK_GENERATION | TC-NF-017 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-018 (개인정보 삭제 파이프라인) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |

## NF-4. Safety and Moderation (REQ-NF-019~022)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-019 (신고 접수 응답시간) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-019 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-020 (SLA 24h 90%) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-021 (속도 제한 429) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-022 (Moderator 조치 감사 추적) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |

## NF-5. Accessibility (REQ-NF-023~025)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-023 (WCAG 2.2 AA 목표) | IMPLEMENT | 전역(5개 Screen 공통) | 전역 | 공통 컴포넌트 | PENDING_TASK_GENERATION | TC-NF-023 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-024 (axe 자동 검사) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-024 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-025 (키보드·스크린리더 수동 검사) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-025 (NOT_STARTED) | NOT_STARTED |

## NF-6. Content, Freshness, SEO, Copyright (REQ-NF-026~030)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-026 (콘텐츠 완전성) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-026 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-027 (안전정보 커버리지) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-027 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-028 (안전정보 최신 확인) | IMPLEMENT | SCR-001 | `/` | `src/app/page.tsx` | PENDING_TASK_GENERATION | TC-NF-028 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-029 (미디어 라이선스 메타 100%) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-030 (SEO 메타 누락 0건) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-030 (NOT_STARTED) | NOT_STARTED |

## NF-7. Maintainability, Monitoring, Cost (REQ-NF-031~034)

| Requirement | Implementation Status | Screen | Route | Page Entry | Task | Test | Status |
|---|---|---|---|---|---|---|---|
| REQ-NF-031 (TS strict/lint/test) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-031 (NOT_STARTED) | NOT_STARTED |
| REQ-NF-032 (구조화 로그) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-033 (오류 알림 5분) | EXCLUDED | — | — | — | N/A (EXCLUDED) | N/A (EXCLUDED) | EXCLUDED |
| REQ-NF-034 (월 인프라 비용 목표) | IMPLEMENT | — | — | — | PENDING_TASK_GENERATION | TC-NF-034 (NOT_STARTED) | NOT_STARTED |

---

## 집계 검증

| 구분 | 건수 |
|---|---:|
| REQ-FUNC 총계 | 80 |
| REQ-NF 총계 | 34 |
| **전체 합계** | **114** |
| Implementation Status = IMPLEMENT / IMPLEMENT(간소화) | 92 (FUNC 71 + NF 21) |
| Implementation Status = EXCLUDED | 22 (FUNC 9 + NF 13) |
| Task = PENDING_TASK_GENERATION | 92건(위 IMPLEMENT 계열과 동일) |
| Task = N/A (EXCLUDED) | 22건 |
| Status = NOT_STARTED | 92건 |
| Status = EXCLUDED | 22건 |
| Status = DONE / IN_PROGRESS | **0건 (아직 구현 착수 전)** |

모든 REQ-FUNC-001~080, REQ-NF-001~034가 이 표에 정확히 1회씩 등장하며, 삭제된 항목은 없다.
