# SHR-HEADER-FOOTER — 전역 Header/Footer

- **Category:** SHARED
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 30
- **Task Status:** DONE

> `src/components/shared/Header.tsx`, `src/components/shared/Footer.tsx` 작성 완료. Header는 Desktop 72px/Mobile 56px, 4개 핵심 내비게이션(메인/여행 준비/동행 찾기/대표 소개)+계정 진입점, Mobile은 로고+햄버거→`SHR-DRAWER-MODAL`의 Modal 시트. Footer는 Desktop 3열(서비스/회사/정책)→Mobile 1열, legal band에 저작권+비대행 고지 포함. **설계 판단**: `SCREEN_ROUTE_CONTRACT.json`에 이용약관·개인정보처리방침 등 별도 정책 Route가 없어(REQ-FUNC-080 콘텐츠는 `CMP-SCR003-MATE-WRITE`의 동의 흐름이 담당) 새 Route를 만들지 않고 정책 링크는 Modal로 본문을 보여준다(CLAUDE.md 규칙 5). 로그인 상태(`userNickname` prop)는 `INFRA-AUTH`(W04)가 아직 구현 전이라 Page Owner가 실제 세션 값을 연결하기 전까지는 Guest("로그인")로 표시된다. `npm run build` PASS.

---

## Context

**전역 Header/Footer**. 2개 이상 Screen이 공유하는 재사용 컴포넌트/유틸리티를 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-064`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** 전역(5개 Screen 공통)
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Header·Footer

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- 없음 — 다른 Task의 완료를 기다리지 않고 독립적으로 시작할 수 있다.

## Expected Files

- `src/components/shared/Header.tsx`
- `src/components/shared/Footer.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 5개 Screen에서 동일 컴포넌트 재사용, 핵심 내비게이션(메인/여행 준비/동행 찾기/대표 소개/계정)+정책 링크, Desktop 72px/Mobile 56px+햄버거.

## Visual AC

- 핵심 기능·정책 페이지에 2회 이내 이동.

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-FUNC-064 (REQ-FUNC-064)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-PUBLIC-SMOKE

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
