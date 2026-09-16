# Free Traveler — UI/UX Approved Baseline

- **Document ID:** UIUX-APPROVED-001
- **기반 문서:** `docs/02_SRS_BASELINE.md`(SRS-TRAVEL-001), `docs/PROJECT_SCOPE.md`(SCOPE-TRAVEL-001), `docs/03_UI_COVERAGE_ANALYSIS.md`(UICOV-TRAVEL-001), `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`
- **목적:** SRS Baseline의 Requirement(REQ-FUNC-001~080, REQ-NF-001~034)를 하나도 삭제하지 않은 채, 승인된 5개 디자인 Screen(SCR-001~005)과 프로젝트 범위(PROJECT_SCOPE)를 연결한 구현 기준선을 확정한다.
- **상태:** 본 문서에 기록된 내용 중 IMPLEMENT로 표시된 항목은 아직 구현되지 않았다. Task가 생성되고 실제 코드가 작성·검증되기 전까지는 "구현 완료"로 취급하지 않는다.

---

## 1. 승인된 5개 Screen 요약

| Screen | Route | Page Entry | 분류 |
|---|---|---|---|
| SCR-001 | `/` | `src/app/page.tsx` | 핵심(여행지 탐색) |
| SCR-002 | `/about` | `src/app/about/page.tsx` | 보조(대표 소개) |
| SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` | 핵심(항공 + 숙소, 3-Tab 통합) |
| SCR-004 | `/mates` | `src/app/mates/page.tsx` | 핵심(동행 찾기) |
| SCR-005 | `/account` | `src/app/account/page.tsx` | 지원(로그인·프로필·내 활동·간단 관리자) |

세부 영역 순서·Component·상태·이동·금지 기능은 `design-reference/UI_CONTRACT.md`를 정본으로 한다.

---

## 2. Route 통합 지도 (Baseline SRS 다중 Route → 승인 5개 Screen)

`docs/02_SRS_BASELINE.md` §3.5의 다중 공개 Route는 아래와 같이 5개 디자인 Screen의 탭·패널·Drawer/Modal로 통합된다. 통합 후에도 각 Route가 담당하던 REQ-FUNC 요구사항은 삭제되지 않고 해당 Screen 내부 컴포넌트로 재배치된다(전체 매핑은 `docs/UIUX_TRACEABILITY.md` 참조).

| Baseline Route | Baseline Page | 통합 대상 Screen | 신규 Route | 통합 방식 |
|---|---|---|---|---|
| `/` | 홈 | SCR-001 | `/` | 유지, Section 확장(검색+여행지+안전정보+동행 미리보기+대표소개 요약) |
| `/destinations` | 전체 여행지 | SCR-001 | `/` | 별도 라우트 폐지, 목록 Section으로 통합 |
| `/destinations/domestic` | 국내 여행지 | SCR-001 | `/` | 국내 Card Grid Section으로 통합 |
| `/destinations/overseas` | 해외 여행지 | SCR-001 | `/` | 해외 Card Grid Section으로 통합 |
| `/destinations/[slug]` | 여행지 상세 | SCR-001 | `/` | 별도 라우트 폐지, **Drawer/Modal**로 통합 |
| `/flights` | 비행기 찾기 | SCR-003 | `/travel-tools` | **항공 탭**으로 통합 |
| `/hotels` | 호텔 찾기 | SCR-003 | `/travel-tools` | **숙소 탭**으로 통합 |
| `/mates` | 동행 모집글 목록 | SCR-004 | `/mates` | 유지 |
| `/mates/[id]` | 동행 모집글 상세 | SCR-004 | `/mates` | 별도 라우트 폐지, **상세 패널(Desktop)/Drawer(Mobile)**로 통합 |
| `/mates/new` | 동행 모집글 작성 | SCR-003 | `/travel-tools` | **동행 구하기 탭**으로 통합 |
| `/safety` | 국가별 주의사항 목록 | SCR-001 | `/` | 안전정보 Card Grid Section으로 통합 |
| `/safety/[countryCode]` | 국가별 주의사항 상세 | SCR-001 | `/` | 별도 라우트 폐지, **Drawer/Modal**로 통합 |
| `/about` | 대표 소개 | SCR-002 | `/about` | 유지 |
| `/auth/*` | 가입·로그인·성인 확인 | SCR-005 | `/account` | **로그인·가입 탭(Guest)**으로 통합 |
| `/my/*` | 내 글·참가 요청·차단 | SCR-005 | `/account` | **내 활동 탭(Member)**으로 통합 |
| `/admin/*` | 콘텐츠·신고·설정 | SCR-005 | `/account` | **관리자 탭(Admin)**으로 통합 — 신고 상태 변경·외부 URL 설정만 포함, 콘텐츠 CRUD는 EXCLUDED(4장 참조) |

---

## 3. UI Route Contract 요약

전체 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`(`schema_version: traveler-screen-route-v1`, `framework: nextjs-app-router`)이며, 요약은 다음과 같다.

- **Screen 수:** 정확히 5개(SCR-001~005), Route·Page Entry 중복 없음.
- **핵심 4개 기능 / 보조 1개:** 여행지 탐색(SCR-001) · 항공(SCR-003) · 숙소(SCR-003) · 동행 찾기(SCR-004) = 핵심 4개 기능 / 대표 소개(SCR-002) = 보조 1개.
- **지원 Screen:** SCR-005(계정·관리)는 핵심/보조 분류 외 지원 Screen으로 별도 관리.
- **Page Owner Task 필요:** 5개 Screen 모두 `page_owner_task_required=true`, `preview_required=true`.
- **Starter Template 금지:** SCR-001만 `starter_template_forbidden=true`(Next.js 기본 스타터 화면을 홈으로 남겨두지 않는다).
- **기술 Route(Screen 수 미포함):** `/auth/callback`(인증 콜백), `/api/*`(서버 액션·API Route), `not-found`(404 복구 화면).
- **필수 이동 관계(`required_navigation`):** SCR-001↔SCR-002/003/004/005, SCR-002↔SCR-001/003/004, SCR-003↔SCR-004/005, SCR-004↔SCR-003/005, SCR-005↔SCR-003/004 — 전체 13개 이동 관계는 JSON `required_navigation` 배열을 정본으로 한다.

---

## 4. 제외 기능(EXCLUDED) 요약

`docs/PROJECT_SCOPE.md` 기준 EXCLUDED로 확정된 기능은 5개 Screen 어디에도 구현하지 않는다. 전체 목록과 REQ ID별 사유는 `docs/UIUX_TRACEABILITY.md`에 기록하며, 대표 항목은 다음과 같다.

| 제외 기능 | 관련 REQ ID(대표) |
|---|---|
| 전체 콘텐츠 CMS | REQ-FUNC-055, 072, 074, 075 |
| 미디어 업로드·라이선스 승인 워크플로 | REQ-FUNC-073, REQ-NF-029 |
| 범용 감사 로그 | REQ-FUNC-056, 076, REQ-NF-022, 032 |
| 자동 백업·장애 알림·부하 테스트 | REQ-NF-004, 007~011, 020, 033 |
| 외부 이메일 사업자 연동 | REQ-FUNC-043(이메일 부분만), REQ-NF-018 관련 |
| 회원 탈퇴 자동 삭제 파이프라인 | REQ-FUNC-045, REQ-NF-018 |
| 행동 분석 이벤트 파이프라인 | REQ-FUNC-071 |
| 서버 속도 제한(429) | REQ-NF-021 |

> EXCLUDED 항목은 릴리스 승인 기준(5장)에서 요구되지 않는다. 존재하지 않아도 릴리스를 막지 않는다.

---

## 5. Release Acceptance Criteria

아래 기준은 IMPLEMENT로 분류된 요구사항에만 적용된다. EXCLUDED 항목은 기준에서 제외된다.

1. `design-reference/SCREEN_ROUTE_CONTRACT.json`에 정의된 5개 Screen이 지정된 Route·Page Entry에 정확히 존재하고, Route·Page Entry 중복이 없다.
2. `docs/UIUX_TRACEABILITY.md`에서 Implementation Status=IMPLEMENT(또는 IMPLEMENT(간소화))로 표시된 모든 REQ-FUNC/REQ-NF 항목이 매핑된 Screen에서 동작을 확인할 수 있다.
3. `/travel-tools`(SCR-003)에는 항공편·숙소·동행 구하기 3개 탭이 모두 존재하며, 세 탭의 입력·검증·완료 상태가 서로 독립적으로 동작한다.
4. `/account`(SCR-005)는 Guest/Member/Admin 역할에 따라 로그인, 프로필, 내 활동, 관리자 탭이 조건부로 노출되며, 역할에 없는 탭은 렌더링하지 않는다. Admin 탭(신고 상태 변경, 외부 URL 설정)은 어떤 빌드에서도 생략되지 않는다.
5. 여행지·국가 안전정보 상세는 SCR-001 내 Drawer/Modal로만 열리고 별도 페이지 라우트를 생성하지 않는다.
6. 동행글 상세는 SCR-004의 상세 패널(Desktop)/Drawer(Mobile)로만 열리고 별도 페이지 라우트를 생성하지 않는다.
7. Header·Footer는 5개 Screen에서 완전히 동일한 컴포넌트를 재사용한다.
8. `design-reference/D-001/DESIGN.md`의 Do Not 규칙(별점·후기·매너온도, 내부 가격 비교 암시 문구, 조작된 실시간 통계, Airbnb 상표·문구, 예약/결제 UI, 토큰 외 임의 색상)이 어떤 Screen에도 존재하지 않는다.
9. 항공·호텔 입력값은 서버 DB·로그·쿼리 파라미터로 저장·전달되지 않는다(REQ-FUNC-017, 025, REQ-NF-017).
10. 모든 목록형 Section은 데이터가 없을 때 완성형 Empty State(사유+이용 방법+다음 행동 CTA)를 표시하며, Lorem ipsum·"준비 중"·"정보 확인 필요" 문구를 사용하지 않는다.
11. 모든 상호작용 요소는 최소 44×44px 터치 영역과 키보드 포커스 표시를 갖춘다(REQ-NF-023 WCAG 2.2 AA 목표).
12. 위 1~11을 모두 충족하기 전까지 어떤 Screen도 "구현 완료"로 기록하지 않는다.

---

## 6. 다음 단계

- `docs/06_SRS_UIUX_REVISED.md`: SRS §3.5(Route Inventory) 및 관련 Use Case를 5개 Screen 구조로 개정한 버전. 요구사항 본문·ID는 Baseline과 동일하게 보존한다.
- `docs/UIUX_TRACEABILITY.md`: REQ-FUNC-001~080·REQ-NF-001~034 114건 전체에 대한 Requirement / Implementation Status / Screen / Route / Page Entry / Task / Test / Status 추적표. Task 생성 전까지 Task 열은 `PENDING_TASK_GENERATION`(EXCLUDED 항목은 `N/A (EXCLUDED)`)으로 기록한다.
