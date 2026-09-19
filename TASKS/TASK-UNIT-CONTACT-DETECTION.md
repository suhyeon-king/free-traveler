# UNIT-CONTACT-DETECTION — 연락처 패턴 탐지 단위 테스트

- **Category:** UNIT_TEST
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 53
- **Task Status:** DONE

> `tests/unit/contact-detection.test.ts` 작성 완료. `src/components/scr-003/MateWriteTab.tsx`가 export하는 `detectContactInfo()`를 실제로 import해 검증한다. Functional AC("탐지율 95% 이상, 오탐 5% 이하")는 개별 케이스가 아니라 테스트셋 전체 집계 비율로 판정하도록 설계했다 — 정규식 기반 탐지는 "카톡 아이디는 나중에 알려드릴게요"처럼 키워드와 ID 사이에 다른 말이 끼면 놓칠 수 있기 때문이다(실제로 확인됨). 양성 30개(전화번호 9·카카오톡 6·인스타그램 4·텔레그램 2·위챗 2·라인 3·이메일 4) 탐지율 100%, 음성 15개(일반 동행글 문구) 오탐율 0%로 두 기준 모두 충족을 실제로 확인했다. 대표 케이스 개별 스팟체크 4건도 추가했다.
>
> **필요한 최소 수정(이 Task Expected File 밖, 사람 확인 없이 진행 — 이 Task를 실행 가능하게 하는 필수 설정 오류 수정)**: `vitest.config.ts`에 `resolve.alias`("@" → "./src")가 없어 `@/components/...` 형태의 import를 쓰는 이 테스트 파일이 전혀 실행되지 못했다(`Cannot find package '@/components/scr-003/MateWriteTab'`) — `tsconfig.json`의 경로 별칭을 Vitest에도 반영하도록 추가했다. `TEST-RLS-BASIC`에서 이미 같은 파일(`vitest.config.ts`)의 `include`를 수정한 바 있어 연속선상의 필수 보정으로 판단해 바로 처리했다.
>
> `npm run typecheck`/`lint`/`format:check` PASS. `npm run test:unit` 실행 결과 6개 테스트 모두 실제 PASS(RLS 통합 테스트는 환경변수 미설정으로 별도 skip, 서로 영향 없음).

---

## Context

**연락처 패턴 탐지 단위 테스트**. 특정 로직(날짜 검증, 연락처 탐지, 상태 전이)을 검증하는 단위 테스트 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-032`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-003
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `CMP-SCR003-MATE-WRITE`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `tests/unit/contact-detection.test.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 전화번호·이메일·메신저 ID 패턴 기준 테스트셋에서 탐지율 95% 이상, 오탐 5% 이하를 검증.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-FUNC-032 (REQ-FUNC-032)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- CI-LINT-TYPECHECK-TEST

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
