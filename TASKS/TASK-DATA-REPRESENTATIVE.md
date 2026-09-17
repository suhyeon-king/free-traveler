# DATA-REPRESENTATIVE — 대표 프로필 정적 데이터

- **Category:** DATA
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 43
- **Task Status:** DONE

> `src/data/representative.ts` 작성 완료. 대표명·통계(50+ Trips/30+ Countries)·철학·타임라인(7개)·방문국가(32개국)·갤러리(8개)·추천 여행지(6개, `destinations.ts` 참조해 자동 제외 처리)·문의 링크(환경변수 기반, 빈 값 자동 제외)를 모두 포함한다. 갤러리 이미지 파일과 문의용 환경변수(`REPRESENTATIVE_CONTACT_EMAIL` 등) 실제 값은 이 Task 범위 밖이며, 값이 없으면 정의된 대로 화면에서 제외되는 것이 정상 동작이다.

---

## Context

**대표 프로필 정적 데이터**. 정적 데이터(`src/data`)를 정의·작성하는 Task다. 별도 관리자 CRUD 화면 없이 코드로 직접 관리한다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-057`
- `REQ-FUNC-058`
- `REQ-FUNC-059`
- `REQ-FUNC-060`
- `REQ-FUNC-061`
- `REQ-FUNC-062`
- `REQ-FUNC-063`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** —
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- 없음 — 다른 Task의 완료를 기다리지 않고 독립적으로 시작할 수 있다.

## Expected Files

- `src/data/representative.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 대표명·`50+ Trips`·`30+ Countries`·철학·타임라인(6+)·방문국가(30+)·갤러리(8+)·추천 여행지(4+) 단일 데이터 소스.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 해당 없음(이 Task 범위에서 추가되는 개인정보·보안 표면이 없다). 전역 보안 기준은 `INFRA-SECURITY-BASELINE`, `DB-RLS-BASE`를 따른다.

## Test Cases

- TC-FUNC-057 (REQ-FUNC-057)
- TC-FUNC-058 (REQ-FUNC-058)
- TC-FUNC-059 (REQ-FUNC-059)
- TC-FUNC-060 (REQ-FUNC-060)
- TC-FUNC-061 (REQ-FUNC-061)
- TC-FUNC-062 (REQ-FUNC-062)
- TC-FUNC-063 (REQ-FUNC-063)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- 콘텐츠 검수 체크리스트
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
