# RELEASE-CHECK-LIGHTHOUSE — 배포 전 Lighthouse 수동 확인

- **Category:** RELEASE_CHECK
- **Priority:** P1
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 60
- **Task Status:** DONE

> `docs/checklists/LIGHTHOUSE_CHECK.md` 작성 완료. 실제 Chrome DevTools Lighthouse 측정값은 Claude Code가 대신 만들어낼 수 없어(설계상 자동화 불가 Task) 목표치(LCP≤2.5s/INP≤200ms/CLS≤0.1)와 측정 방법(반드시 `npm run build && npm run start` 프로덕션 빌드 또는 실제 Vercel URL로 측정, 개발 서버는 왜곡됨)만 정리했다.
>
> **사람이 실제 브라우저로 5개 Screen을 Lighthouse로 측정하고 최종 판정 체크박스를 완료했다.** 다만 체크리스트의 LCP/INP/CLS 수치 기록 표 자체는 값이 비어 있다 — 사람이 "측정은 했고 표에 값 기록만 생략했다"고 확인해, 그 확인을 근거로 이 Task를 DONE으로 처리한다(실제 수치 기록이 필요해지면 `docs/checklists/LIGHTHOUSE_CHECK.md`를 다시 채우면 된다).

---

## Context

**배포 전 Lighthouse 수동 확인**. 배포 직전에 사람이 실제 브라우저에서 확인하는 릴리스 게이트 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-NF-001`
- `REQ-NF-002`
- `REQ-NF-003`

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

- `docs/checklists/LIGHTHOUSE_CHECK.md`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 실제 브라우저에서 5개 Screen의 LCP/INP/CLS를 Lighthouse로 측정하고 목표(LCP≤2.5s 등)와 비교 기록(자동 CI 게이트는 제외 범위).

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-NF-001 (REQ-NF-001)
- TC-NF-002 (REQ-NF-002)
- TC-NF-003 (REQ-NF-003)

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
