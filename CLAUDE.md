# CLAUDE.md — Free Traveler

이 저장소(`traveler/app`)에서 작업하는 모든 Agent가 따라야 하는 규칙이다. 다른 Agent 규칙 파일을 참조하지 않고, 필요한 규칙을 이 문서 안에 직접 기록한다.

## Harness Marker

```
HARNESS_SCHEMA=traveler-screen-route-v1
DESIGN_PATH=design-reference/D-001/DESIGN.md
SCREEN_CONTRACT=design-reference/SCREEN_ROUTE_CONTRACT.json
PROJECT_SCOPE=docs/PROJECT_SCOPE.md
PLAYWRIGHT_ENABLED=true
PLAYWRIGHT_SCOPE=chromium-smoke
AUTO_MERGE=false
AWS_ENABLED=false
```

## 필수 규칙

1. **작업 전 확인** — 코드를 만들기 전 `package.json`의 `next` 버전을 확인하고, 그 버전에 맞는 Next.js 문서를 확인한다. 기억에 의존해 오래된 Pages Router 패턴이나 이미 바뀐 API를 쓰지 않는다.
2. **SRS 정본** — 요구사항의 정본은 `docs/06_SRS_UIUX_REVISED.md`(Route·화면 구조)이며, 요구사항 원문·ID·우선순위는 `docs/02_SRS_BASELINE.md`를 따른다. 두 문서와 다르게 구현하지 않는다.
3. **Scope 분류 정본** — 어떤 요구사항을 구현하고 어떤 것을 EXCLUDED로 두는지는 `docs/PROJECT_SCOPE.md`가 정본이다. 이 문서에서 EXCLUDED로 표시된 요구사항은 구현하지 않는다.
4. **디자인 정본** — 색상·타이포·간격·컴포넌트 규칙은 `design-reference/D-001/DESIGN.md`가 정본이다. `design-reference/vendor/airbnb/DESIGN-airbnb.md`는 레이아웃 밀도·위계 같은 개념만 참고하는 vendor 자료이며 색상 값·폰트명·로고·컴포넌트를 그대로 가져다 쓰지 않는다.
5. **Screen 정본** — 화면·Route·Page Entry의 정본은 `design-reference/SCREEN_ROUTE_CONTRACT.json`(`schema_version: traveler-screen-route-v1`)이다. 이 파일에 없는 Route나 Page를 새로 만들지 않는다.
6. **표준 개발 명령** — 개발은 `/run-wave WXX` 명령으로 진행한다(`WXX`는 Wave 번호, 예: `/run-wave W01`). 이 명령 없이 임의로 여러 Task를 동시에 건드리지 않는다.
7. **Task 순차 실행** — Wave 내부의 Task는 `TASKS/00_TASK_LIST.md`의 `Depends On` 순서를 지켜 **한 번에 하나만** 구현한다. 의존 Task가 끝나기 전에 그 Task에 의존하는 다음 Task를 시작하지 않는다.
8. **Expected Files 준수** — 지금 진행 중인 Task의 `TASKS/TASK-<ID>.md`에 적힌 **Expected Files 목록 밖의 파일은 수정하지 않는다.** 다른 파일 수정이 필요하다고 판단되면 먼저 사람에게 확인을 구한다.
9. **Page Owner는 조립만** — Page Owner Task(`PAGE-SCR00N`)는 해당 Page Entry(`src/app/**/page.tsx`)에서 이미 존재하거나 계획된 Component/Data/DB/Infra Task의 결과물을 **조립**만 한다. Page Owner Task 안에서 새 Component를 처음부터 구현하지 않는다.
10. **SCR-001 Starter 제거** — `PAGE-SCR001`(`src/app/page.tsx`)을 완료할 때 Next.js 기본 스타터 화면(로고, "Get started by editing" 문구, 기본 외부 링크 등)을 완전히 제거하고 실제 Section으로 교체한다.
11. **SCR-003 3탭 조립** — `PAGE-SCR003`(`/travel-tools`)은 항공편·숙소·동행 구하기 3개 탭을 모두 조립하며, 탭 전환 시 각 탭의 입력·검증·완료 상태를 서로 독립적으로 유지한다.
12. **항공·숙소 입력 비전달** — 항공·숙소 조건 입력값(국가·지역·날짜)은 서버 API, DB, 외부 URL 쿼리 파라미터, 서버 로그, 분석 이벤트 어디로도 보내지 않는다. Client Component의 일시 상태로만 유지한다.
13. **Supabase 쓰기 범위 제한** — Supabase에 쓰기(INSERT/UPDATE/DELETE)하는 코드는 인증(Auth), 동행(모집글·참가 요청·차단), 신고, 관리자 설정(`app_settings`) 범위로만 작성한다. 그 외 목적의 쓰기 기능을 새로 추가하지 않는다.
14. **RLS 우회 금지** — Row Level Security를 우회하는 Client 코드(예: RLS가 걸린 테이블을 관리자 권한으로 무조건 열람하는 코드)를 작성하지 않는다. Client·Server Component 모두 사용자 세션 권한으로만 Supabase에 접근한다.
15. **Service Role Key는 Client 금지** — `SUPABASE_SERVICE_ROLE_KEY`(또는 이에 준하는 관리자 키)를 Client Component, 브라우저로 전달되는 코드, `NEXT_PUBLIC_*` 환경변수에 절대 포함하지 않는다. 꼭 필요한 서버 전용 작업에서만 서버 코드 안에 격리해 사용한다.
16. **콘텐츠는 정적 Data** — 여행지·국가 안전정보·대표 소개 콘텐츠는 `src/data/*.ts` 정적 데이터로 작성한다. 이를 위한 DB 테이블이나 CMS 관리 화면을 만들지 않는다.
17. **금지 기술 스택** — Prisma를 포함한 어떤 ORM도, AWS를 포함한 어떤 AWS 리소스(EC2 등)도 프로젝트에 추가하지 않는다(`AWS_ENABLED=false`). 데이터 접근은 `@supabase/supabase-js`(또는 `@supabase/ssr`) 직접 호출로 작성한다.
18. **Playwright는 핵심 Smoke만** — Playwright는 Chromium 프로젝트로 핵심 사용자 흐름 Smoke Test만 작성한다(`PLAYWRIGHT_SCOPE=chromium-smoke`). 다중 브라우저 매트릭스, 시각 회귀 테스트를 추가하지 않는다.
19. **EXCLUDED 임의 구현 금지** — `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능(전체 콘텐츠 CMS, 미디어 업로드 워크플로, 범용 감사 로그, 자동 백업·장애 알림, 외부 이메일 연동, 회원 탈퇴 자동 삭제 파이프라인 등)을 스스로 판단해 구현하지 않는다. 필요하다고 판단되면 먼저 사람에게 확인한다.
20. **Destructive Git 명령 금지** — `git push --force`, `git reset --hard`, `git clean -fd`, 브랜치 강제 삭제 등 되돌리기 어려운 Git 명령을 사람의 명시적 지시 없이 실행하지 않는다. 실행 전 `git status`로 현재 상태를 확인한다.
21. **자동 PR·자동 Merge 금지** — PR을 자동으로 생성하거나 자동으로 병합하지 않는다(`AUTO_MERGE=false`). PR 생성이 필요하면 내용을 사람에게 제시하고 승인을 받는다. 병합은 항상 사람이 수행한다.
22. **사람 확인 후 다음 Wave 진행** — 하나의 화면(Screen) 관련 Wave를 완료하면, 사람이 Preview(Vercel Preview 또는 로컬 실행 화면)를 확인하기 전까지 다음 화면 Wave로 넘어가지 않는다.
23. **완료 보고 형식** — 작업을 완료하면 (1) 변경한 파일 목록, (2) 실행한 검증 결과(Lint·Typecheck·Unit Test·Playwright 등 통과/실패 여부), (3) 남은 제한사항(누락된 것, 사람이 확인해야 할 것)을 함께 보고한다. 실행하지 않은 검증을 "통과"로 보고하지 않는다.

## Task 완료 순서

각 Task는 아래 순서로 진행한다. 순서를 건너뛰지 않는다.

1. **Task 읽기** — `TASKS/TASK-<ID>.md`의 Context, Project Scope, Requirement Ref, Screen/Route/Page Entry, Design Ref, Depends On, Expected Files, Functional/Visual/Security AC, Test Cases, Forbidden을 전부 읽는다.
2. **입력 확인** — Depends On에 있는 Task가 실제로 완료돼 있는지, 필요한 정적 데이터·환경변수·Supabase 스키마가 존재하는지 확인한다. 없으면 구현을 시작하지 않고 먼저 그 사실을 보고한다.
3. **구현** — Expected Files 안에서만 코드를 작성·수정한다.
4. **관련 포맷·Unit Test** — 관련된 포맷팅(Lint)과 이 Task에 연결된 Unit Test를 실행한다.
5. **필요 시 Playwright** — 이 Task가 Playwright Smoke Task(Chromium)에 연결돼 있으면 실행한다.
6. **Diff 확인** — 변경 사항이 Expected Files 범위 안에 있는지, Forbidden 항목을 건드리지 않았는지 `git diff`로 직접 확인한다.
7. **완료 보고** — 위 규칙 23 형식으로 보고한다.
