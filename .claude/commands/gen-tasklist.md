---
description: Traveler 프로젝트의 Task List(TASKS/00_TASK_LIST.md)를 생성/갱신한다
---

`traveler-project-pipeline` Skill을 로드하고 그 규칙을 그대로 따른다. 이 커맨드는 **Task List만** 만든다 — 개별 Task Detail 파일(`TASKS/TASK-*.md`)은 만들지 않는다(그건 `/gen-task-details`의 역할). **애플리케이션 구현 코드(`src/`, `supabase/` 등)는 이 커맨드에서 작성하지 않는다.**

## 절차

1. **입력 검증**: `python scripts/validate_inputs.py`를 실행한다. 실패하면(exit code != 0, `VALIDATE_INPUTS_PASS`가 출력되지 않음) 여기서 멈추고 출력된 누락 파일/Screen/Requirement ID를 그대로 사용자에게 보고한다 — 추측으로 진행하지 않는다.
2. **정본을 실제로 읽는다**(추측·기억에 의존하지 않고 각 파일을 직접 Read한다):
   - `design-reference/SCREEN_ROUTE_CONTRACT.json`(Screen 정본, `schema_version: traveler-screen-route-v1`)
   - `docs/PROJECT_SCOPE.md`(REQ-FUNC 80개·REQ-NF 34개의 IMPLEMENT/IMPLEMENT(간소화)/EXCLUDED 정본과 구현 방식)
   - `docs/06_SRS_UIUX_REVISED.md`(화면·Route 구조)
   - `design-reference/UI_CONTRACT.md`(Screen별 영역 순서·주요 Component·상태·이동·금지 기능)
   - `design-reference/D-001/DESIGN.md`(컴포넌트·토큰·Do/Do Not, 최소 콘텐츠 수)
3. **실제 파일 트리 확인**: `src/app/**`을 직접 스캔해 이미 존재하는 Page Entry와 아직 없는 Page Entry를 구분한다. `validate_inputs.py`의 출력(검사 2·9 결과)을 참고하되, Task List에 쓸 Expected Files 상태는 이 시점에 직접 확인한 값을 사용한다.
4. **Task 설계**: Skill의 "3. Task 유형", "4. Task ID·의존성 규칙", "5. 정확히 5개의 Page Owner Task", "7. Page Owner AC 필수 항목", "8. 데이터·인프라 제약", "9. Requirement 커버리지"를 그대로 적용한다.
   - `PAGE_OWNER` Task 5개(Screen당 1개, `PAGE-SCR001`~`PAGE-SCR005`).
   - 각 Screen의 `COMPONENT` Task는 `design-reference/UI_CONTRACT.md`의 "주요 Component" 목록을 근거로 도출한다. SCR-003은 항공/숙소/동행 작성을 분리, SCR-004는 목록/필터/상세/참가/신고/차단을 분리, SCR-005는 Auth/Profile/My Activity/Admin을 분리한다.
   - 여러 Screen이 공유하는 컴포넌트·유틸리티(Header, Footer, Drawer/Modal, EmptyState, Toast, SEO, 이미지 최적화 등)는 `SHARED` Task로 한 번만 만든다.
   - `DATA` Task(여행지, 국가 안전정보, 대표 프로필).
   - `DB` Task 4종(`DB-SCHEMA-BASE`, `DB-RLS-BASE`, `DB-ACCESS`, `DB-SEED-BASE`) — 테이블은 `profiles`/`mate_posts`/`mate_applications`/`user_blocks`/`reports`/`app_settings` 6개로 제한.
   - `INFRA` Task(Auth·성인 확인, 외부 링크 안전 이동, 환경변수, 보안 기본기).
   - `UNIT_TEST`·`INTEGRATION_TEST` Task(날짜 검증, 연락처 탐지, 상태 전이, RLS).
   - `E2E_TEST` Task 2~3개(Playwright Chromium, 핵심 흐름 5~7개를 묶는다).
   - `MANUAL_CHECK`·`RELEASE_CHECK`·`CI_DEPLOY` Task.
   - Implementation Status가 EXCLUDED인 REQ는 개별 Task를 만들지 않고 `TASKS/00_TASK_LIST.md`의 `## 4. NON_IMPLEMENTATION` 표에 요구사항·근거·후속 방향을 기록한다.
5. **Task List 열**: Seq, Task ID, 제목, Category, Implementation Status, Requirement Ref, Screen, Route, Page Entry, Depends On, Expected Files, Functional AC, Visual AC, Security/Privacy AC, Verify, Priority.
6. **출력**: `TASKS/00_TASK_LIST.md`를 생성/갱신한다(표 + 요약 + NON_IMPLEMENTATION 표 + Requirement Traceability 검증 섹션). `TASKS` 폴더가 없으면 생성한다. 이 시점에는 `TASKS/TASK-*.md`를 만들지 않는다.
7. **요약 보고**: 생성된 Task 총수, Category별 개수, `PAGE_OWNER` 5개 확인, NON_IMPLEMENTATION 건수, 114개 REQ 커버리지(중복·누락 없음)를 사용자에게 보고한다. 개수가 45~65 범위를 벗어나도 그 자체로 실패가 아니며, 왜 그런지 한 줄로 설명한다.

## 금지

- Task 개수를 맞추기 위해 의미 없는 Task를 쪼개거나 합치지 않는다.
- `TASKS/TASK-*.md`, `TASKS/TASK_MANIFEST.csv`, `TASKS/TASK_AUDIT_REPORT.md`를 이 단계에서 만들지 않는다.
- 애플리케이션 구현 코드를 작성하지 않는다.
- Task List만으로 "구현 완료"를 선언하지 않는다.
