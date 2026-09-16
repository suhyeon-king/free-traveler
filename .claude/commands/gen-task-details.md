---
description: TASKS/00_TASK_LIST.md의 각 Task마다 상세 파일(TASKS/TASK-<ID>.md)을 생성/갱신하고 감사를 실행한다
---

`traveler-project-pipeline` Skill을 로드하고 그 규칙을 그대로 따른다. `TASKS/00_TASK_LIST.md`가 없으면 먼저 `/gen-tasklist`를 실행하라고 안내하고 중단한다. **애플리케이션 구현 코드(`src/`, `supabase/` 등)는 이 커맨드에서 작성하지 않는다** — Task Detail은 앞으로 할 구현을 계획하는 문서이지, 구현 그 자체가 아니다.

## 절차

1. `TASKS/00_TASK_LIST.md`를 실제로 Read해서 모든 Task 행을 Seq 순서로 추출한다. 중복 Task ID, 빈 필수 열(Task ID·제목·Category·Implementation Status·Requirement Ref·Expected Files·Functional AC·Verify·Priority), 존재하지 않는 Task ID를 가리키는 Depends On이 있으면 먼저 사용자에게 보고하고 해당 행 생성을 중단한다(추측으로 채우지 않는다).
2. 각 Task ID에 대해 `TASKS/TASK-<TASK-ID>.md` 파일을 하나씩 생성 또는 갱신한다(Task List와 1:1). **이미 같은 ID의 상세 파일이 존재하면 내용이 최신 Task List 행과 일치하는지만 확인하고, 중복 파일을 새로 만들지 않는다.**
3. Task Detail 파일은 아래 14개 절을 이 순서로 포함한다:
   - **Context** — 이 Task가 왜 필요한지, Category와 한 줄 설명.
   - **Project Scope** — `docs/PROJECT_SCOPE.md` 기준 Implementation Status(IMPLEMENT / IMPLEMENT(간소화))와 그 의미.
   - **Requirement Ref** — 연결된 REQ-FUNC/REQ-NF ID 목록.
   - **Screen / Route / Page Entry** — 해당 시 `SCREEN_ROUTE_CONTRACT.json` 값 그대로, 비UI Task는 "해당 없음".
   - **Design Ref** — `design-reference/D-001/DESIGN.md`의 관련 절, 비UI Task는 "해당 없음(비UI Task)".
   - **Depends On** — 선행 Task ID 목록과 그 인터페이스가 확정되어 있어야 한다는 문구.
   - **Expected Files** — Task List의 Expected Files를 그대로 옮기고, **"이 Task는 위에 나열된 파일만 신규 생성하거나 수정하며 목록 밖의 파일은 수정하지 않는다"**를 명시한다.
   - **Functional AC** — Task List Functional AC를 체크리스트로.
   - **Visual AC** — Task List Visual AC를 체크리스트로(없으면 "해당 없음(비UI Task)").
   - **Security/Privacy AC** — Task List Security/Privacy AC를 체크리스트로(없으면 해당 없음 사유 기재).
   - **Test Cases** — 연결된 REQ ID를 `TC-FUNC-NNN`/`TC-NF-NNN`으로 대응.
   - **Verify** — Task List Verify 열.
   - **Definition of Done** — AC 충족, Expected Files 준수, Test Cases 통과, Verify 교차 확인, Forbidden 미위반, PROJECT_SCOPE 상태와 모순 없음.
   - **Forbidden** — 공통 금지(Airbnb 상표, 예약/결제 UI, 별점/후기/매너온도, 조작된 실시간 통계, 내부 가격 비교 문구, Placeholder 문구, Expected Files 밖 수정) + Category별 추가 금지(PAGE_OWNER는 하위 Component 직접 구현 금지·복수 Page Entry 소유 금지, DB는 6개 테이블 초과 금지, E2E_TEST는 Chromium 외 브라우저 확대 금지 등).
4. `PAGE_OWNER` Task는 Functional AC에 Skill 7장·5장의 필수 항목(Section 순서 재현, 최소 콘텐츠 수, Placeholder 금지, 완성형 Empty State, `PAGE-SCR001` Starter 제거, `PAGE-SCR003` 3탭 조립, `PAGE-SCR005` 역할별 상태 조립)이 실제로 들어있는지 다시 확인한다. 빠져 있으면 Task List 원문(`TASKS/00_TASK_LIST.md`)과 상세 파일 양쪽에 추가한다.
5. 모든 Task Detail 생성/갱신이 끝나면 **반드시** `python scripts/audit_tasks.py`를 실행한다.
6. **Task Audit 실패를 무시하지 않는다.** `AUDIT_FAIL` 또는 exit code 1이면:
   - 실패한 검사 번호(1~18)와 사유를 빠짐없이 사용자에게 보고한다.
   - 이 커맨드 실행 안에서 감사를 통과시키려고 내용을 얼버무리거나 검사 결과를 재해석하지 않는다.
   - 원인이 Task List 설계 문제면 `/gen-tasklist`를, Task Detail 내용 문제면 이 커맨드를 다시 실행해 고친 뒤 재감사하라고 안내한다.
   - 감사가 통과하기 전까지는 "Task Detail 생성 완료"로 보고하지 않는다.
7. `TASKS/`에 `TASKS/00_TASK_LIST.md`에 없는 `TASK-*.md` 파일이 있으면 목록만 보고하고 임의로 삭제하지 않는다.

## 금지

- 애플리케이션 구현 코드를 작성하지 않는다.
- 감사를 통과시키기 위해 Task Detail 내용과 실제 계획이 다르게 허위로 작성하지 않는다.
- 아직 코드가 없는데 Acceptance Criteria나 Definition of Done을 "충족됨"으로 표시하지 않는다.
- Task Audit(`scripts/audit_tasks.py`)의 FAIL 결과를 무시하거나 PASS로 보고하지 않는다.
