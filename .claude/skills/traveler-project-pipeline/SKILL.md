---
name: traveler-project-pipeline
description: Free Traveler 프로젝트의 Task 생성·감사 파이프라인 규칙. SRS/PROJECT_SCOPE/DESIGN/Screen 계약을 입력으로 `TASKS/00_TASK_LIST.md`와 `TASKS/TASK-<ID>.md`를 만들거나 갱신할 때, 그리고 그 결과를 감사할 때 반드시 따라야 하는 규칙과 파일 위치를 정의한다. `/gen-tasklist`, `/gen-task-details`, `/audit-tasks` 커맨드는 모두 이 Skill을 따른다. Traveler Task를 만들거나, Task 목록·상세를 감사하거나, Task 생성 파이프라인을 언급할 때 사용한다.
---

# Traveler Project Pipeline

이 Skill은 Free Traveler Next.js App Router 프로젝트의 **Task 생성·감사 파이프라인**을 정의한다. 목적은 승인된 요구사항·화면 계약을 사람이 검토 가능한 Task List/Task Detail로 변환하고, 그 결과가 계약을 위반하지 않는지 자동으로 감사하는 과정을 결정적(deterministic)이고 반복 가능하게 만드는 것이다.

**이 Skill은 문서/Task 파일만 다룬다. `src/`, `supabase/` 등 실제 애플리케이션 구현 코드는 이 Skill의 범위가 아니다.** Task List·Task Detail·감사 산출물을 만들거나 고칠 때 애플리케이션 코드를 함께 작성하지 않는다.

## 0. 입력 문서 (Source of Truth)

| 문서 | 역할 |
|---|---|
| `docs/06_SRS_UIUX_REVISED.md` | 화면·Route 구조가 반영된 SRS. REQ 본문·ID·우선순위의 정본은 `docs/02_SRS_BASELINE.md`. |
| `docs/PROJECT_SCOPE.md` | **REQ별 IMPLEMENT/EXCLUDED 분류의 정본.** Requirement 커버리지 감사(9장)의 기준 문서다. |
| `design-reference/D-001/DESIGN.md` | 디자인 토큰, 컴포넌트 규칙, Do/Do Not. |
| `design-reference/UI_CONTRACT.md` | Screen별 영역 순서·Component·상태·이동·금지 기능. |
| `design-reference/SCREEN_ROUTE_CONTRACT.json` | **Screen 목록의 정본**(schema_version, screens, technical_routes, required_navigation). |
| 현재 `package.json`, `src/app/**` | 실제 저장소 상태. Task를 쓰기 전 반드시 스캔한다. |

`docs/UIUX_TRACEABILITY.md`는 초기 설계 단계에서 만든 참고 자료이며, Task 생성·감사 시점의 REQ 상태 정본은 항상 `docs/PROJECT_SCOPE.md`를 우선한다(두 문서가 다르면 `PROJECT_SCOPE.md`를 따른다).

## 1. HARNESS_SCHEMA

```
HARNESS_SCHEMA = "traveler-screen-route-v1"
```

이 값은 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `schema_version`과 정확히 일치해야 한다. 값이 다르면 Task를 생성하지 않고 즉시 중단한다.

## 2. Screen 정본

- Screen 목록·Route·Page Entry의 **유일한 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`**이다. `design-reference/UI_CONTRACT.md`의 Screen 표기는 참고용이며 충돌 시 JSON을 따른다.
- Screen은 정확히 5개: SCR-001(`/`), SCR-002(`/about`), SCR-003(`/travel-tools`), SCR-004(`/mates`), SCR-005(`/account`).
- `technical_routes`(auth callback, API Route, not-found)는 Screen이 아니다. Page Owner Task를 만들지 않되, 필요한 Component/Infra Task(예: 인증 콜백 처리, API Route 구현)는 만들 수 있다.

## 3. Task 유형과 실제 사용 중인 ID 규칙

`TASKS/00_TASK_LIST.md`가 실제로 사용하는 Category와 ID 규칙은 다음과 같다(모두 대문자 Category, 하이픈 구분 ID).

| Category | 정의 | ID 예시 |
|---|---|---|
| `PAGE_OWNER` | 정확히 5개, Screen당 1개. 해당 Screen의 `page.tsx`를 실제로 조립하고 Section 순서·상태·이동을 완성한다. | `PAGE-SCR001` |
| `COMPONENT` | 특정 Screen에 속한 UI 조각(Card, Drawer, Form, Tab 등) 구현. | `CMP-SCR003-FLIGHT-FORM` |
| `SHARED` | 2개 이상 Screen이 공유하는 컴포넌트/유틸리티(Header, Footer, EmptyState, Drawer/Modal, Toast 등). | `SHR-HEADER-FOOTER` |
| `DATA` | 정적 데이터(여행지·안전정보·대표 프로필) 작성. | `DATA-DESTINATIONS` |
| `DB` | Supabase 테이블 스키마·RLS·데이터 접근·Seed. | `DB-SCHEMA-BASE` |
| `INFRA` | 인증, 외부 링크, 환경변수, 보안 기본기. | `INFRA-AUTH` |
| `UNIT_TEST` | 단위 테스트(날짜 검증, 연락처 탐지, 상태 전이 등). | `UNIT-TRAVEL-DATES` |
| `INTEGRATION_TEST` | RLS 등 통합 테스트. | `TEST-RLS-BASIC` |
| `E2E_TEST` | Playwright(Chromium) Smoke Test. | `E2E-PUBLIC-SMOKE` |
| `MANUAL_CHECK` | 브라우저에서 사람이 직접 확인해야 하는 점검. | `MANUAL-A11Y-KEYBOARD` |
| `RELEASE_CHECK` | 배포 직전 사람이 확인하는 릴리스 게이트. | `RELEASE-CHECK-LIGHTHOUSE` |
| `CI_DEPLOY` | CI, Vercel/Supabase 배포 설정 확인. | `CI-LINT-TYPECHECK-TEST`, `DEPLOY-VERCEL-SETUP`, `SUPABASE-ENV-VERIFY` |

**Page Owner와 Component Task는 항상 구분한다.** Page Owner는 레이아웃 조립·상태 배선·Section 순서·이동만 책임지고, 개별 UI 조각의 상세 구현은 Component Task가 책임진다. Page Owner Task 안에서 새 Component를 처음부터 구현하지 않는다.

## 4. Task ID·의존성 규칙

- Task ID는 위 Category에 맞는 접두사 + Screen(해당 시) + 의미 있는 이름으로 만든다. 예: `PAGE-SCR003`, `CMP-SCR003-FLIGHT-FORM`, `SHR-DRAWER-MODAL`, `DATA-SAFETY`, `DB-RLS-BASE`, `INFRA-OUTBOUND-LINKS`, `UNIT-CONTACT-DETECTION`, `E2E-MATE-AUTH`.
- **Page Owner Task는 같은 Screen의 관련 Component Task를 `Depends On`에 포함한다.** 다른 Screen의 Component Task나 Shared/Data/DB/Infra Task도 필요하면 `Depends On`에 추가할 수 있다.
- Component Task는 자신이 실제로 필요로 하는 Shared/Data/DB/Infra Task에만 의존한다. 존재하지 않는 Task ID를 참조하지 않는다(Depends On 누락 0).
- 의존 그래프에 순환(Cycle)이 있으면 안 된다.
- **Component-only Screen을 만들지 않는다.** 어떤 Screen의 COMPONENT Task든 그 Screen의 Page Owner `Depends On`에 반드시 포함되어야 한다(만들었지만 조립되지 않은 Component가 있으면 안 된다).

## 5. 정확히 5개의 Page Owner Task

`SCREEN_ROUTE_CONTRACT.json`의 `screens` 배열 각 항목마다 Page Owner Task를 정확히 1개 만든다. 5개보다 많거나 적으면 안 된다.

| Task ID | Screen | Route | Page Entry |
|---|---|---|---|
| `PAGE-SCR001` | SCR-001 | `/` | `src/app/page.tsx` |
| `PAGE-SCR002` | SCR-002 | `/about` | `src/app/about/page.tsx` |
| `PAGE-SCR003` | SCR-003 | `/travel-tools` | `src/app/travel-tools/page.tsx` |
| `PAGE-SCR004` | SCR-004 | `/mates` | `src/app/mates/page.tsx` |
| `PAGE-SCR005` | SCR-005 | `/account` | `src/app/account/page.tsx` |

Page Owner의 Route·Page Entry는 `SCREEN_ROUTE_CONTRACT.json`과 정확히 일치해야 하고, **Expected Files에 자신의 Page Entry가 포함되어야 한다.**

### Screen별 Page Owner 특별 조건

- **`PAGE-SCR001`:** Functional AC에 "Next.js Starter(기본 스타터) 화면·문구·로고를 제거했다"는 조건을 반드시 포함한다. `SCREEN_ROUTE_CONTRACT.json`의 `starter_template_forbidden=true`를 그대로 반영한다.
- **`PAGE-SCR003`:** Functional AC에 "항공편·숙소·동행 구하기 3개 탭을 실제로 조립하고 탭 전환 시 입력·검증·완료 상태가 서로 독립적으로 유지된다"는 조건을 반드시 포함한다.
- **`PAGE-SCR005`:** Functional AC에 "Guest·Member·Admin 상태를 실제로 조립하고, 역할에 없는 탭은 렌더링하지 않으며, Admin 탭(신고 상태 변경·외부 URL 설정)은 어떤 빌드에서도 생략하지 않는다"는 조건을 반드시 포함한다.

## 6. Expected Files는 실제 트리를 본 뒤 쓴다

Task를 쓰기 전 `src/app/**`을 실제로 스캔한다(`scripts/validate_inputs.py`가 검사 2에서 `src/app/page.tsx`, `src/app/layout.tsx` 존재를 확인한다). Task의 Expected Files에는 이미 존재하는 파일과 새로 만들어야 하는 파일을 구분해 기록한다. 존재 여부를 확인하지 않고 파일 경로를 추측해서 쓰지 않는다. **어떤 Task도 Expected Files 목록 밖의 파일을 수정 대상으로 삼지 않는다.**

## 7. Page Owner Acceptance Criteria 필수 항목

모든 `PAGE_OWNER` Task의 Functional/Visual AC는 다음을 **반드시** 포함한다.

1. `design-reference/UI_CONTRACT.md`에 기록된 해당 Screen의 **영역(Section) 순서**를 그대로 재현한다.
2. `design-reference/D-001/DESIGN.md`의 화면별 **최소 콘텐츠 수**(예: SCR-002 Timeline 6개 이상, 방문 국가 30개국 이상, Gallery 8장 이상, SCR-004 동행글 최대 8개 등)를 충족한다.
3. 큰 빈 영역(내용 없는 장식 영역)과 Lorem ipsum·"준비 중"·"정보 확인 필요" 같은 Placeholder 문구를 금지한다.
4. 데이터가 없는 목록형 Section도 **완성형 Empty State**(왜 비어 있는지 안내 + 이용 방법 + 다음 행동 CTA)를 표시해야 하며, 빈 화면처럼 보이는 상태를 허용하지 않는다.

## 8. 데이터·인프라 제약

- **여행지·안전정보·대표 프로필은 `DATA` Category Task로만 만든다.** Editor/Admin CRUD, 콘텐츠 CMS Task는 만들지 않는다(REQ-FUNC-072 등 EXCLUDED).
- **DB 테이블은 6개(`profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings`)로 제한한다.** 그 이상 테이블(감사 로그, 미디어 자산, 콘텐츠 CMS 테이블 등)을 추가하는 Task를 만들지 않는다. `DB_SCHEMA`·`DB_RLS`·`DB_ACCESS`·`DB_SEED` 4종 Task(`DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE`)는 항상 존재해야 한다.
- **항공·호텔 입력값은 서버·DB·URL·로그·분석으로 보내지 않는다.** `PAGE-SCR003`과 `CMP-SCR003-FLIGHT-FORM`/`CMP-SCR003-HOTEL-FORM`의 AC에 "입력값을 저장·전달하지 않는다"를 명시한다.
- **Playwright는 Chromium 기반 Smoke Task만 만든다(2~3개 Task, 핵심 흐름 5~7개).** 여러 브라우저 매트릭스나 시각 회귀 테스트 Task를 만들지 않는다.
- **자동 Merge, EC2, AWS 관련 Task를 만들지 않는다.** 배포는 Vercel만 대상으로 한다(`docs/PROJECT_SCOPE.md` 제외 목록과 일치).

## 9. Requirement 커버리지

- `docs/PROJECT_SCOPE.md`의 **REQ-FUNC 80개 + REQ-NF 34개(114건) 전부**가 파이프라인 산출물 어딘가에 정확히 등장해야 한다.
- Implementation Status가 `EXCLUDED`인 REQ는 **상세 구현 Task를 만들지 않는다.** 대신 `TASKS/00_TASK_LIST.md`의 **`## 4. NON_IMPLEMENTATION` 표**에 요구사항·근거·후속 방향을 기록해 추적에서 사라지지 않게 한다.
- Implementation Status가 `IMPLEMENT` 또는 `IMPLEMENT(간소화)`인 REQ는 반드시 하나 이상의 Task 행 `Requirement Ref` 열에 포함되어야 한다.
- EXCLUDED로 분류된 REQ ID가 어떤 Task의 `Requirement Ref`에도 들어가면 안 된다(EXCLUDED를 구현 대상으로 끌어오지 않는다).

## 10. 파일 위치와 1:1 대응

| 산출물 | 경로 |
|---|---|
| Task List(정본, Markdown 표 + NON_IMPLEMENTATION 표) | `TASKS/00_TASK_LIST.md` |
| Task Detail(Task당 1개) | `TASKS/TASK-<TASK-ID>.md` |
| 감사용 Manifest(기계 판독, `audit-tasks`가 생성) | `TASKS/TASK_MANIFEST.csv` |
| 감사 리포트(사람 판독, `audit-tasks`가 생성) | `TASKS/TASK_AUDIT_REPORT.md` |

`TASKS/00_TASK_LIST.md`에 등장하는 모든 Task ID는 `TASKS/TASK-<TASK-ID>.md` 파일을 정확히 1개씩 가져야 하고, `TASKS/`에는 Task List에 없는 `TASK-*.md` 파일이 존재해서는 안 된다(1:1 대응). `TASK_MANIFEST.csv`, `TASK_AUDIT_REPORT.md`는 감사 실행마다 갱신되는 산출물이며 사람이 직접 편집하지 않는다.

## 11. 실행 순서와 두 스크립트의 실제 동작

1. **`/gen-tasklist`** — 0장 입력 문서와 실제 파일 트리를 확인하고 `TASKS/00_TASK_LIST.md`를 생성/갱신한다. 이 단계에서는 `TASKS/TASK-*.md`를 만들지 않는다.
2. **`/gen-task-details`** — `TASKS/00_TASK_LIST.md`의 각 행마다 `TASKS/TASK-<ID>.md`를 생성/갱신한다. 완료 직후 `python scripts/audit_tasks.py`를 실행한다.
3. **`/audit-tasks`** — 언제든 `python scripts/audit_tasks.py`를 단독 실행해 현재 상태를 감사한다.

`scripts/validate_inputs.py`는 `/gen-tasklist` 이전에 실행하는 사전 검증 스크립트로, 아래 11개를 검사하고 통과 시 `VALIDATE_INPUTS_PASS`와 통과 검사 수를 출력한다(실패 시 exit 1, 누락 파일/Screen/Requirement ID를 출력):

1. `package.json`에 Next.js 의존성이 있다. 2. `src/app/page.tsx`·`src/app/layout.tsx` 존재. 3. PRD·SRS·Project Scope·UI 문서 존재. 4. `D-001/DESIGN.md`와 `LOCKED` Manifest 존재. 5. `SCREEN_ROUTE_CONTRACT.json` JSON 파싱 가능. 6. Screen 수 5개. 7. SCR-001~005 전부 존재. 8. Route가 `/`,`/about`,`/travel-tools`,`/mates`,`/account`. 9. Page Entry가 Next.js App Router 경로 형식. 10. `PROJECT_SCOPE.md`에 REQ-FUNC 80개·REQ-NF 34개 전부 등장. 11. AWS·EC2가 활성 기술로 정의되지 않음.

`scripts/audit_tasks.py`는 `TASKS/00_TASK_LIST.md` + `TASKS/TASK-*.md` + `docs/PROJECT_SCOPE.md` + `SCREEN_ROUTE_CONTRACT.json`을 읽어 아래 18개를 검사하고, `TASKS/TASK_MANIFEST.csv`·`TASKS/TASK_AUDIT_REPORT.md`를 **항상**(성공/실패 무관) 갱신한 뒤, 전부 통과하면 `AUDIT_PASS`와 통과 검사 수를 출력하고 exit 0, 하나라도 실패하면 exit 1로 종료한다:

1. Task List 구현 ID와 상세 Task 파일 1:1. 2. 중복 Task ID 0. 3. Depends On 누락 0. 4. Dependency Cycle 0. 5. Screen 5개 모두 Page Owner 정확히 1개. 6. Route·Page Entry·Expected Files 일치. 7. Component-only Screen 0. 8. SCR-001 Starter 제거 AC 존재. 9. SCR-003 세 탭 조립 AC 존재. 10. SCR-005 역할별 상태 조립 AC 존재. 11. DB Schema·RLS·Access·Seed Task 존재. 12. DB Table 범위가 6개 기본 테이블을 크게 넘지 않음. 13. 외부 입력 비저장 AC 존재. 14. Auth·성인·기본 RLS AC 존재. 15. Playwright Chromium Smoke Task 존재. 16. AWS·EC2·자동 Merge 구현 Task 0. 17. REQ-FUNC 80개·REQ-NF 34개가 Task 또는 EXCLUDED 표에 존재. 18. EXCLUDED 상세 구현 파일이 생성되지 않음.

**`scripts/audit_tasks.py`가 exit 1(FAIL)을 반환하면 그 결과를 무시하거나 "완료"로 보고하지 않는다.** 실패한 검사 번호와 사유를 그대로 사용자에게 전달하고, 원인이 Task List 설계 문제면 `/gen-tasklist`를, Task Detail 문제면 `/gen-task-details`를 다시 실행해 고친 뒤 재감사한다.

## 12. Task 개수에 대한 지침

전체 Task 개수는 **약 45~65개를 예상**하되(현재 64개), 이 범위 자체를 완료 조건으로 사용하지 않는다. 완료 조건은 항상 `scripts/audit_tasks.py`의 18개 검사 전부 통과다.

## 13. 금지 사항 요약

- Airbnb 상표, 예약/결제 UI, 별점·후기·매너온도, 조작된 실시간 통계, 내부 가격 비교 문구 — `design-reference/D-001/DESIGN.md`의 Do Not을 그대로 따른다.
- EXCLUDED 요구사항(전체 CMS, 미디어 업로드 워크플로, 범용 감사 로그, 자동 백업/장애 알림, 외부 이메일 연동, 회원 탈퇴 자동 삭제 파이프라인, 행동 분석 이벤트, 서버 속도 제한 등)을 구현 범위로 되돌리는 Task를 만들지 않는다.
- 구현되지 않은 것을 "완료"로 기록하지 않는다. Task Detail의 `status`는 처음 생성할 때 항상 `NOT_STARTED`다.
- 이 Skill과 세 커맨드(`/gen-tasklist`, `/gen-task-details`, `/audit-tasks`)는 **Task List·Task Detail·감사 산출물만** 만든다. `src/`, `supabase/` 등 실제 구현 코드를 만들지 않는다.
- **Task Audit(`scripts/audit_tasks.py`) 실패를 무시하지 않는다.** FAIL을 PASS로 바꿔 말하거나, 실패한 채로 다음 단계로 넘어가지 않는다.
