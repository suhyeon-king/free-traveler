---
description: WAVE_ID와 TASK_ID를 받아 해당 Task를 지금 구현해도 되는지 점검하고 READY_TO_IMPLEMENT/BLOCKED_* 상태를 출력한다. 코드를 수정하지 않는다.
---

`traveler-project-pipeline` Skill을 로드하고 그 규칙을 그대로 따른다. **이 커맨드는 어떤 파일도 수정하지 않는다** — 읽기와 판정만 한다. 문제를 발견해도 스스로 고치지 않고, 무엇이 왜 막혀 있는지만 보고한다.

## 입력

| 입력 | 설명 |
|---|---|
| `WAVE_ID` | 점검 대상 Wave(예: `W01`). 인자로 받는다. |
| `TASK_ID` | 점검 대상 Task ID(예: `PAGE-SCR003`). 인자로 받는다. |
| 선택된 상세 Task 파일 | `TASKS/TASK-<TASK_ID>.md`. 위 두 값으로부터 경로를 계산해 실제로 Read한다. |

`WAVE_ID` 또는 `TASK_ID`가 주어지지 않았거나, `TASKS/TASK-<TASK_ID>.md`가 존재하지 않으면 더 진행하지 않고 **`BLOCKED_INPUT`**을 출력한다.

## 검사 (8개, 모두 실제 파일을 읽어서 판정한다 — 추측하지 않는다)

### 1. Working Tree 상태

`git status --porcelain`을 실행한다. 출력이 비어 있지 않으면(커밋되지 않은 변경·추적되지 않은 파일이 있으면) **`BLOCKED_DIRTY_TREE`**. Task 구현은 항상 깨끗한 Working Tree에서 시작한다 — 이전 Task의 변경을 커밋하거나 정리하라고 안내한다.

### 2. Task가 현재 Wave에 포함되는지

`TASKS/WAVES.md`를 Read한다(Wave ID → Task ID 목록을 매핑하는 표. 형식 예시:

```
| Wave ID | Task IDs |
|---|---|
| W01 | DB-SCHEMA-BASE, DB-RLS-BASE, DATA-DESTINATIONS, DATA-SAFETY, DATA-REPRESENTATIVE |
```

).

- `TASKS/WAVES.md`가 없으면 **`BLOCKED_INPUT`**(Wave 계획 문서가 없어 소속 여부를 확인할 수 없음을 사유로 기록하고, 위 형식으로 만들어야 한다고 안내한다).
- 파일은 있지만 `WAVE_ID` 행이 없거나, 그 행의 Task ID 목록에 `TASK_ID`가 없으면 **`BLOCKED_INPUT`**(이 Task는 그 Wave 소속이 아님).

### 3. Depends On 완료 여부

Task 상세 파일의 **Depends On** 절에 나열된 각 선행 Task ID에 대해 `TASKS/TASK-<선행 ID>.md`를 Read하고 완료 여부를 확인한다.

- 완료 판정 기준: 파일 상단에 `**Task Status:** DONE` 표기가 있으면 완료. 이 표기가 아직 없는 파일(현재 파이프라인이 생성한 초기 상태, 본문에 "상태는 `NOT_STARTED`다"라고만 적혀 있는 경우 포함)은 **미완료**로 간주한다 — 완료 여부가 불확실하면 항상 미완료 쪽으로 판정한다(안전한 기본값).
- 선행 Task 파일 자체가 없으면 그것도 미완료로 취급한다.
- 하나라도 미완료면 **`BLOCKED_DEPENDENCY`**(어떤 선행 Task가 아직 끝나지 않았는지 목록으로 보고).

### 4. Expected Files

Task 상세 파일의 **Expected Files** 절을 파싱한다. 각 경로에 대해 실제로 Read/존재 확인을 시도한다.

- 목록이 비어 있거나 파싱할 수 없으면 **`BLOCKED_INPUT`**.
- 경로가 저장소(`traveler/app`) 밖을 가리키거나(`..` 상위 이동 등) 명백히 다른 Screen의 `page.tsx`(예: 이 Task가 `PAGE_OWNER`가 아닌데 `src/app/**/page.tsx`를 포함)면 **`BLOCKED_SCOPE`**(범위 위반).
- "이미 존재"로 표기되었거나 문맥상 기존 파일 수정으로 보이는 항목이 실제로는 없으면 **`BLOCKED_INPUT`**(전제가 되는 파일이 없음).

### 5. SRS·Scope·Design·Screen Ref

Task 상세 파일의 **Requirement Ref**, **Project Scope**, **Design Ref**, **Screen / Route / Page Entry** 절에 적힌 값을 아래 정본과 실제로 대조한다.

- `Requirement Ref`의 각 REQ ID가 `docs/PROJECT_SCOPE.md`에 실제로 존재하는지, 표기된 Implementation Status와 일치하는지.
- `Screen / Route / Page Entry`가 `design-reference/SCREEN_ROUTE_CONTRACT.json`의 값과 정확히 일치하는지(비어 있지 않은 경우).
- `Design Ref`가 `design-reference/D-001/DESIGN.md`에 실제로 존재하는 절/개념을 가리키는지(문서 전체가 아니라도 좋으나, 완전히 무관한 내용이면 안 됨).

하나라도 대조에 실패하면(정본에 없는 REQ ID, `SCREEN_ROUTE_CONTRACT.json`과 다른 Route/Page Entry 등) **`BLOCKED_INPUT`**(Task 상세 파일 자체가 최신 정본과 어긋남 — `/gen-task-details` 재실행 필요를 안내).

### 6. 필요한 환경변수 이름

Task의 Category·Expected Files·Functional/Security AC 내용을 근거로 이 Task가 필요로 하는 환경변수 이름을 추정한다(예: `INFRA-AUTH`/`DB-*`/Supabase를 다루는 Task는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; 관리자 URL 설정 관련 Task는 `FLIGHT_OUTBOUND_URL`, `HOTEL_OUTBOUND_URL`).

- 저장소 루트에 `.env.local`(없으면 `.env`)이 있는지 확인하고, 있다면 **값을 출력하지 않고 이름만** 대조해 필요한 변수가 정의돼 있는지 확인한다.
- 이 Task에 필요한 환경변수 중 하나라도 파일 자체가 없거나 이름이 정의돼 있지 않으면 **`BLOCKED_INPUT`**(실제로 필요한데 없는 환경변수 이름만 나열 — 값은 언급하지 않는다).
- 이 Task가 환경변수를 필요로 하지 않으면(예: 순수 정적 데이터·UI 전용 Task) 이 검사는 자동 통과로 기록한다.

### 7. Secret 하드코딩 위험

Task 상세 파일의 Expected Files·Functional AC·Security/Privacy AC를 검토해, 이 Task의 계획이 Client에서 실행되는 코드(Client Component, `NEXT_PUBLIC_*` 값, 브라우저로 전달되는 파일)에 서버 전용 비밀(`SUPABASE_SERVICE_ROLE_KEY` 등)을 넣도록 요구하거나 암시하는지 확인한다. 이미 존재하는 Expected Files가 있다면 그 파일도 Read해서 하드코딩된 키 형태 문자열(`sk-`, `eyJ...` 같은 JWT 패턴, 긴 영숫자 상수가 `NEXT_PUBLIC` 없이 Client 파일에 박혀 있는 경우 등)이 있는지 확인한다.

위험이 발견되면 **`BLOCKED_SCOPE`**(CLAUDE.md 규칙 15 "Service Role Key는 Client 금지" 위반 위험).

### 8. EXCLUDED 범위 침범 여부

`docs/PROJECT_SCOPE.md`에서 EXCLUDED로 분류된 요구사항·기능(전체 콘텐츠 CMS, 미디어 업로드 워크플로, 범용 감사 로그, 자동 백업/장애 알림, 외부 이메일 연동, 회원 탈퇴 자동 삭제 파이프라인, 행동 분석 이벤트, 서버 속도 제한 등)이 이 Task의 Requirement Ref·Functional AC·Expected Files 안에 구현 대상으로 들어 있는지 확인한다.

침범이 발견되면 **`BLOCKED_SCOPE`**(어떤 EXCLUDED 항목과 충돌하는지 명시).

## 출력

8개 검사를 모두 실행하고, 발견된 문제를 전부 보고한 뒤 아래 우선순위로 최종 상태를 하나만 결정한다(여러 문제가 동시에 있으면 가장 먼저 해결해야 할 것을 최종 상태로 표시하되, 나머지 문제도 함께 나열한다).

1. `BLOCKED_DIRTY_TREE` (검사 1)
2. `BLOCKED_INPUT` (검사 2, 4, 5, 6, 또는 입력 자체 누락)
3. `BLOCKED_DEPENDENCY` (검사 3)
4. `BLOCKED_SCOPE` (검사 7, 8)
5. `READY_TO_IMPLEMENT` (8개 검사 전부 통과)

최종 보고 형식:

```
STATUS: <READY_TO_IMPLEMENT|BLOCKED_INPUT|BLOCKED_DEPENDENCY|BLOCKED_DIRTY_TREE|BLOCKED_SCOPE>
WAVE_ID: <값>
TASK_ID: <값>
검사 결과:
  1. Working Tree 상태 — PASS|FAIL(사유)
  2. Wave 포함 여부 — PASS|FAIL(사유)
  3. Depends On 완료 — PASS|FAIL(미완료 Task 목록)
  4. Expected Files — PASS|FAIL(사유)
  5. SRS·Scope·Design·Screen Ref — PASS|FAIL(사유)
  6. 필요 환경변수 — PASS|FAIL(누락된 변수 이름만)
  7. Secret 하드코딩 위험 — PASS|FAIL(사유)
  8. EXCLUDED 범위 침범 — PASS|FAIL(충돌 항목)
다음 행동: <STATUS별 안내 — 예: BLOCKED_DEPENDENCY면 "먼저 <ID>를 완료하세요", BLOCKED_DIRTY_TREE면 "git status를 정리한 뒤 다시 실행하세요">
```

## 금지

- 이 커맨드 실행 중 어떤 파일도 생성·수정·삭제하지 않는다(애플리케이션 코드, Task 파일, `.env` 등 전부 포함).
- 환경변수의 실제 값을 출력하지 않는다 — 이름과 존재 여부만 보고한다.
- 검사를 건너뛰고 `READY_TO_IMPLEMENT`를 추정으로 출력하지 않는다 — 8개 검사를 실제로 전부 수행한 뒤에만 `READY_TO_IMPLEMENT`를 출력한다.
- 불확실한 경우 항상 안전한 쪽(BLOCKED_*)으로 판정한다.
