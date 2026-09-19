# CMP-SCR005-MY-ACTIVITY — 내 글·참가 요청·차단 목록(Member)

- **Category:** COMPONENT
- **Priority:** P0
- **Implementation Status:** IMPLEMENT(간소화)
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 28
- **Task Status:** DONE

> `src/components/scr-005/MyActivityTab.tsx` 작성 완료. 5개 Section(내가 쓴 동행글/들어온 참가 요청/내가 보낸 참가 요청/내가 접수한 신고/차단한 사용자) 각각 0건 시 완성형 Empty State(사유+이용 방법+CTA)로 대체. 글 마감/삭제, 참가 요청 승인/거절, 차단 해제는 각각 Page Owner가 전달하는 Server Action prop(`onUpdatePostStatus`/`onDeletePost`/`onUpdateApplicationStatus`/`onUnblock`)으로 실행하고 결과를 인라인 안내로 표시한다(`ToastProvider`가 아직 어떤 `layout.tsx`에도 연결되지 않아 `useToast()`를 호출하지 않음 — `CMP-SCR004-APPLY`와 동일 판단, 이메일 발송은 REQ 상 제외). 승인된 참가자가 있는 글에는 마감/삭제 전 주의 문구를 노출한다(REQ-FUNC-037 effectiveStatus 계산과 별개로 UI 경고). "후기 작성" 관련 UI는 포함하지 않음. `npm run typecheck`(`npm run build` 경유) PASS, `npm run lint` PASS, `npx prettier --write` 적용 후 `npm run format:check` PASS.

---

## Context

**내 글·참가 요청·차단 목록(Member)**. SCR-005 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT(간소화)** — 핵심 기능은 구현하되 운영 편의 기능(예: 미디어 라이선스 승인, 세분화된 제재 워크플로, 실제 이메일 발송)은 간소화된 방식(정적 URL 필드, 상태값 변경, Toast 알림)으로 대체한다. 자세한 사유는 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 참조한다.

## Requirement Ref

- `REQ-FUNC-036`
- `REQ-FUNC-037`
- `REQ-FUNC-038`
- `REQ-FUNC-039`
- `REQ-FUNC-040`
- `REQ-FUNC-043`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-005
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Loading·Empty·Error 상태 / Alert·Toast / Mate Post Card

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DB-ACCESS`
- `INFRA-AUTH`
- `SHR-EMPTY-STATE`
- `SHR-TOAST-NOTIFY`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-005/MyActivityTab.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 내 글 수정/마감/삭제, 들어온 참가 요청 승인/거절, 신고 내역 열람, 차단 목록 관리(해제), 상태 변경 인앱 Toast 알림(이메일 발송은 제외).

## Visual AC

- 각 목록 0건 시 완성형 Empty State(예: "차단한 사용자가 없어요"+이용 방법).

## Security/Privacy AC

- 본인 데이터만 RLS로 열람.

## Test Cases

- TC-FUNC-036 (REQ-FUNC-036)
- TC-FUNC-037 (REQ-FUNC-037)
- TC-FUNC-038 (REQ-FUNC-038)
- TC-FUNC-039 (REQ-FUNC-039)
- TC-FUNC-040 (REQ-FUNC-040)
- TC-FUNC-043 (REQ-FUNC-043)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-MATE-AUTH

## Definition of Done

- 위 **Functional AC**, **Visual AC**, **Security/Privacy AC** 항목을 모두 충족한다.
- **Expected Files**에 명시된 파일만 신규 생성·수정했고 그 밖의 파일은 건드리지 않았다.
- **Test Cases**에 해당하는 테스트가 작성되어 있고(해당 Task 범위인 경우) 통과한다.
- **Verify**에 연결된 Task/체크리스트 기준으로 교차 확인했다.
- **Forbidden** 항목을 위반하지 않았다.
- `docs/UIUX_TRACEABILITY.md`의 관련 Requirement 상태와 모순되지 않는다(EXCLUDED 항목을 구현 범위로 되돌리지 않았다).

## Forbidden

- Airbnb 로고·워드마크·색상 값(#ff385c 등)·폰트명·문구·컴포넌트를 그대로 가져오지 않는다.
- "예약하기", "결제", "장바구니" 등 구매·예약·결제를 암시하는 UI나 문구를 넣지 않는다.
- 별점(★), 후기, 리뷰 인용문, "매너온도" 같은 평판 점수를 넣지 않는다.
- 실제 데이터가 없는 실시간 통계(예: "실시간 N명 대기중")를 조작해서 표시하지 않는다.
- "최저가 실시간 비교", "항공권 비교"처럼 내부 가격 비교·실시간 검색 기능이 있는 것처럼 표현하지 않는다.
- Lorem ipsum, "준비 중", "정보 확인 필요" 같은 자리표시자 문구를 사용하지 않는다.
- 이 Task Detail의 **Expected Files** 목록 밖의 파일을 수정하지 않는다.
- "후기 작성" 관련 버튼이나 문구를 넣지 않는다(리뷰 기능 EXCLUDED).
