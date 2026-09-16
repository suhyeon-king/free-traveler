---
description: prepare-task로 READY_TO_IMPLEMENT가 확인된 Task 하나를 Expected Files 범위 안에서 구현한다. Commit/Push/PR은 기본적으로 하지 않는다.
---

`traveler-project-pipeline` Skill을 로드하고 그 규칙을 그대로 따른다. `CLAUDE.md`의 "필수 규칙"과 "Task 완료 순서"를 함께 따른다. 이 커맨드는 **정확히 Task 하나만** 구현한다.

## 0. 선행 조건 — `/prepare-task`가 `READY_TO_IMPLEMENT`를 낸 Task만

1. 이 커맨드를 호출한 세션에서 이미 `/prepare-task <WAVE_ID> <TASK_ID>`를 실행해 `READY_TO_IMPLEMENT`를 받았는지 확인한다. 받지 않았다면 **먼저 `/prepare-task <WAVE_ID> <TASK_ID>`를 실행**하고, 그 결과가 `READY_TO_IMPLEMENT`일 때만 아래로 진행한다.
2. `/prepare-task` 결과가 `READY_TO_IMPLEMENT`가 아니면(`BLOCKED_INPUT`/`BLOCKED_DEPENDENCY`/`BLOCKED_DIRTY_TREE`/`BLOCKED_SCOPE`) 구현을 시작하지 않고 그 상태와 사유를 그대로 사용자에게 보고한 뒤 중단한다. 막힌 이유를 우회하거나 스스로 판단으로 넘어가지 않는다.
3. 한 번에 **하나의 Task ID만** 구현한다. 같은 실행 안에서 다른 Task로 넘어가지 않는다(Wave 안의 다음 Task는 별도의 `/prepare-task` → `/implement-task` 호출로 진행한다).

## 1. Expected Files 범위 안에서만 작업

`TASKS/TASK-<TASK_ID>.md`의 **Expected Files** 절에 나열된 파일만 생성·수정한다.

- 구현 중 목록에 없는 파일을 고쳐야 할 필요가 생기면(예: 공용 타입 정의, 다른 Task 소유 파일) **멈추고 사용자에게 알린다** — 임의로 범위를 넓히지 않는다.
- "신규 생성"으로 표기된 파일은 새로 만들고, "이미 존재 — 수정"으로 표기된 파일은 기존 내용을 보존하며 필요한 부분만 변경한다.

## 2. Functional / Visual / Security AC를 그대로 따른다

`TASKS/TASK-<TASK_ID>.md`의 **Functional AC**, **Visual AC**, **Security/Privacy AC** 체크리스트를 구현의 완료 기준으로 삼는다.

- `design-reference/D-001/DESIGN.md`(Design Ref에 적힌 절)의 색상·타이포·간격·컴포넌트 규칙을 그대로 적용한다. 토큰에 없는 임의 색상을 추가하지 않는다.
- `design-reference/UI_CONTRACT.md`의 Section 순서·상태·이동 규칙을 어기지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요", 내용 없는 Card를 만들지 않는다. 데이터가 없는 목록형 UI는 완성형 Empty State(사유+이용 방법+CTA)로 구현한다.

## 3. Page Owner는 실제 Page Entry를 조립한다

Task Category가 `PAGE_OWNER`인 경우:

- `src/app/**/page.tsx`(해당 Screen의 Page Entry)에서 **이미 구현되어 있는** Component/Data/DB/Infra를 import해 실제로 조립한다. Depends On에 있는 Component가 아직 구현되지 않았다면(해당 Component Task가 `DONE`이 아니라면) 이 시점에 새로 만들지 않고 — 이 상태는 원래 `/prepare-task`의 검사 3(Depends On 완료 여부)에서 걸러졌어야 하므로, 만약 여기서 발견되면 구현을 멈추고 사용자에게 보고한다.
- `PAGE-SCR001`을 구현할 때는 Next.js 기본 Starter 화면(로고, "Get started by editing" 문구, 기본 외부 링크)을 완전히 제거한다.
- `PAGE-SCR003`을 구현할 때는 항공편·숙소·동행 구하기 3개 탭을 모두 실제로 연결하고, 탭 전환 시 각 탭의 입력·검증·완료 상태가 서로 독립적으로 유지되게 한다.
- `PAGE-SCR005`를 구현할 때는 Guest/Member/Admin 역할별 상태를 실제로 조립하고, 역할에 없는 탭은 렌더링하지 않으며 Admin 탭(신고 상태 변경·외부 URL 설정)을 생략하지 않는다.

Category가 `PAGE_OWNER`가 아닌 Task는 Page Entry 파일을 건드리지 않는다.

## 4. 관련 Unit Test 실행

`TASKS/TASK-<TASK_ID>.md`의 **Test Cases**/**Verify**에 연결된 Unit Test(`UNIT-*`, 필요 시 `INTEGRATION_TEST`)가 있으면 Vitest로 실행한다.

- 테스트가 아직 없다면(이 Task가 처음 대상 로직을 구현하는 경우) 해당 Unit Test Task의 범위에서 테스트를 작성·실행한다.
- 실패하면 구현을 완료로 보고하지 않는다 — 실패 내용을 그대로 보고한다.

## 5. Playwright Smoke는 Page Owner 또는 E2E Task일 때만

- 지금 구현 중인 Task의 Category가 `PAGE_OWNER`이거나 `E2E_TEST`일 때만, `TASKS/TASK-<TASK_ID>.md`의 **Verify**에 연결된 Playwright Smoke(`E2E-PUBLIC-SMOKE`/`E2E-TRAVEL-TOOLS`/`E2E-MATE-AUTH`)를 **Chromium 프로젝트로만** 실행한다.
- 그 외 Category(`COMPONENT`/`SHARED`/`DATA`/`DB`/`INFRA`/`UNIT_TEST` 등)는 Playwright를 실행하지 않는다.
- 새 브라우저 프로젝트(Firefox/WebKit)나 시각 회귀 테스트를 추가하지 않는다.

## 6. 금지 기술·범위

- Prisma를 포함한 어떤 ORM도 추가하지 않는다. Supabase 데이터 접근은 `@supabase/supabase-js`(또는 `@supabase/ssr`) 직접 호출로 작성한다.
- AWS(EC2 포함) 리소스를 프로비저닝하거나 그런 코드를 추가하지 않는다.
- 자동 Merge(Merge Queue 자동화, Auto-merge 워크플로 등)를 구성하지 않는다.
- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 기능을 이 Task 구현에 끼워 넣지 않는다.
- `SUPABASE_SERVICE_ROLE_KEY` 등 서버 전용 비밀을 Client Component나 `NEXT_PUBLIC_*` 값에 넣지 않는다.
- 항공·숙소 입력값을 API Route, Server Action, DB, 외부 URL 쿼리, 로그로 보내는 코드를 추가하지 않는다.

## 7. 완료 보고

구현을 마치면 다음 세 가지를 반드시 보고한다.

1. **변경 파일** — `git diff --stat`(또는 동등한 방법)으로 실제 변경된 파일 목록을 확인해 보고한다. Expected Files 밖의 파일이 포함돼 있으면 즉시 알린다(있어서는 안 되는 상태).
2. **검증 결과** — 실행한 Lint/Typecheck/Unit Test/(해당 시) Playwright Smoke 각각의 통과/실패 여부를 있는 그대로 보고한다. 실행하지 않은 검증을 "통과"로 보고하지 않는다.
3. **남은 제약사항** — 이 Task 범위에서 의도적으로 하지 않은 것(예: 실제 Supabase 프로젝트 연결 필요, 환경변수 미설정으로 로컬 실행 미검증 등), Forbidden 항목 중 접했지만 지킨 것, 다음 Task가 알아야 할 전제 조건을 정리해 보고한다.

## 8. Commit / Push / PR 정책

- **기본적으로 이 커맨드는 Commit, Push, Pull Request를 자동으로 수행하지 않는다.** 구현과 검증까지만 하고 변경 사항은 Working Tree에 남겨둔다.
- 사용자가 명시적으로 요청한 경우에만, **이 Task 하나에 한정된 Commit**을 수행할 수 있다(관련 없는 다른 변경을 함께 커밋하지 않는다). 이때도 Push와 PR 생성은 하지 않는다 — Push·PR·Merge는 항상 사용자가 별도로 지시했을 때만 수행한다(`CLAUDE.md` 규칙 12, 21).
- Commit 메시지에는 Task ID와 한 줄 요약을 포함한다(예: `PAGE-SCR001: 메인 페이지 Section 조립`).

## 금지

- `/prepare-task`를 거치지 않았거나 결과가 `READY_TO_IMPLEMENT`가 아닌 Task를 구현하지 않는다.
- 한 번의 실행에서 2개 이상의 Task를 구현하지 않는다.
- Expected Files 밖의 파일을 수정하지 않는다.
- 사용자의 명시적 요청 없이 Commit·Push·PR·Merge를 수행하지 않는다.
- 검증을 실행하지 않고 "통과"라고 보고하지 않는다.
