---
description: Traveler Task 생성 파이프라인 산출물(TASKS/00_TASK_LIST.md, TASKS/TASK-*.md)을 scripts/audit_tasks.py로 감사한다
---

`traveler-project-pipeline` Skill을 로드하고 그 규칙을 그대로 따른다. **애플리케이션 구현 코드는 만들지 않는다** — 이 커맨드는 감사만 수행한다.

## 절차

1. `python scripts/audit_tasks.py`를 실행한다. 이 스크립트는 `TASKS/00_TASK_LIST.md`, `TASKS/TASK-*.md`, `docs/PROJECT_SCOPE.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`을 **실제로 읽어** 18개 항목을 검사하고, `TASKS/TASK_MANIFEST.csv`와 `TASKS/TASK_AUDIT_REPORT.md`를 성공/실패와 무관하게 갱신한다.
2. `TASKS/00_TASK_LIST.md`가 없으면 스크립트가 그 사실을 출력하고 exit 1로 종료한다 — 이 경우 `/gen-tasklist`부터(필요하면 이어서 `/gen-task-details`까지) 실행하라고 사용자에게 안내한다.
3. 스크립트가 출력한 18개 검사 결과(PASS/FAIL, 검사 번호·이름·사유)와 `TASKS/TASK_AUDIT_REPORT.md`의 상세 내용을 사용자에게 요약해 전달한다. FAIL 항목이 있으면:
   - 검사 번호와 실패 사유를 빠짐없이 나열한다.
   - 원인이 Task List 설계 문제(예: Page Owner 누락, REQ 커버리지 누락)면 `/gen-tasklist`를, Task Detail 내용 문제(예: 필수 AC 문구 누락, Forbidden 위반)면 `/gen-task-details`를 다시 실행하라고 안내한다.
4. **스스로 판단으로 Task 파일을 고쳐서 감사를 통과시키지 않는다** — 이 커맨드는 현재 상태를 있는 그대로 보고하는 것이 목적이며, 수정은 `/gen-tasklist`·`/gen-task-details`의 역할이다.
5. **Task Audit 실패를 무시하지 않는다.** exit code가 0이 아니거나 `AUDIT_PASS`가 출력되지 않으면, 이 파이프라인 관련 작업(예: Wave 진행, PR 준비)을 "완료"로 보고하지 않는다.

## 출력

- 스크립트 exit code가 0이고 `AUDIT_PASS`가 출력되면 **"감사 통과(AUDIT_PASS, N/18)"**로 명확히 보고한다.
- exit code가 0이 아니거나 `AUDIT_FAIL`이 출력되면 **"감사 실패"**로 명확히 보고하고, 3번 절차의 안내를 함께 전달한다. 이 경우를 "통과"로 바꿔 말하지 않는다.
