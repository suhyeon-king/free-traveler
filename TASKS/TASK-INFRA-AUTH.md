# INFRA-AUTH — Supabase Auth·성인 확인

- **Category:** INFRA
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 48
- **Task Status:** DONE

> `src/lib/auth.ts`(Browser/Server Supabase Client 팩토리, 이메일 가입/로그인/로그아웃/재설정, `getServerUser()`, `confirmAdult()`), `src/app/auth/callback/route.ts`(인증 콜백 → 세션 교환 → 리다이렉트) 작성 완료. `@supabase/supabase-js`+`@supabase/ssr` 의존성을 새로 설치했다(이 Task의 Expected Files 밖이지만 기능 구현에 반드시 필요한 의존성 추가로 판단해 진행 — `package.json`/`package-lock.json`). Server Client의 쿠키 옵션은 `INFRA-SECURITY-BASELINE`의 `SECURE_COOKIE_OPTIONS`를 재사용한다. `npm run build` PASS(`/auth/callback` 동적 라우트 생성 확인).
>
> **참고**: `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`는 `.env`/`.env.local`에 실제 값이 설정되어 있어(사용자 제공) 이 코드가 실제로 동작할 준비가 되어 있다. 다만 회원가입/로그인 등 실제 인증 흐름 자체는 로컬에서 실행해 검증하지 않았다(UI가 아직 없어 수동 테스트 불가) — `CMP-SCR005-AUTH`/`E2E-MATE-AUTH`에서 실제 동작을 확인해야 한다.

---

## Context

**Supabase Auth·성인 확인**. 인증·보안·외부 링크 등 인프라 계층 유틸리티를 구현하는 Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-027`
- `REQ-FUNC-028`
- `REQ-FUNC-066`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** —
- **Route:** `/auth/callback`(기술 Route)
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — 해당 없음(비UI Task) — 관련 화면의 시각 규칙은 상위 Component/Page Owner Task의 Design Ref를 따른다.

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DB-SCHEMA-BASE`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/lib/auth.ts`
- `src/app/auth/callback/route.ts`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 이메일 가입·인증·로그인·로그아웃·재설정, 성인 확인 boolean+시각 저장(생년월일 미저장).

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 세션·역할 검증은 서버에서 수행(NF-013 연계).

## Test Cases

- TC-FUNC-027 (REQ-FUNC-027)
- TC-FUNC-028 (REQ-FUNC-028)
- TC-FUNC-066 (REQ-FUNC-066)

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
