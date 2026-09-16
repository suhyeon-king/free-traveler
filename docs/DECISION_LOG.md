# Free Traveler — Decision Log

- **Document ID:** DEC-LOG-001
- **목적:** Free Traveler 프로젝트 진행 중 확정된 주요 결정을 번호를 매겨 기록한다. 이후 문서나 Task가 이 결정과 다른 방향으로 가려면 이 로그를 먼저 갱신해야 한다.
- **표기:** 모든 결정의 상태는 **Accepted**다. 번복 시에는 기존 항목을 지우지 않고 상태를 `Superseded by DEC-0XX`로 바꾸고 새 항목을 추가한다.

---

## DEC-001 — 실제 개발 루트는 `traveler/app`

- **상태:** Accepted
- **결정:** 이 저장소에서 실제 Next.js 애플리케이션 코드가 위치하는 루트는 `traveler/app`이다. `package.json`, `src/app`, `docs/`, `design-reference/`, `TASKS/`, `scripts/`는 모두 이 루트 기준 상대 경로다.
- **근거:** 프로젝트 초기 스캐폴딩(`Create Next App`)이 이 경로에 생성되었고, 이후 모든 산출물(SRS 개정, PROJECT_SCOPE, UI 계약, Task List)이 이 루트를 기준으로 작성됐다.
- **영향:** 이후 모든 문서의 경로 표기(`src/app/page.tsx` 등)는 별도 언급이 없는 한 `traveler/app/` 기준이다. 멀티 루트나 모노레포 구조로 전환하려면 이 결정부터 재검토해야 한다.
- **관련 문서:** `package.json`, `docs/ARCHITECTURE.md` §1

---

## DEC-002 — 디자인 Screen은 핵심 4개 · 보조 1개

- **상태:** Accepted
- **결정:** 승인된 디자인 Screen은 정확히 5개이며 핵심 화면 4개(여행지 탐색, 항공, 숙소, 동행 찾기)와 보조 화면 1개(대표 소개)로 분류한다. 물리적으로는 핵심 기능이 SCR-001·SCR-003·SCR-004 3개 화면에 배치된다(항공·숙소가 SCR-003으로 통합되므로).
- **근거:** 기존 SRS Baseline의 다중 Route(여행지/국내/해외/상세, 비행기, 호텔, 동행 목록/상세/작성, 안전정보 목록/상세, 대표 소개, 인증, 마이페이지, 관리자)를 그대로 구현하면 화면 수가 과도하게 늘어난다. Drawer/Modal/탭으로 통합해 5개로 고정했다.
- **영향:** 새 화면을 추가하려면 이 결정을 먼저 바꿔야 한다. `SCREEN_ROUTE_CONTRACT.json`의 `screens` 배열이 5개를 벗어나면 `scripts/validate_inputs.py`, `scripts/audit_tasks.py`가 실패하도록 설계돼 있다.
- **관련 문서:** `design-reference/SCREEN_ROUTE_CONTRACT.json`, `design-reference/UI_CONTRACT.md`, `docs/05_UIUX_APPROVED.md` §1, `docs/ARCHITECTURE.md` §2

---

## DEC-003 — `/travel-tools`에 항공·숙소·동행 작성을 통합

- **상태:** Accepted
- **결정:** 비행기 찾기, 호텔 찾기, 동행 모집글 작성을 별도 Route로 만들지 않고 `/travel-tools`(SCR-003) 한 화면의 3개 탭(항공편/숙소/동행 구하기)으로 통합한다. 세 탭은 입력·검증·완료 상태를 서로 독립적으로 유지한다.
- **근거:** 세 기능 모두 "여행 조건을 정리한 뒤 다음 행동(외부 이동 또는 동행 등록)으로 이어진다"는 공통 목적을 가지며, 사용자가 한 화면에서 오갈 수 있어야 한다는 UI/UX 계획(`docs/04_UIUX_PLAN.md`)에 따른 것이다.
- **영향:** `CMP-SCR003-FLIGHT-FORM`, `CMP-SCR003-HOTEL-FORM`, `CMP-SCR003-MATE-WRITE` 3개 Component Task로 분리 구현하고, `PAGE-SCR003` 하나의 Page Owner가 탭 조립만 담당한다(`TASKS/00_TASK_LIST.md` §2-4).
- **관련 문서:** `design-reference/UI_CONTRACT.md`(SCR-003), `docs/06_SRS_UIUX_REVISED.md` §3-2, `TASKS/TASK-PAGE-SCR003.md`

---

## DEC-004 — 여행지·안전·대표는 정적 TypeScript Data

- **상태:** Accepted
- **결정:** 여행지 콘텐츠, 국가별 안전정보, 대표(`free_traveler`) 소개 콘텐츠는 Supabase 테이블이 아니라 `src/data/*.ts` 정적 TypeScript 데이터로 관리한다. 콘텐츠 CRUD 관리자 화면(CMS)은 만들지 않는다.
- **근거:** 콘텐츠 변경 빈도가 낮고, 별도 CMS·게시 워크플로·미디어 업로드 승인 인프라를 구축하는 비용이 이 프로젝트 범위를 넘어선다(`docs/PROJECT_SCOPE.md` EXCLUDED: REQ-FUNC-055/072/073/074/075).
- **영향:** 콘텐츠 갱신은 코드 변경(PR)으로만 이뤄진다. 안전정보 stale(7일 경과) 표시는 배치 작업 없이 렌더링 시점에 `verified_at` 값을 계산한다. 콘텐츠 양이 크게 늘어나면 이 결정을 재검토해야 한다.
- **관련 문서:** `docs/PROJECT_SCOPE.md` 구현 방식, `docs/ARCHITECTURE.md` §6, `TASKS/TASK-DATA-DESTINATIONS.md`, `TASKS/TASK-DATA-SAFETY.md`, `TASKS/TASK-DATA-REPRESENTATIVE.md`

---

## DEC-005 — Supabase는 Auth와 동행 기능 중심

- **상태:** Accepted
- **결정:** Supabase는 인증(Auth)과 동행(Travel Mate) 관련 기능(모집글, 참가 요청, 차단, 신고, 관리자 설정)에만 사용한다. Storage는 사용하지 않으며, 이미지는 일반 인터넷 이미지 URL을 참조한다.
- **근거:** DEC-004로 콘텐츠가 정적 데이터로 빠지면서 Supabase의 역할이 사용자 생성 데이터(로그인 상태가 필요한 기능)로 자연스럽게 좁혀졌다.
- **영향:** Supabase 프로젝트 설계·RLS·테이블 수(DEC-006)가 모두 "Auth + 동행" 범위로 한정된다. 콘텐츠 관련 백엔드 요구가 생기면 이 결정을 먼저 수정해야 한다.
- **관련 문서:** `docs/ARCHITECTURE.md` §7, `docs/02_SRS_BASELINE.md` §3.1 Architecture

---

## DEC-006 — DB는 6개 Table로 제한

- **상태:** Accepted
- **결정:** Supabase PostgreSQL 테이블은 정확히 6개(`profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings`)로 제한한다. 감사 로그, 미디어 자산, 콘텐츠 CMS용 테이블은 추가하지 않는다.
- **근거:** DEC-005의 범위(Auth + 동행)를 데이터 모델 수준에서 강제하기 위함이며, `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 확정된 기능(범용 감사 로그 REQ-FUNC-056/076, 미디어 업로드 워크플로 REQ-FUNC-073)이 새 테이블로 되살아나는 것을 막는다.
- **영향:** `scripts/audit_tasks.py` 검사 11·12가 이 6개 테이블 구성을 자동으로 확인한다(`DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE` 4개 Task로 구현). 7번째 테이블이 필요해지면 이 결정과 감사 스크립트를 함께 갱신해야 한다.
- **관련 문서:** `docs/ARCHITECTURE.md` §8, `TASKS/TASK-DB-SCHEMA-BASE.md`, `scripts/audit_tasks.py`(`ALLOWED_DB_TABLES`)

---

## DEC-007 — 항공·숙소 입력은 Browser Memory에만 유지

- **상태:** Accepted
- **결정:** 항공·숙소 조건 입력값(국가·지역·날짜)은 Client Component의 일시 상태로만 유지한다. API Route, Server Action, DB, 외부 URL 쿼리, 서버 로그 어디로도 전송·저장하지 않는다.
- **근거:** PRD 제품 원칙("항공·호텔 입력값은 MVP에서 외부 사이트로 전달하거나 서버에 저장하지 않는다") 및 개인정보 최소 수집 원칙에 따른 것이다.
- **영향:** 이 폼을 위한 백엔드 엔드포인트를 만들지 않는다. 새로고침·탭 이탈 시 입력값이 사라지는 것은 버그가 아니라 의도된 동작이다.
- **관련 문서:** `docs/ARCHITECTURE.md` §4~5, `docs/02_SRS_BASELINE.md`(REQ-FUNC-017/025, REQ-NF-017), `TASKS/TASK-CMP-SCR003-FLIGHT-FORM.md`, `TASKS/TASK-CMP-SCR003-HOTEL-FORM.md`

---

## DEC-008 — Airbnb `DESIGN.md`는 vendor 참고본, D-001이 실제 정본

- **상태:** Accepted
- **결정:** `design-reference/vendor/airbnb/DESIGN-airbnb.md`는 레이아웃 밀도·타이포 위계·단일 액센트 운용 같은 **개념만 참고**하는 vendor 참고 자료이며, Free Traveler의 실제 디자인 정본은 `design-reference/D-001/DESIGN.md`(Status: LOCKED)다. Airbnb의 색상 값·폰트명·로고·컴포넌트는 어떤 화면에도 사용하지 않는다.
- **근거:** Airbnb 상표 요소를 프로젝트에 들이지 않기 위한 명시적 경계이며, Stitch 화면 검증(`docs/STITCH_VALIDATION_REPORT.md`)에서도 이 경계를 기준으로 위반 여부를 판정했다.
- **영향:** 새 디자인 토큰·컴포넌트 규칙이 필요하면 D-001을 갱신(또는 D-002를 새로 만들고 Manifest 전환)하며, vendor 참고본은 읽기 전용으로 유지한다.
- **관련 문서:** `design-reference/D-001/DESIGN.md`, `design-reference/DESIGN_MANIFEST.md`, `design-reference/vendor/airbnb/DESIGN-airbnb.md`

---

## DEC-009 — Playwright는 Chromium Smoke만 필수

- **상태:** Accepted
- **결정:** E2E 테스트는 Playwright의 **Chromium 프로젝트만** 구성한다. Firefox/WebKit 등 다중 브라우저 매트릭스, 시각 회귀 테스트는 이 프로젝트의 필수 범위가 아니다. 핵심 사용자 흐름 5~7개를 `E2E-PUBLIC-SMOKE`/`E2E-TRAVEL-TOOLS`/`E2E-MATE-AUTH` 3개 Task로 묶는다.
- **근거:** MVP 단계에서 다중 브라우저 검증 비용 대비 효용이 낮고, 핵심 흐름의 회귀 방지가 우선 목표이기 때문이다(`docs/PROJECT_SCOPE.md` REQ-NF-004 등 부하·다중 환경 검증 EXCLUDED 기조와 일치).
- **영향:** `scripts/audit_tasks.py` 검사 15가 Playwright Task에 "Chromium" 언급을, 검사 16 계열이 다른 브라우저 매트릭스 확대를 감시한다.
- **관련 문서:** `docs/ARCHITECTURE.md` §12, `TASKS/TASK-E2E-PUBLIC-SMOKE.md`, `TASKS/TASK-E2E-TRAVEL-TOOLS.md`, `TASKS/TASK-E2E-MATE-AUTH.md`

---

## DEC-010 — 사용자의 개발 실행 단위는 Wave

- **상태:** Accepted
- **결정:** 사용자는 `TASKS/00_TASK_LIST.md`의 64개 Task를 한 번에 실행하지 않고 **Wave** 단위로 묶어 순차 진행한다. 하나의 Wave는 서로 의존성이 풀린(선행 Task가 끝난) Task들의 묶음이며, Wave 완료 시점마다 사람이 결과를 검토한다.
- **근거:** Task List가 64개로 많고 Page Owner가 Component/Data/DB/Infra Task에 의존하는 구조(`docs/PROJECT_SCOPE.md`, `TASKS/00_TASK_LIST.md` §3 의존 관계 요약)이므로, 의존성 순서를 지키면서도 검토 가능한 크기로 나눠 실행해야 한다.
- **영향:** Wave 분할 기준(예: DATA/DB/INFRA → SHARED → COMPONENT → PAGE_OWNER → TEST/CI 순)은 `TASKS/00_TASK_LIST.md`의 `Depends On` 그래프를 기준으로 사용자가 정한다. 이 로그는 "Wave"라는 실행 단위가 존재한다는 사실만 고정하며, Wave의 구체적 구성은 별도 실행 계획 문서/대화에서 정한다.
- **관련 문서:** `TASKS/00_TASK_LIST.md`, `TASKS/TASK_MANIFEST.csv`(`depends_on` 열)

---

## DEC-011 — Single Agent가 Wave 내부 Task를 순차 수행

- **상태:** Accepted
- **결정:** 하나의 Wave 내부에서는 **Single Agent(단일 에이전트 세션)** 가 Task를 하나씩 순차적으로 수행한다. Wave 내부 Task를 여러 에이전트로 병렬 분담하지 않는다.
- **근거:** Task 간 의존성(같은 Screen의 Component→Page Owner, DB Schema→RLS→Access 등)이 촘촘해 병렬 실행 시 충돌·중복 작업 위험이 크고, 이 프로젝트 규모에서는 순차 실행의 검토 용이성이 병렬화의 속도 이득보다 크다고 판단했다.
- **영향:** Task 실행 도구(예: 향후 만들 실행 커맨드)는 한 번에 하나의 Task만 진행 상태로 표시하며, 동시에 여러 Task를 "진행 중"으로 만들지 않는다. Wave 간 병렬화는 이 결정의 범위가 아니다(Wave 자체를 병렬로 굴릴지는 별도 결정 사항).
- **관련 문서:** `TASKS/00_TASK_LIST.md`, DEC-010

---

## DEC-012 — PR·Merge는 사용자가 수동 수행

- **상태:** Accepted
- **결정:** Pull Request 생성과 병합(Merge)은 에이전트가 자동으로 수행하지 않고 **사용자가 직접** 수행한다. CI(GitHub Actions)는 검사 결과만 보고하며, 통과 시 자동 병합하는 워크플로를 구성하지 않는다.
- **근거:** `docs/PROJECT_SCOPE.md`에서 "무인 자동 Merge Runner"를 제외 기능으로 명시했고, 코드 변경의 최종 승인은 사람이 담당한다는 운영 원칙에 따른 것이다.
- **영향:** Task 완료 후에도 PR 생성·리뷰 요청까지는 자동화될 수 있으나(향후 결정 사항), 병합 버튼을 누르는 행위 자체는 항상 사용자 몫이다.
- **관련 문서:** `docs/PROJECT_SCOPE.md`(제외 기능: 무인 자동 Merge Runner), `docs/ARCHITECTURE.md` §15, DEC-013

---

## DEC-013 — EC2·AWS는 사용하지 않음

- **상태:** Accepted
- **결정:** 컴퓨팅·호스팅 인프라로 AWS EC2를 포함한 어떤 AWS 리소스도 사용하지 않는다. 배포는 Vercel, 데이터·인증은 Supabase(관리형)만 사용한다.
- **근거:** MVP 규모에서 자체 서버 운영·AWS 계정 관리 비용이 불필요하며, Vercel + Supabase 조합만으로 요구 기능을 충족할 수 있다(`docs/PROJECT_SCOPE.md` 제외 기능: EC2·AWS 인프라).
- **영향:** `scripts/audit_tasks.py` 검사 16이 Task 본문에서 "AWS"/"EC2"가 금지 문맥 없이 등장하는지 자동으로 감시한다. 향후 트래픽·요구 증가로 AWS가 필요해지면 이 결정부터 재검토해야 한다.
- **관련 문서:** `docs/ARCHITECTURE.md` §14, `docs/PROJECT_SCOPE.md`

---

## DEC-014 — 제외 기능은 EXCLUDED로 관리

- **상태:** Accepted
- **결정:** 구현하지 않기로 한 요구사항(REQ-FUNC/REQ-NF)은 목록에서 삭제하지 않고 **EXCLUDED** 상태로 표시해 계속 추적한다. 각 EXCLUDED 항목에는 사유와 후속 방향을 함께 기록한다.
- **근거:** 요구사항을 삭제하면 "왜 안 만들었는지"에 대한 근거가 사라지고, 이후 재논의·감사 시 누락처럼 보일 위험이 있다. 추적성을 유지하기 위해 상태만 바꾸고 항목은 보존한다.
- **영향:** `docs/PROJECT_SCOPE.md`, `docs/UIUX_TRACEABILITY.md`, `TASKS/00_TASK_LIST.md` §4(NON_IMPLEMENTATION) 모두 이 원칙을 따르며, `scripts/validate_inputs.py`·`scripts/audit_tasks.py`가 REQ-FUNC 80개·REQ-NF 34개(114개) 전체가 IMPLEMENT 또는 EXCLUDED 중 하나로 어딘가에 존재하는지 자동 검증한다.
- **관련 문서:** `docs/PROJECT_SCOPE.md`, `docs/UIUX_TRACEABILITY.md`, `TASKS/00_TASK_LIST.md` §4, `scripts/audit_tasks.py`(검사 17·18)

---

## 결정 색인

| ID | 제목 |
|---|---|
| DEC-001 | 실제 개발 루트는 `traveler/app` |
| DEC-002 | 디자인 Screen은 핵심 4개·보조 1개 |
| DEC-003 | `/travel-tools`에 항공·숙소·동행 작성을 통합 |
| DEC-004 | 여행지·안전·대표는 정적 TypeScript Data |
| DEC-005 | Supabase는 Auth와 동행 기능 중심 |
| DEC-006 | DB는 6개 Table로 제한 |
| DEC-007 | 항공·숙소 입력은 Browser Memory에만 유지 |
| DEC-008 | Airbnb DESIGN.md는 vendor 참고본, D-001이 실제 정본 |
| DEC-009 | Playwright는 Chromium Smoke만 필수 |
| DEC-010 | 사용자의 개발 실행 단위는 Wave |
| DEC-011 | Single Agent가 Wave 내부 Task를 순차 수행 |
| DEC-012 | PR·Merge는 사용자가 수동 수행 |
| DEC-013 | EC2·AWS는 사용하지 않음 |
| DEC-014 | 제외 기능은 EXCLUDED로 관리 |
