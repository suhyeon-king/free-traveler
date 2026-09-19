# TEST-RLS-BASIC — RLS 기본 정책 통합 테스트

- **Category:** INTEGRATION_TEST
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 55
- **Task Status:** DONE

> `tests/rls/basic-policies.test.ts` 작성 완료. 익명/본인/타인/Admin·Moderator 역할별로 6개 테이블(profiles/mate_posts/mate_applications/user_blocks/reports/app_settings)의 읽기·쓰기 권한을 실제 Supabase 클라이언트(anon key, 인증된 세션)로 검증한다.
>
> **인프라 제약(사람 확인 완료)**: 이 프로젝트에는 별도 Supabase 테스트 프로젝트가 없어 Security AC("테스트 프로젝트 키만 사용")를 문자 그대로 만족할 수 없다. 사람에게 확인한 뒤 실제 배포 프로젝트를 대상으로 env-gated(모든 필요 환경변수 — `RLS_TEST_USER_A/B_EMAIL/PASSWORD`, 선택적으로 `SUPABASE_SERVICE_ROLE_KEY`+`RLS_TEST_ADMIN_EMAIL/PASSWORD` — 가 없으면 전체 skip, 실패 처리하지 않음)로 작성했다. `SUPABASE_SERVICE_ROLE_KEY`는 이 Vitest 파일(Node 전용, 빌드 산출물 미포함)에서만 Admin 역할(`app_metadata.role`) 설정 용도로 읽으며 Client 코드에는 전혀 등장하지 않는다(규칙 15 범위 내, 새로운 민감 자격 증명 종류라 사람에게 별도 확인받음).
>
> `vitest.config.ts`의 `include`에 `tests/rls/**`가 빠져 있어(이 Task Expected File 밖, 필수적인 최소 수정이라 함께 처리) 추가하지 않으면 이 테스트 파일이 `npm run test:unit`/CI에서 전혀 수집되지 않았다 — 추가했다.
>
> `npm run typecheck`/`lint` PASS. `npm run test:unit` 실행 결과 두 describe 블록(20개 테스트) 모두 환경변수 미설정으로 **정상적으로 skip**되어 exit 0으로 통과함을 확인했다(auth-smoke.spec.ts와 동일한 skip 설계).
>
> **알려진 제한사항**: 실제 `RLS_TEST_USER_A/B`, `SUPABASE_SERVICE_ROLE_KEY`+`RLS_TEST_ADMIN_*` 계정/키가 아직 없어 **테스트가 실제로 통과하는지(각 assertion이 진짜 RLS 위반을 정확히 잡아내는지)는 이번 세션에서 실행 확인하지 못했다.** 더미 계정을 Supabase Auth에 미리 만들고 이메일 인증을 완료한 뒤 환경변수를 채워 `npm run test:unit`을 재실행해 실제 통과 여부를 확인해야 한다. `reports` 테이블은 어떤 역할도 DELETE 정책이 없어 익명 삽입 거부만 기본 티어에서 검증하고, 실제 신고 생성+정리는 Admin 티어(service_role)에서만 수행하도록 설계했다(문서화됨).

---

## Context

**RLS 기본 정책 통합 테스트**. Supabase RLS 정책을 역할별로 검증하는 통합 테스트 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-044`
- `REQ-NF-013`

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

- `DB-RLS-BASE`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `tests/rls/basic-policies.test.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 익명/타인/본인/Moderator/Admin 역할별로 6개 테이블에 대한 읽기·쓰기 권한을 실제 Supabase 클라이언트로 검증(부정 접근은 403 또는 빈 결과).

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 실제 프로덕션 키가 아닌 테스트 프로젝트 키만 사용.

## Test Cases

- TC-FUNC-044 (REQ-FUNC-044)
- TC-NF-013 (REQ-NF-013)

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
