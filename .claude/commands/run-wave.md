---
description: Wave 단위로 Task를 순차 구현하는 표준 개발 명령. `/run-wave WXX`, `/run-wave status`, `/run-wave resume`, `/run-wave dry-run WXX`를 지원한다. 자동 Branch·PR·Merge는 포함하지 않는다.
---

`traveler-project-pipeline` Skill을 로드하고, `/prepare-task`와 `/implement-task`의 규칙을 그대로 따른다(이 커맨드는 두 커맨드를 순서대로 호출하는 오케스트레이션이며, 두 커맨드가 정의한 검사·구현 규칙을 대체하지 않는다). `CLAUDE.md`의 "필수 규칙"(특히 6·7·8·9·10·11·12·17·20·21·22·23번)을 함께 따른다.

## 사용하는 상태 파일

| 파일 | 소유자 | 역할 |
|---|---|---|
| **WAVE_PLAN** = `TASKS/WAVES.md` | 사람이 작성(이 커맨드는 읽기만 한다) | Wave ID별로 어떤 Task ID를 어떤 순서로 묶었는지, Wave 완료 후 Preview Checkpoint가 있는지 정의. |
| **WAVE_STATE** = `TASKS/WAVE_STATE.md` | 이 커맨드가 소유·갱신 | 현재 진행 중인 Wave, Wave 상태, 마지막으로 완료한 Task를 기록. |
| Task Status | 각 `TASKS/TASK-<ID>.md` 상단 `**Task Status:**` 필드 | Task 하나가 끝나면(`/implement-task` 완료 + 검증 PASS) 이 커맨드가 `DONE`으로 갱신. |

`TASKS/WAVES.md` 기대 형식(없으면 이 커맨드는 만들지 않고 사용자에게 먼저 작성하라고 안내한다):

```
| Wave ID | Task IDs (Depends On 순서) | Preview Checkpoint |
|---|---|---|
| W01 | DB-SCHEMA-BASE, DB-RLS-BASE, DB-ACCESS, DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE | 없음 |
| W02 | SHR-HEADER-FOOTER, CMP-SCR001-HERO-SEARCH, ..., PAGE-SCR001 | SCR-001(`/`) Preview 확인 |
```

`TASKS/WAVE_STATE.md` 형식(이 커맨드가 최초 실행 시 만들고 이후 갱신한다):

```
- Active Wave: W02
- Wave Status: NOT_STARTED | IN_PROGRESS | WAITING_FOR_PREVIEW | COMPLETE
- Last Completed Task: CMP-SCR001-HERO-SEARCH
- Note: <있으면 한 줄>
```

---

## `/run-wave WXX`

1. **WAVE_PLAN·WAVE_STATE 읽기** — `TASKS/WAVES.md`와 `TASKS/WAVE_STATE.md`를 실제로 Read한다. `TASKS/WAVES.md`가 없거나 `WXX` 행이 없으면 실행을 중단하고 사유를 보고한다(추측으로 Wave를 만들지 않는다). `TASKS/WAVE_STATE.md`가 없으면 `Active Wave: WXX`, `Wave Status: NOT_STARTED`로 새로 만든다.
2. **READY Task 선택** — `WXX`의 Task ID 목록을 순서대로 보면서, 아직 `DONE`이 아니고 자신의 모든 Depends On이 `DONE`인 첫 Task를 하나 고른다(Depends On 순서를 지킨다 — 순서를 건너뛰어 나중 Task를 먼저 고르지 않는다).
   - 그런 Task가 없고 목록의 모든 Task가 `DONE`이면 **7번**으로 간다.
   - 그런 Task가 없는데 아직 `DONE`이 아닌 Task가 남아 있다면(즉 전부 선행 Task 대기 중), 무엇을 기다리는지 보고하고 중단한다 — 억지로 순서를 어기지 않는다.
3. **`/prepare-task WXX <선택한 TASK_ID>` 규칙으로 검사** — 결과가 `READY_TO_IMPLEMENT`가 아니면, 이 Wave 실행 전체를 멈추고 그 상태(`BLOCKED_INPUT`/`BLOCKED_DEPENDENCY`/`BLOCKED_DIRTY_TREE`/`BLOCKED_SCOPE`)와 사유를 그대로 보고한다. 다른 Task로 대신 진행하지 않는다.
4. **`/implement-task` 규칙으로 Task 하나 구현** — Expected Files 범위 안에서, Functional/Visual/Security AC를 따라 구현한다. Commit/Push/PR은 `/implement-task`의 정책(기본 수행 안 함, 사용자가 명시 요청한 경우에만 Task 단위 Commit)을 그대로 따른다.
5. **검증 PASS 시 Task 상태 갱신** — 관련 Lint/Typecheck/Unit Test(및 Category가 `PAGE_OWNER`/`E2E_TEST`면 Playwright Chromium Smoke)가 전부 PASS하면 `TASKS/TASK-<TASK_ID>.md`의 `**Task Status:**`를 `DONE`으로 갱신하고, `TASKS/WAVE_STATE.md`의 `Last Completed Task`를 갱신한다. **하나라도 FAIL하면 `DONE`으로 표시하지 않고** 실패 내용을 보고한 뒤 이 Wave 실행을 멈춘다(다음 Task로 넘어가지 않는다).
6. **다음 READY Task 계속 처리** — 2번으로 돌아가 같은 Wave 안의 다음 Task를 같은 방식으로 처리한다.
7. **Wave 전체 완료** — `WXX`의 모든 Task가 `DONE`이면:
   - `TASKS/WAVES.md`에서 `WXX`의 **Preview Checkpoint**가 "없음"이면 `Wave Status: COMPLETE`로 갱신하고, Wave 요약(완료 Task 수, 실행한 검증)을 보고한 뒤 종료한다.
   - Preview Checkpoint가 지정돼 있으면 **8번**으로 간다.
8. **사람 Preview Checkpoint** — `Wave Status: WAITING_FOR_PREVIEW`로 갱신하고, 확인해야 할 Preview 내용(Checkpoint 문구, 관련 Route)을 보고한 뒤 **`WAITING_FOR_PREVIEW`로 종료한다.** 사람이 Preview를 확인하기 전에는 다음 Wave로 자동 진행하지 않는다(`CLAUDE.md` 규칙 22).

---

## `/run-wave status`

읽기 전용. 아무 파일도 수정하지 않는다.

1. `TASKS/WAVES.md`와 `TASKS/WAVE_STATE.md`를 Read한다. 없으면 그 사실만 보고한다.
2. 각 Wave의 Task ID 목록을 순회하며 `TASKS/TASK-<ID>.md`의 `**Task Status:**`를 확인해 Wave별 진행률(DONE / 전체)을 표로 보고한다.
3. `TASKS/WAVE_STATE.md`의 Active Wave와 Wave Status를 그대로 보고한다.
4. Wave Status가 `WAITING_FOR_PREVIEW`면 무엇을 확인해야 다음 단계로 갈 수 있는지 안내한다.

## `/run-wave resume`

1. `TASKS/WAVE_STATE.md`를 Read한다. 파일이 없으면 "재개할 진행 상태가 없습니다"라고 보고하고, `/run-wave WXX` 또는 `/run-wave status`를 안내한 뒤 종료한다.
2. `Wave Status: IN_PROGRESS`면 — 이전 실행이 중간에 끊긴 것으로 보고, **`/run-wave <Active Wave ID>`와 동일하게** 2번 단계(READY Task 선택)부터 이어서 진행한다.
3. `Wave Status: WAITING_FOR_PREVIEW`면 — `/run-wave resume` 호출 자체를 "사람이 해당 Wave의 Preview를 확인했다"는 신호로 간주한다. `TASKS/WAVES.md`에서 Active Wave 다음 Wave ID를 찾아 `Active Wave`를 그 다음 Wave로 갱신하고 `Wave Status: NOT_STARTED`로 바꾼 뒤, **`/run-wave <다음 Wave ID>`를 그대로 실행**한다. 다음 Wave가 없으면(마지막 Wave였으면) "모든 Wave가 완료되었습니다"로 보고하고 종료한다.
4. `Wave Status: COMPLETE`(그리고 다음 Wave가 없음)면 — 더 이상 재개할 것이 없다고 보고한다.
5. `Wave Status: NOT_STARTED`면 — 아직 시작되지 않은 Wave이므로 `/run-wave <Active Wave ID>`를 그대로 실행한다.

## `/run-wave dry-run WXX`

**어떤 파일도 수정하지 않는다.** 실제 구현·검증·상태 갱신 없이 실행 계획만 보여준다.

1. `TASKS/WAVES.md`, `TASKS/WAVE_STATE.md`, 그리고 `WXX`에 속한 모든 `TASKS/TASK-<ID>.md`를 Read한다.
2. 현재 `DONE` 상태를 기준으로, 이 Wave를 실제로 실행하면 Task들이 처리될 **순서**를 Depends On 그래프로 계산해 나열한다(3번 단계처럼 실제 `/prepare-task`를 실행하지 않고, 그 판정 로직을 정적으로 적용해 "지금 기준으로 READY_TO_IMPLEMENT로 예상됨" 또는 "어떤 사유로 BLOCKED로 예상됨"을 각 Task 옆에 표시한다).
3. Wave에 Preview Checkpoint가 있는지, 있다면 무엇인지 함께 보여준다.
4. 이 출력은 예측이며 실제 실행 결과와 다를 수 있음을 명시한다(예: dry-run 이후 Working Tree가 변경되면 `BLOCKED_DIRTY_TREE` 판정이 달라질 수 있음).

---

## 금지

- **자동 Branch 생성, PR 생성, Merge를 수행하지 않는다.** 이 커맨드의 어떤 하위 단계에서도 Git 브랜치를 만들거나, PR을 열거나, 병합하지 않는다.
- `/prepare-task`가 `READY_TO_IMPLEMENT`를 내지 않은 Task를 구현하지 않는다.
- 한 번에 2개 이상의 Task를 동시에 "진행 중"으로 만들지 않는다(`CLAUDE.md` 규칙 7 — Single Agent 순차 수행).
- 검증이 실패했는데 Task 상태를 `DONE`으로 표시하지 않는다.
- Preview Checkpoint가 있는 Wave를 완료한 뒤 사람 확인 없이 다음 Wave로 자동 진행하지 않는다(`/run-wave resume`을 통해서만 다음 Wave로 넘어간다).
- `dry-run`에서는 `TASKS/WAVE_STATE.md`나 임의의 Task Status를 갱신하지 않는다.
