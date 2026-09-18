# CMP-SCR003-MATE-WRITE — 동행 구하기 탭(작성 Form 또는 로그인 안내)

- **Category:** COMPONENT
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 19
- **Task Status:** DONE

> `src/components/scr-003/MateWriteTab.tsx` 작성 완료. `user`가 `null`(비로그인) 또는 `isAdult:false`(성인 미확인)면 "로그인/가입하기"(`/account`) 안내 카드를, 아니면 작성 Form(제목/국가/지역/기간/인원/스타일/설명)을 보여준다. `detectContactInfo()`(전화번호/이메일/메신저 ID 정규식, `export`해 `UNIT-CONTACT-DETECTION`이 재사용 가능)로 제목·설명을 검사해 탐지 시 제출을 막는다. 안전수칙 동의 체크 전엔 제출 버튼이 비활성화된다. 제출 성공 시 `/mates/<postId>`로 이동.
>
> **설계 판단 및 한계**:
> 1. Client Component는 `db/mates.ts`(서버 전용, `cookies()` 사용)를 직접 호출할 수 없어 `onSubmit`을 Server Action prop으로 받는다 — `PAGE-SCR003`이 `createMatePost`를 감싼 Server Action을 만들어 전달해야 한다.
> 2. REQ-FUNC-080의 "정책 버전·동의 시각 저장"은 `mate_posts` 스키마(다른 완료된 Task 소유)에 해당 컬럼이 없어 저장 로직을 구현하지 못했다 — 체크박스로 동의만 받고 있으며, 저장이 필요하면 스키마 확장이 먼저 필요하다.
> 3. REQ-FUNC-029(닉네임/연령대/여행스타일 필수 프로필 폼)는 `CMP-SCR005-PROFILE` 소관으로 판단해 여기서는 구현하지 않았다.

---

## Context

**동행 구하기 탭(작성 Form 또는 로그인 안내)**. SCR-003 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-027`
- `REQ-FUNC-028`
- `REQ-FUNC-029`
- `REQ-FUNC-031`
- `REQ-FUNC-032`
- `REQ-FUNC-033`
- `REQ-FUNC-080`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Form·Tabs / Mate Post Card(작성 폼) / Alert·Toast(안전수칙 동의)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DB-ACCESS`
- `INFRA-AUTH`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-003/MateWriteTab.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 비로그인/성인 미확인 시 로그인 안내 카드, 인증 완료 시 제목/국가/지역/기간/인원/스타일/설명 입력+연락처 패턴 탐지 차단+안전수칙 동의 체크박스, 제출 완료 후 `/mates` 상세로 이동.

## Visual AC

- 동의 미체크 시 제출 버튼 비활성. Mobile은 섹션 아코디언.

## Security/Privacy AC

- 전화번호·이메일·메신저 ID 패턴 탐지 시 제출 차단+수정 안내. 정확한 생년월일 미저장.

## Test Cases

- TC-FUNC-027 (REQ-FUNC-027)
- TC-FUNC-028 (REQ-FUNC-028)
- TC-FUNC-029 (REQ-FUNC-029)
- TC-FUNC-031 (REQ-FUNC-031)
- TC-FUNC-032 (REQ-FUNC-032)
- TC-FUNC-033 (REQ-FUNC-033)
- TC-FUNC-080 (REQ-FUNC-080)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- UNIT-CONTACT-DETECTION
- E2E-TRAVEL-TOOLS

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
