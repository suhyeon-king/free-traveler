---
description: Wave 단위로 Task를 순차 구현하는 표준 개발 명령. `/run-wave <WAVE_ID>`, `/run-wave <WAVE_ID> --status`, `/run-wave <WAVE_ID> --dry-run`, `/run-wave <WAVE_ID> --resume`를 지원한다. 자동 Branch·PR·Merge는 포함하지 않는다.
---

`traveler-project-pipeline` Skill을 로드하고, `/prepare-task`와 `/implement-task`의 규칙을 그대로 따른다(이 커맨드는 두 커맨드를 순서대로 호출하는 오케스트레이션이며, 두 커맨드가 정의한 검사·구현 규칙을 대체하지 않는다). `CLAUDE.md`의 "필수 규칙"(특히 6·7·8·9·10·11·12·17·20·21·22·23번)을 함께 따른다.

## 입력

- **WAVE_ID**(필수) — 예: `W05`. `TASKS/WAVE_PLAN.md`에 실제로 존재하는 Wave ID만 유효하다.
- **옵션**(0개 또는 1개만 지정 — 2개 이상 동시 지정 시 어떤 것을 원하는지 먼저 사람에게 확인한다):
  - `--status`: 현재 Wave와 Task 상태만 보여준다. 읽기 전용.
  - `--dry-run`: 실행할 Task·파일·검증·Checkpoint만 보여준다. 읽기 전용, 아무것도 수정하지 않는다.
  - `--resume`: 첫 `pending` 또는 `blocked` Task부터 다시 시작한다.
  - (옵션 없음, 기본 동작): `pending` Task를 Depends On 순서대로 한 개씩 `/prepare-task` → `/implement-task`.

## 사용하는 상태 파일

| 파일 | 소유자 | 역할 |
|---|---|---|
| **WAVE_PLAN** = `TASKS/WAVE_PLAN.md` | `scripts/build_waves.py`(이 커맨드는 읽기만 한다) | Wave ID별 Task ID 목록(Depends On 순서)과 Preview/Browser Checkpoint 문구. Task 그래프가 바뀌면 `build_waves.py`를 다시 실행해 갱신한다 — 이 커맨드가 직접 고치지 않는다. |
| **WAVE_STATE** = `TASKS/WAVE_STATE.json` | `scripts/build_waves.py`가 최초 생성(전부 `status: pending`), 이후 **이 커맨드가 소유·갱신** | Wave별 진행 상태. |
| Task Status | 각 `TASKS/TASK-<ID>.md` 상단 `**Task Status:**` 필드 | Task 하나가 끝나면(`/implement-task` 완료 + 검증 PASS) 이 커맨드가 `DONE`으로 갱신. 없으면 `pending`으로 간주한다. |

`TASKS/WAVE_STATE.json`의 Wave별 항목 스키마(`scripts/build_waves.py`가 만드는 기본 필드에 `last_completed_task`·`note`를 더하고, `status`에 `in_progress`·`awaiting_browser_checkpoint`를 추가한 것 — 이 확장은 이 커맨드가 소유하는 부분이라 `build_waves.py`를 다시 실행해도 해당 스크립트가 아는 기본 필드만 덮어쓰고 나머지는 유지된다는 전제 하에 사용한다. 만약 재실행으로 이 필드들이 사라지면, 이 커맨드가 다시 채운다):

```json
{
  "wave_id": "W05",
  "title": "4. SCR-001 메인 Component와 Page Owner",
  "task_ids": ["CMP-SCR001-ABOUT-SUMMARY", "...", "PAGE-SCR001"],
  "status": "pending | in_progress | blocked | awaiting_browser_checkpoint | completed",
  "checkpoint_required": true,
  "checkpoint_result": null,
  "last_completed_task": null,
  "note": null
}
```

---

## 공통 선행 규칙 1 — 이전 Wave가 completed가 아니면 시작하지 않는다

옵션 없음(기본 동작)과 `--resume`에 적용한다(`--status`, `--dry-run`은 읽기 전용 보고이므로 이 규칙과 무관하게 항상 보여준다).

1. `TASKS/WAVE_PLAN.md`의 Wave 목록 순서에서 `WAVE_ID` 바로 앞 Wave를 찾는다. `WAVE_ID`가 첫 Wave면 통과.
2. 앞 Wave가 있으면 `TASKS/WAVE_STATE.json`에서 그 Wave의 `status`를 확인한다. `completed`가 아니면 **실행을 시작하지 않고** 그 Wave ID와 현재 상태를 보고한 뒤 중단한다(예: "W04가 아직 `blocked`입니다 — 먼저 `/run-wave W04 --resume`로 해결하세요").

## 기본 동작 — `/run-wave <WAVE_ID>`

1. **선행 규칙 1** 확인.
2. `TASKS/WAVE_PLAN.md`에서 `WAVE_ID` 행을 Read한다. 없으면 중단하고 사유를 보고한다(추측으로 Wave를 만들지 않는다).
3. `TASKS/WAVE_STATE.json`에서 해당 Wave 항목을 확인한다. `status`가 이미 `completed`면 "이미 완료된 Wave"라고 보고하고 다음 Wave ID를 안내한 뒤 종료한다.
4. `status`를 `in_progress`로 갱신한다(이미 `in_progress`/`blocked`면 유지).
5. **Task 순회** — `task_ids`를 순서대로 보면서 아직 `DONE`이 아닌 첫 Task를 고른다.
   - 전부 `DONE`이면 **9번**으로 간다.
6. **`/prepare-task <WAVE_ID> <TASK_ID>` 규칙으로 검사**.
   - `READY_TO_IMPLEMENT`가 아니면(`BLOCKED_INPUT`/`BLOCKED_DEPENDENCY`/`BLOCKED_DIRTY_TREE`/`BLOCKED_SCOPE`) — `status`를 `blocked`로 갱신하고 `note`에 Task ID·상태·사유를 적은 뒤 **중단**한다(규칙 2). 다른 Task로 대신 진행하지 않는다.
7. **`/implement-task` 규칙으로 Task 하나 구현** — Expected Files 범위 안에서 Functional/Visual/Security AC를 따른다. 이 Task에 지정된 최소 검증(관련 Lint/Typecheck/Unit Test, Category가 `PAGE_OWNER`/`E2E_TEST`면 Playwright Chromium Smoke까지)을 실행한다(규칙 3, `/implement-task` 4·5번과 동일 기준).
   - 검증이 하나라도 FAIL하면 `TASKS/TASK-<TASK_ID>.md`를 `DONE`으로 표시하지 않고, `status`를 `blocked`로 갱신하고 `note`에 실패 내용을 적은 뒤 **중단**한다(규칙 2 — Task 하나를 완료하지 못하면 Wave 전체를 `blocked`로 본다).
   - Commit/Push/PR은 `/implement-task`의 정책(기본 수행 안 함, 사용자가 명시 요청한 경우에만 Task 단위 Commit)을 그대로 따른다(규칙 6).
8. **PASS 시 갱신** — `TASKS/TASK-<TASK_ID>.md`의 `**Task Status:**`를 `DONE`으로 갱신하고, `TASKS/WAVE_STATE.json`의 `last_completed_task`를 갱신한다. **5번**으로 돌아가 다음 Task를 처리한다.
9. **Wave의 모든 Task가 DONE** — `TASKS/WAVE_PLAN.md`에서 이 Wave의 **Preview Checkpoint**를 확인한다(Category `PAGE_OWNER`가 포함된 Wave는 항상 Checkpoint가 있다 — 규칙 4).
   - "없음"이면 `status`를 `completed`로 갱신하고 **종료 보고**(아래 형식)를 출력한 뒤 끝낸다.
   - Checkpoint가 있으면 `status`를 `awaiting_browser_checkpoint`로 갱신하고, 확인해야 할 Browser Checkpoint 문구·Route를 **종료 보고**의 "남은 수동 Browser 확인"에 담아 출력한 뒤 끝낸다. **사람이 실제 Browser(로컬 실행 또는 Vercel Preview)로 확인하기 전에는 다음 Wave를 자동 실행하지 않는다**(규칙 5, `CLAUDE.md` 규칙 22).

## `/run-wave <WAVE_ID> --status`

읽기 전용. 아무 파일도 수정하지 않는다.

1. `TASKS/WAVE_PLAN.md`에서 `WAVE_ID` 행과 `TASKS/WAVE_STATE.json`의 해당 항목을 Read한다. 둘 중 하나라도 없으면 그 사실만 보고한다.
2. `task_ids`를 순회하며 각 `TASKS/TASK-<ID>.md`의 `**Task Status:**`를 확인해 `DONE`/`pending`을 표로 보고한다. `pending`인 Task 중 현재 맨 앞의 것은 `/prepare-task`를 실제로 실행해 `READY_TO_IMPLEMENT`인지 `BLOCKED_*`인지 함께 보여준다(`/prepare-task`는 읽기 전용이므로 안전하다).
3. Wave의 `status`, `checkpoint_required`, `checkpoint_result`, `last_completed_task`, `note`를 그대로 보고한다.
4. `status`가 `blocked`거나 `awaiting_browser_checkpoint`면 다음에 무엇을 해야 하는지(`--resume` 또는 사람의 Browser 확인) 안내한다.

## `/run-wave <WAVE_ID> --dry-run`

**어떤 파일도 수정하지 않는다.** 실제 구현·검증·상태 갱신 없이 실행 계획만 보여준다.

1. `TASKS/WAVE_PLAN.md`의 `WAVE_ID` 행, `TASKS/WAVE_STATE.json`의 해당 항목, 그리고 `task_ids`에 속한 모든 `TASKS/TASK-<ID>.md`를 Read한다.
2. 현재 `DONE` 상태를 기준으로 아직 `DONE`이 아닌 Task들을 순서대로 나열하고, 각 Task마다 `/prepare-task`의 판정 로직을 그대로(파일을 고치지 않고) 적용해 `READY_TO_IMPLEMENT` 예상 또는 `BLOCKED_*` 예상 사유를 표시한다. 각 Task의 **Expected Files**, 지정된 최소 검증(Lint/Typecheck/Unit/Playwright 여부) 목록도 함께 보여준다.
3. 이 Wave의 Preview/Browser Checkpoint 유무와 내용을 보여준다.
4. 이 출력은 예측이며 실제 실행 결과와 다를 수 있음을 명시한다(예: dry-run 이후 Working Tree가 바뀌면 `BLOCKED_DIRTY_TREE` 판정이 달라질 수 있음).

## `/run-wave <WAVE_ID> --resume`

1. **선행 규칙 1** 확인.
2. `TASKS/WAVE_STATE.json`에서 `WAVE_ID` 항목을 Read한다. 없으면(한 번도 시작되지 않음) 기본 동작과 동일하게 진행한다.
3. `status`가 `completed`면 "이미 완료된 Wave"라고 보고하고 다음 Wave ID를 안내한 뒤 종료한다.
4. `status`가 `awaiting_browser_checkpoint`면 — `--resume` 호출 자체를 "사람이 이 Wave의 Browser Checkpoint를 확인했다"는 신호로 간주한다. `checkpoint_result`를 `confirmed`로, `status`를 `completed`로 갱신하고, 종료 보고에 다음 Wave ID를 안내한 뒤 끝낸다. **이 커맨드는 다음 Wave를 이어서 실행하지 않는다** — 다음 Wave는 사람이 별도로 `/run-wave <다음 WAVE_ID>`를 입력해야 한다(규칙 5).
5. `status`가 `pending`/`in_progress`/`blocked`면 — `note`를 비우고 기본 동작의 **4번**(상태를 `in_progress`로)부터 그대로 이어서 진행한다. 즉 첫 `pending` 또는 `blocked` Task(= 아직 `DONE`이 아닌 첫 Task)부터 다시 시도한다.

---

## 종료 보고 형식 (기본 동작·`--resume`)

```
Wave: <WAVE_ID> (<제목>)
완료 Task: <이번 실행에서 새로 DONE으로 바뀐 Task ID 목록, 없으면 "없음">
변경 파일: <git diff --stat 기준 실제 변경 파일 목록>
통과한 검사: <Task별로 실행한 Lint/Typecheck/Unit/Playwright 결과>
남은 수동 Browser 확인: <Preview/Browser Checkpoint 문구+Route, 없으면 "없음">
다음에 입력할 명령: </run-wave <다음 WAVE_ID> 또는 /run-wave <WAVE_ID> --resume 또는 /run-wave <WAVE_ID> --status 등, 상황에 맞는 것>
```

`blocked`로 중단한 경우에도 이 형식을 그대로 쓰되 "완료 Task"에는 이번 실행에서 끝낸 것까지만 적고, "다음에 입력할 명령"에는 막힌 원인을 해결한 뒤의 `--resume`을 안내한다.

---

## 금지

- **자동 Branch 생성, PR 생성, Merge를 수행하지 않는다.** 이 커맨드의 어떤 하위 단계에서도 Git 브랜치를 만들거나, PR을 열거나, 병합하지 않는다(규칙 6).
- 사용자의 명시적 요청 없이 Commit·Push를 수행하지 않는다(`/implement-task`의 Commit 정책을 그대로 따른다, 규칙 6).
- `/prepare-task`가 `READY_TO_IMPLEMENT`를 내지 않은 Task를 구현하지 않는다.
- 한 번에 2개 이상의 Task를 동시에 "진행 중"으로 만들지 않는다(`CLAUDE.md` 규칙 7 — Single Agent 순차 수행).
- 검증이 실패했는데 Task 상태를 `DONE`으로 표시하지 않는다.
- Browser Checkpoint가 있는 Wave를 완료한 뒤 사람 확인 없이 다음 Wave로 자동 진행하지 않는다(`--resume`으로 사람이 명시적으로 확인한 뒤에만, 그리고 그 다음 Wave는 별도의 `/run-wave <다음 WAVE_ID>` 호출로만 시작한다).
- `TASKS/WAVE_PLAN.md`를 이 커맨드가 직접 수정하지 않는다(Task 그래프가 바뀌면 `python scripts/build_waves.py`를 다시 실행하도록 안내한다).
- `--status`, `--dry-run`에서는 `TASKS/WAVE_STATE.json`이나 임의의 Task Status를 갱신하지 않는다.
