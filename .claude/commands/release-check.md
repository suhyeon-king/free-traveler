---
description: 배포 전 릴리스 준비 상태를 점검하고 RELEASE_READY/RELEASE_BLOCKED를 판정한다. 읽기 전용 — 코드나 Task 파일을 수정하지 않는다.
---

`traveler-project-pipeline` Skill을 로드한다. **이 커맨드는 어떤 파일도 수정하지 않는다** — 실제 파일과 이미 실행된 검증 결과를 읽어 현재 상태를 판정만 한다. 부족한 부분을 스스로 고치거나 다시 실행하지 않는다.

## 절차 개요

1. 먼저 `python scripts/audit_tasks.py`를 실행한다. `AUDIT_FAIL`(exit 1)이면 그 시점에서 **`RELEASE_BLOCKED`**로 확정하고, 아래 7개 검사는 참고용으로만 이어서 보고한다(Task Audit이 릴리스의 최소 전제 조건이다 — Task Audit이 실패한 채로 릴리스 판정을 `RELEASE_READY`로 내지 않는다).
2. `AUDIT_PASS`면 아래 7개 검사를 전부 실제로 수행한다.

## 검사 (7개, 모두 실제 파일을 읽어서 판정한다)

### 1. Task·Wave 상태

- `TASKS/WAVES.md`(WAVE_PLAN)와 `TASKS/WAVE_STATE.md`(WAVE_STATE)를 Read한다.
- WAVE_PLAN에 정의된 모든 Wave에 대해, 그 Wave의 Task ID 목록 각각을 `TASKS/TASK-<ID>.md`의 `**Task Status:**`로 확인한다.
- 하나라도 `DONE`이 아니거나, `TASKS/WAVES.md`/`TASKS/WAVE_STATE.md` 자체가 없으면 **FAIL**(어떤 Wave의 어떤 Task가 아직 끝나지 않았는지, 또는 어떤 파일이 없는지 나열).
- `TASKS/WAVE_STATE.md`의 `Wave Status`가 `WAITING_FOR_PREVIEW`나 `IN_PROGRESS`로 남아 있으면 그 자체로 **FAIL**(아직 사람 확인 대기 중이거나 진행 중).

### 2. 5개 Page Owner DONE

`TASKS/TASK-PAGE-SCR001.md` ~ `TASKS/TASK-PAGE-SCR005.md` 5개 파일 각각의 `**Task Status:**`를 확인한다. 5개 전부 `DONE`이어야 **PASS**. 하나라도 아니면 **FAIL**(어떤 Screen이 남았는지 나열).

### 3. CI PASS

- 1차: `TASKS/TASK-CI-LINT-TYPECHECK-TEST.md`의 `**Task Status:**`가 `DONE`인지 확인한다(Lint·Typecheck·Unit/Integration Test 게이트가 통과 상태로 기록됐다는 최소 증거).
- 2차(가능하면): `gh` CLI가 사용 가능하면 `gh run list --branch <현재 브랜치> --limit 1`로 최신 GitHub Actions 실행 결과를 실제로 조회해 `success` 상태인지 확인한다. `gh`를 쓸 수 없거나 실패하면 1차 결과만으로 판정하되, "실시간 CI 상태는 확인하지 못했고 Task 기록만 근거로 한다"는 점을 명시한다.
- 위 근거가 하나도 `DONE`/`success`가 아니면 **FAIL**.

### 4. Playwright Smoke PASS

`TASKS/TASK-E2E-PUBLIC-SMOKE.md`, `TASKS/TASK-E2E-TRAVEL-TOOLS.md`, `TASKS/TASK-E2E-MATE-AUTH.md` 3개 파일의 `**Task Status:**`를 확인한다. 3개 전부 `DONE`이어야 **PASS**. Playwright 리포트(`playwright-report/`, 테스트 실행 로그 등)가 저장소에 있으면 함께 확인해 실제 실행 근거를 보강한다(없어도 Task Status만으로 판정 가능하되, 어느 쪽을 근거로 삼았는지 밝힌다).

### 5. Supabase 6개 Table·기본 RLS 확인 기록

- `TASKS/TASK-DB-SCHEMA-BASE.md`, `TASKS/TASK-DB-RLS-BASE.md`, `TASKS/TASK-DB-ACCESS.md`, `TASKS/TASK-DB-SEED-BASE.md`, `TASKS/TASK-TEST-RLS-BASIC.md` 5개 Task의 `**Task Status:**`가 전부 `DONE`인지 확인한다.
- `supabase/migrations/`가 저장소에 존재하면 그 안의 `CREATE TABLE` 대상을 실제로 스캔해 `profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings` **정확히 6개**인지 확인한다(그 이상이면 FAIL). 디렉터리가 아직 없으면 이 하위 확인은 건너뛰고 Task Status 결과만으로 판정하되 "실제 마이그레이션 파일로 테이블 수를 재확인하지 못했다"는 점을 명시한다.
- 위 조건을 만족하지 못하면 **FAIL**.

### 6. Vercel Preview Checkpoint

- `TASKS/TASK-DEPLOY-VERCEL-SETUP.md`, `TASKS/TASK-SUPABASE-ENV-VERIFY.md`의 `**Task Status:**`가 `DONE`인지 확인한다.
- `docs/checklists/VERCEL_DEPLOY_CHECK.md`(`DEPLOY-VERCEL-SETUP`의 Expected Files 산출물)가 실제로 존재하는지 확인한다 — 배포 전 사람이 Vercel Preview를 확인했다는 기록이다.
- `TASKS/TASK-RELEASE-CHECK-LIGHTHOUSE.md`, `TASKS/TASK-RELEASE-CHECK-EXTERNAL-LINKS.md`, `TASKS/TASK-MANUAL-A11Y-KEYBOARD.md`의 `**Task Status:**`도 `DONE`인지 함께 확인한다(모두 Preview 상에서 사람이 직접 확인하는 릴리스 게이트다).
- `TASKS/WAVE_STATE.md`의 `Wave Status`가 `WAITING_FOR_PREVIEW`로 남아 있지 않은지 다시 한번 확인한다(1번 검사와 중복 확인이지만 이 항목의 핵심 의미이므로 여기서도 명시적으로 본다).
- 위 중 하나라도 불충족이면 **FAIL**.

### 7. EXCLUDED 목록

- `docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 REQ ID 전체를 실제로 읽는다.
- `TASKS/00_TASK_LIST.md`의 `## 4. NON_IMPLEMENTATION` 표에 그 EXCLUDED ID 전부가 여전히 근거·후속 방향과 함께 남아 있는지 확인한다(삭제되지 않았는지).
- 동시에, 어떤 Task의 `Requirement Ref`에도 EXCLUDED ID가 구현 대상으로 들어가 있지 않은지 확인한다(이 부분은 `scripts/audit_tasks.py` 검사 17·18과 동일 기준이며, 1번 절차에서 이미 `AUDIT_PASS`를 확인했다면 이 항목은 자동으로 충족된 것으로 보고 교차 확인만 한다).
- EXCLUDED 항목이 누락되었거나 구현 대상으로 편입되었으면 **FAIL**.

## 판정

- `scripts/audit_tasks.py`가 `AUDIT_PASS`이고, 위 7개 검사가 **전부 PASS**해야 **`RELEASE_READY`**.
- 그 외 모든 경우(Audit FAIL 포함, 7개 검사 중 하나라도 FAIL)는 **`RELEASE_BLOCKED`**.

## 출력 형식

```
STATUS: <RELEASE_READY|RELEASE_BLOCKED>
Task Audit: <AUDIT_PASS n/18|AUDIT_FAIL n/18>
검사 결과:
  1. Task·Wave 상태 — PASS|FAIL(사유)
  2. 5개 Page Owner DONE — PASS|FAIL(남은 Screen)
  3. CI PASS — PASS|FAIL(근거: Task 기록 또는 gh run 결과)
  4. Playwright Smoke PASS — PASS|FAIL(근거)
  5. Supabase 6개 Table·기본 RLS — PASS|FAIL(사유)
  6. Vercel Preview Checkpoint — PASS|FAIL(사유)
  7. EXCLUDED 목록 — PASS|FAIL(누락/침범 항목)
남은 조치: <FAIL 항목별로 무엇을 먼저 해야 하는지, 예: "/run-wave W04를 마저 진행하세요", "docs/checklists/VERCEL_DEPLOY_CHECK.md를 작성하세요">
```

## 금지

- 이 커맨드는 파일을 생성·수정·삭제하지 않는다(검증을 대신 실행해서 통과시키는 것도 포함 — 예를 들어 CI나 Playwright를 이 커맨드 안에서 대신 실행해 결과를 만들어내지 않는다. 이미 기록된 결과만 읽는다).
- 근거가 불충분하거나 확인할 수 없으면 항상 **FAIL** 쪽으로 판정한다(낙관적으로 `RELEASE_READY`를 추정하지 않는다).
- `scripts/audit_tasks.py`가 실패했는데 나머지 7개 검사가 통과했다는 이유로 `RELEASE_READY`를 출력하지 않는다.
