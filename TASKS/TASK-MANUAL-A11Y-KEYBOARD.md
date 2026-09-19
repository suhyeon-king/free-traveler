# MANUAL-A11Y-KEYBOARD — 키보드·스크린리더 수동 점검

- **Category:** MANUAL_CHECK
- **Priority:** P1
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 59
- **Task Status:** DONE

> `docs/checklists/A11Y_MANUAL_CHECK.md` 작성 완료. 이 Task는 설계상(Category `MANUAL_CHECK`) 자동화로 대체할 수 없는 사람의 실제 브라우저 키보드/스크린리더 점검이라, Playwright로 키보드 이벤트(Tab/화살표/Enter)만 프로그래밍으로 보내는 **자동 사전 점검**을 먼저 수행해 포커스 이동 순서·포커스 링 유무·명백한 문제까지 확인해 체크리스트 문서에 기록했다. 이후 **사람이 실제 브라우저로 "사람 확인 필요" 절의 모든 항목을 확인하고 체크리스트에 체크(`[x]`)**해 최종 판정까지 완료했다.
>
> **사람 확인 과정에서 실제 버그 1건 발견·수정**: 메인 페이지(SCR-001) 여행지 Card의 "공유" 버튼을 눌러도 아무 반응이 없다는 것을 사람이 직접 확인해 보고했다. 원인은 `DestinationGrid.tsx`/`DestinationDrawer.tsx`(둘 다 `CMP-SCR001-DESTINATIONS`의 Expected Files, 이 Task Expected File 밖이지만 사람이 직접 지시한 버그 수정)의 `handleShare`가 `shareLink()` 결과를 버려서(`void shareLink(...)`), 데스크톱 브라우저(Web Share API 미지원)에서는 클립보드에 조용히 복사만 되고 아무 시각적 피드백이 없었던 것. `handleShare`를 `async`로 바꿔 `shareLink()` 결과를 `role="status"` 인라인 메시지("링크를 클립보드에 복사했습니다." 등)로 표시하도록 수정했다. `npm run build`/`lint`/`format:check` PASS, Playwright로 공유 버튼 클릭 후 상태 메시지 노출을 실제 확인.

---

## Context

**키보드·스크린리더 수동 점검**. 자동화로 대체할 수 없어 실제 브라우저에서 사람이 직접 확인해야 하는 점검 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-NF-025`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-001~005
- **Route:** 전체
- **Page Entry:** 전체

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `PAGE-SCR001`
- `PAGE-SCR002`
- `PAGE-SCR003`
- `PAGE-SCR004`
- `PAGE-SCR005`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `docs/checklists/A11Y_MANUAL_CHECK.md`(점검 기록)

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 5개 Screen의 핵심 사용자 흐름(검색, 폼 입력, 모달 닫기, 신고 제출 등)을 키보드만으로 완료 가능한지 브라우저에서 수동 확인하고 결과를 기록한다.

## Visual AC

- 포커스 순서·가시성 육안 확인.

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-NF-025 (REQ-NF-025)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- (릴리스 전 수동 실행)

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
