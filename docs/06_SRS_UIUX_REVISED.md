# SRS UI/UX Revision — Free Traveler

- **Document ID:** SRS-TRAVEL-001-REV-UIUX
- **개정 대상:** `docs/02_SRS_BASELINE.md`(SRS-TRAVEL-001) §2.2, §3.5, §3.6
- **개정 사유:** `docs/05_UIUX_APPROVED.md`에서 확정한 5개 디자인 Screen(SCR-001~005) 구조를 SRS의 Route/화면 구조에 반영한다.
- **보존 원칙:** 본 개정은 **Route·화면 구조만** 변경하며, `docs/02_SRS_BASELINE.md`의 REQ-FUNC-001~080, REQ-NF-001~034는 **문구·ID·우선순위 그대로 보존**한다. 요구사항 원문은 Baseline을 참조하고, 본 문서는 대체하지 않는다. 요구사항이 하나도 삭제되지 않았음은 8장 "요구사항 보존 대장"에서 확인할 수 있다.

---

## 1. 개정 범위

| Baseline 절 | 개정 내용 |
|---|---|
| §2.2 Role Permission Matrix | 기능별 권한은 유지하되, 기능이 위치하는 화면을 5개 Screen 기준으로 재기술(2장) |
| §3.5 Page and Route Inventory | 14개 이상의 개별 Route를 5개 Screen + 3개 기술 Route로 재편(3장) |
| §3.6 Use Cases | UC-01~09의 "Related Requirements"는 그대로 유지하고 대응 화면만 5개 Screen 기준으로 재기술(4장) |
| 신설 | UI Route Contract(5장), Release Acceptance Criteria(6장), 요구사항 보존 대장(8장) |

---

## 2. 개정 Role Permission — 화면 매핑

| 기능 | Guest | Adult Member | Editor | Moderator | Admin | 위치 Screen |
|---|:---:|:---:|:---:|:---:|:---:|---|
| 여행지·안전·대표 열람 | O | O | O | O | O | SCR-001, SCR-002 |
| 항공·호텔 외부 이동 | O | O | O | O | O | SCR-003(항공/숙소 탭) |
| 동행글 목록·상세 열람 | O | O | O | O | O | SCR-004 |
| 동행글 작성·참가 요청 | X | O | X | O | O | SCR-003(동행 탭 작성) / SCR-004(참가 요청) |
| 본인 글·요청 관리 | X | O | X | O | O | SCR-005(Member: 내 활동) |
| 신고·차단 | X | O | X | O | O | SCR-004(트리거) / SCR-005(Member: 내 활동) |
| 여행지·안전 콘텐츠 CRUD | X | X | **EXCLUDED** | X | **EXCLUDED** | 해당 화면 없음(`docs/PROJECT_SCOPE.md` REQ-FUNC-072 EXCLUDED) |
| 신고 큐·제재 | X | X | X | O | O | SCR-005(Admin: 신고 상태 변경) |
| 외부 URL·권한 관리 | X | X | X | X | O | SCR-005(Admin: 외부 URL 설정) |
| 감사 로그 열람 | X | X | 제한 | 제한 | O | **EXCLUDED**(REQ-FUNC-076, 범용 감사 로그 제외) |

> Editor 역할의 콘텐츠 CRUD 권한(Baseline §2.2)은 REQ-FUNC-072(전체 콘텐츠 CMS)가 EXCLUDED로 확정됨에 따라 화면으로 구현되지 않는다. 콘텐츠는 `src/data` 정적 데이터로 개발자가 직접 관리한다(`docs/PROJECT_SCOPE.md` 참조).

---

## 3. 개정 §3.5 Page and Route Inventory

### 3-1. 승인된 Screen Route (5개)

| Route | Screen | Page Entry | Access |
|---|---|---|---|
| `/` | SCR-001 메인 | `src/app/page.tsx` | Public |
| `/about` | SCR-002 대표 소개 | `src/app/about/page.tsx` | Public |
| `/travel-tools` | SCR-003 통합 여행 준비 | `src/app/travel-tools/page.tsx` | Public(동행 작성 탭만 Adult Member) |
| `/mates` | SCR-004 동행 조회 | `src/app/mates/page.tsx` | Public(참가 요청·신고·차단은 Adult Member) |
| `/account` | SCR-005 계정·관리 | `src/app/account/page.tsx` | Guest 탭 Public / 내 활동 탭 Adult Member / 관리자 탭 Role Restricted |

### 3-2. 폐지된 Baseline Route와 통합 방식

Baseline §3.5에 있던 아래 Route는 더 이상 독립된 Next.js Route로 만들지 않는다. 해당 REQ-FUNC 요구사항은 삭제되지 않고, 오른쪽 열에 명시된 Screen 내부 요소로 재배치된다.

| 폐지 Route | 통합된 Screen 요소 |
|---|---|
| `/destinations`, `/destinations/domestic`, `/destinations/overseas` | SCR-001 여행지 Card Grid Section |
| `/destinations/[slug]` | SCR-001 여행지 상세 **Drawer/Modal** |
| `/flights` | SCR-003 **항공 탭** |
| `/hotels` | SCR-003 **숙소 탭** |
| `/mates/[id]` | SCR-004 상세 **패널(Desktop)/Drawer(Mobile)** |
| `/mates/new` | SCR-003 **동행 구하기 탭** |
| `/safety`, `/safety/[countryCode]` | SCR-001 안전정보 Card Grid Section + **Drawer/Modal** |
| `/auth/*` | SCR-005 **로그인·가입 탭(Guest)** |
| `/my/*` | SCR-005 **내 활동 탭(Member)** |
| `/admin/*` | SCR-005 **관리자 탭(Admin)** — 신고 상태 변경·외부 URL 설정만(콘텐츠 CRUD는 EXCLUDED) |

### 3-3. 기술 Route (Screen 수에 포함하지 않음)

| Route | 유형 | 용도 |
|---|---|---|
| `/auth/callback` | 인증 콜백 | Supabase Auth 이메일 인증·로그인 콜백 처리 |
| `/api/*` | API Route | 동행글·참가 요청·신고·차단·관리자 신고 상태·외부 URL 설정 서버 액션(항공·호텔 폼은 API Route 없이 클라이언트 상태로만 처리) |
| `not-found` | 오류 Route | 404 복구 화면(`src/app/not-found.tsx`), 홈/이전/재시도 행동 포함(REQ-FUNC-078) |

---

## 4. 개정 §3.6 Use Cases — 대응 화면

| ID | Use Case | Actor | Related Requirements(변경 없음) | 대응 Screen |
|---|---|---|---|---|
| UC-01 | 여행지 검색·필터·상세 열람 | Guest/Member | REQ-FUNC-001~010 | SCR-001 |
| UC-02 | 항공 여행 조건 입력·요약·외부 이동 | Guest/Member | REQ-FUNC-011~018 | SCR-003(항공 탭) |
| UC-03 | 호텔 숙박 조건 입력·요약·외부 이동 | Guest/Member | REQ-FUNC-019~026 | SCR-003(숙소 탭) |
| UC-04 | 동행 모집글 작성·마감 | Adult Member | REQ-FUNC-027~033, 037~038 | SCR-003(동행 탭 작성) / SCR-005(Member: 마감·수정) |
| UC-05 | 동행 참가 요청·승인·거절 | Adult Member | REQ-FUNC-034~036, 043 | SCR-004(참가 요청) / SCR-005(Member: 승인·거절) |
| UC-06 | 신고·차단·운영 처리 | Adult Member/Moderator | REQ-FUNC-039~045 | SCR-004(트리거) / SCR-005(Member: 차단 관리, Admin: 신고 처리) |
| UC-07 | 국가별 안전정보 확인 | Guest/Member | REQ-FUNC-046~056 | SCR-001(안전정보 Drawer/Modal) |
| UC-08 | 대표 소개 확인 | Guest/Member | REQ-FUNC-057~063 | SCR-002 |
| UC-09 | 콘텐츠·외부 URL 관리 | Editor/Admin | REQ-FUNC-072~077 | REQ-FUNC-072~076은 **EXCLUDED**(대응 화면 없음) / REQ-FUNC-077(외부 URL 설정)만 SCR-005(Admin 탭) |

---

## 5. UI Route Contract

정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`(`schema_version: traveler-screen-route-v1`)이며, SRS 관점의 요약은 다음과 같다.

- **완료 조건:** Screen 수 정확히 5개, Route 중복 없음, Page Entry 중복 없음, 핵심 기능 4개(여행지 탐색·항공·숙소·동행 찾기)·보조 1개(대표 소개) 구분 존재.
- **Page Owner Task / Preview:** 5개 Screen 모두 `page_owner_task_required=true`, `preview_required=true` — Task 생성과 프리뷰 확인 없이는 구현 완료로 취급하지 않는다.
- **Starter Template 금지:** SCR-001(`src/app/page.tsx`)은 Next.js 기본 스타터 화면을 남겨두지 않는다(`starter_template_forbidden=true`).
- **기술 Route:** `/auth/callback`, `/api/*`, `not-found`는 Screen 수에 포함하지 않되 `technical_routes`에 기록한다(3-3절).
- **필수 이동 관계:** `required_navigation` 13건(예: SCR-001→SCR-003/004/005, SCR-003→SCR-005, SCR-004→SCR-003/005, SCR-005→SCR-003/004 등)을 구현 시 반드시 연결한다.

---

## 6. Release Acceptance Criteria

`docs/05_UIUX_APPROVED.md` 5장과 동일한 기준을 SRS 승인 기준으로 채택한다. EXCLUDED 요구사항은 아래 기준 대상에서 제외된다.

1. 5개 Screen이 3-1절의 Route·Page Entry에 정확히, 중복 없이 존재한다.
2. `docs/UIUX_TRACEABILITY.md`에서 IMPLEMENT(또는 IMPLEMENT(간소화))로 표시된 모든 REQ가 매핑된 Screen에서 동작을 확인할 수 있다.
3. SCR-003의 항공·숙소·동행 구하기 3개 탭은 입력·검증·완료 상태를 서로 독립적으로 유지한다.
4. SCR-005는 Guest/Member/Admin 역할별로 탭을 조건부 노출하며, Admin 탭(신고 상태 변경·외부 URL 설정)은 어떤 빌드에서도 생략하지 않는다.
5. 여행지·안전정보 상세, 동행 상세는 각각 SCR-001·SCR-004 내부 Drawer/Modal/패널로만 열리고 독립 Route를 만들지 않는다.
6. Header·Footer는 5개 Screen에서 동일 컴포넌트를 재사용한다.
7. `design-reference/D-001/DESIGN.md`의 Do Not 규칙(별점·후기·매너온도, 내부 가격 비교 암시, 조작된 실시간 통계, Airbnb 상표, 예약/결제 UI, 임의 색상)을 위반하지 않는다.
8. 항공·호텔 입력값을 서버 DB·로그·쿼리로 저장·전달하지 않는다(REQ-FUNC-017, 025, REQ-NF-017).
9. 목록형 Section은 데이터 없음 상태에서도 완성형 Empty State를 표시하며 Placeholder 문구를 쓰지 않는다.
10. 최소 터치 영역 44×44px, 키보드 포커스 표시를 충족한다(REQ-NF-023).
11. 위 조건을 모두 충족하기 전까지 어떤 Screen·Requirement도 "구현 완료"로 기록하지 않는다.

---

## 7. 변경되지 않은 항목

- REQ-FUNC-001~080, REQ-NF-001~034의 **문구, ID, 우선순위(M/S/C), Acceptance Criteria**는 Baseline과 동일하다.
- §1(Introduction), §4(Specific Requirements 본문), §6(Appendix — API·데이터 모델)은 본 개정의 대상이 아니며 Baseline을 그대로 따른다.
- `docs/PROJECT_SCOPE.md`의 IMPLEMENT/EXCLUDED 분류는 변경하지 않는다.

---

## 8. 요구사항 보존 대장

아래 대장은 REQ-FUNC-001~080, REQ-NF-001~034 **114건 전체**가 본 개정에서 삭제되지 않았음을 확인하기 위한 목록이다. Implementation Status는 `docs/PROJECT_SCOPE.md`를 그대로 인용한다. Screen/Route/Page Entry/Task/Test/Status를 포함한 전체 8열 추적표는 `docs/UIUX_TRACEABILITY.md`에 있다.

### REQ-FUNC-001~080 (80건, 전부 보존)

| 범위 | 보존 상태 |
|---|---|
| REQ-FUNC-001~010 (F1 Destination Guide) | ✅ 보존 |
| REQ-FUNC-011~018 (F2 Flight Link-out) | ✅ 보존 |
| REQ-FUNC-019~026 (F3 Hotel Link-out) | ✅ 보존 |
| REQ-FUNC-027~045 (F4 Travel Mate) | ✅ 보존 |
| REQ-FUNC-046~056 (F5 Country Safety) | ✅ 보존 |
| REQ-FUNC-057~063 (F6 About free_traveler) | ✅ 보존 |
| REQ-FUNC-064~080 (F7 Common, Admin, Governance) | ✅ 보존 |

### REQ-NF-001~034 (34건, 전부 보존)

| 범위 | 보존 상태 |
|---|---|
| REQ-NF-001~007 (Performance) | ✅ 보존 |
| REQ-NF-008~011 (Reliability and Recovery) | ✅ 보존 |
| REQ-NF-012~018 (Security and Privacy) | ✅ 보존 |
| REQ-NF-019~022 (Safety and Moderation) | ✅ 보존 |
| REQ-NF-023~025 (Accessibility) | ✅ 보존 |
| REQ-NF-026~030 (Content, Freshness, SEO, Copyright) | ✅ 보존 |
| REQ-NF-031~034 (Maintainability, Monitoring, Cost) | ✅ 보존 |

**합계:** 80 + 34 = **114건, 삭제 0건.** 개별 REQ ID별 Implementation Status·Screen·Route·Page Entry·Task·Test·Status는 `docs/UIUX_TRACEABILITY.md`를 참조한다.
