# PAGE-SCR005 — 계정·관리 페이지 조립

- **Category:** PAGE_OWNER
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 5
- **Task Status:** DONE

> `src/app/account/page.tsx` 조립 완료. Guest=AuthTab만, Member=Profile+MyActivity+Auth(로그아웃), Admin=+AdminTab을 좌측 세로 탭(Desktop)/상단 가로 스크롤 탭(Mobile)으로 구성했다(PAGE-SCR003과 동일한 CSS 라디오+형제 선택자 탭 전환, Page Owner는 새 Client Wrapper를 만들 수 없음— 규칙 9). 프로필 저장/성인 확인/글 마감·삭제/참가 승인·거절/차단 해제/신고 상태 변경/외부 URL 설정은 각각 인라인 Server Action으로 연결했다. 신고 상태 필터는 `?reportStatus=` 쿼리로 서버에서 다시 읽는다.
>
> **실제 build 오류 발견 및 해결(사람 확인 완료)**: `AuthTab.tsx`(Client)가 `src/lib/auth.ts`를 import했는데 그 파일에 `next/headers`를 쓰는 서버 전용 코드가 섞여 있어 Client 번들 포함 시 `next build`가 실제로 실패했다. 사람에게 확인한 뒤 "새 Client 전용 파일 추가(권장)"를 선택해, `src/lib/auth-client.ts`(신규, Expected Files 밖)를 만들어 Client-safe 함수(`createBrowserSupabaseClient`/`signInWithEmail`/`signUpWithEmail`/`signOut`/`requestPasswordReset`)만 옮기고 `AuthTab.tsx`의 import만 그쪽으로 바꿨다(INFRA-AUTH의 `src/lib/auth.ts`는 건드리지 않음).
>
> `npm run build`(typecheck 포함) PASS(`/account` 동적 라우트), `npm run lint` PASS, `npx prettier --write` 적용 후 `npm run format:check` PASS. `npm run dev` 실행 후 `/account` HTTP 200 + Guest 모드 텍스트("계정"/"로그인"/"이메일"/"비밀번호"/"생년월일") 확인. Member/Admin 화면은 실제 로그인 세션과 `app_metadata.role`이 필요해 이번 자동 검증에서는 확인하지 못함 — Browser Checkpoint에서 사람이 실제 로그인 후 확인 필요.
>
> **알려진 제한사항(공개)**: (1) 프로필 저장 시 profiles 행이 없으면 upsert로 새로 만들지만, 회원가입 시 profiles 행을 자동 생성하는 트리거가 없어(스키마 Task 범위 밖) 첫 로그인 시 프로필 탭이 빈 값으로 시작한다. (2) 관리자 탭에서 신고 상태 필터를 바꾸면 페이지가 새로고침되며 CSS 탭 선택이 기본값으로 리셋되는데, `reportStatus` 쿼리 파라미터가 있으면 관리자 탭을 기본 선택으로 되돌리는 것으로 완화했으나 완전한 해결은 아니다.

---

## Context

**계정·관리 페이지 조립**. 승인된 디자인 Screen SCR-005을 실제 Next.js Route Page로 조립하는 Page Owner Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-064`
- `REQ-FUNC-065`
- `REQ-FUNC-078`
- `REQ-FUNC-079`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-005
- **Route:** `/account`
- **Page Entry:** `src/app/account/page.tsx`

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Header·Footer / Form·Tabs / Loading·Empty·Error 상태 / Do Not(후기 기능 금지, Admin 탭 생략 금지)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `CMP-SCR005-AUTH`
- `CMP-SCR005-PROFILE`
- `CMP-SCR005-MY-ACTIVITY`
- `CMP-SCR005-ADMIN`
- `DB-ACCESS`
- `INFRA-AUTH`
- `SHR-HEADER-FOOTER`
- `SHR-EMPTY-STATE`
- `SHR-TOAST-NOTIFY`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/app/account/page.tsx`(신규)

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 현재 역할(Guest/Member/Admin)에 맞는 Intro → 핵심 작업 → 도움말/다음 행동 구성만 렌더링하고, 역할에 없는 관리 영역은 렌더링하지 않는다.
- Guest=CMP-SCR005-AUTH, Member=CMP-SCR005-PROFILE+MY-ACTIVITY, Admin=CMP-SCR005-ADMIN(신고 상태 변경+외부 URL 설정, 어떤 빌드에서도 생략 금지).
- 내 글 클릭 시 SCR-004 상세로, 새 글쓰기 CTA는 SCR-003 동행 탭으로 이동한다.
- `design-reference/UI_CONTRACT.md` SCR-005 상태 정의를 그대로 구현한다: Loading(탭 전환 시 목록/프로필 스켈레톤) · Success · Empty(내 글/참가 요청/차단 목록/신고 목록 각각 완성형 Empty State) · Error(로그인 실패, 프로필 저장 실패, 외부 URL HTTPS 형식 오류를 필드/카드 단위 인라인 오류로 표시) · Unauthorized(비로그인 시 Guest 탭만 노출, 권한 없는 사용자가 Admin 탭에 직접 접근 시 안내+기본 탭으로 이동).

## Visual AC

- Desktop: 좌측 세로 탭(240px)+우측 콘텐츠(최대 960px). Mobile: 상단 가로 스크롤 탭.
- Lorem ipsum·"준비 중"·내용 없는 Card 금지. 내 글/참가 요청/차단 목록/신고 목록이 비어 있어도 사유+이용 방법+CTA가 있는 완성형 Empty State.

## Security/Privacy AC

- 생년월일 미저장, 성인 확인 boolean+시각만 저장. Admin 탭은 신고 상태와 외부 URL만 다루고 콘텐츠 CMS는 포함하지 않는다(REQ-FUNC-072 EXCLUDED). RLS로 타인 비공개 데이터 접근 차단.

## Test Cases

- TC-FUNC-064 (REQ-FUNC-064)
- TC-FUNC-065 (REQ-FUNC-065)
- TC-FUNC-078 (REQ-FUNC-078)
- TC-FUNC-079 (REQ-FUNC-079)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-MATE-AUTH
- MANUAL-A11Y-KEYBOARD

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
- 이 Task에서 하위 Component/Data/DB/Infra Task의 구현을 직접 새로 만들지 않는다 — 이미 존재하거나 별도 Task로 계획된 것만 조립·배선한다(규칙 6).
- 여러 Page Entry를 동시에 소유하지 않는다 — 이 Task는 정확히 1개의 page_entry만 조립한다(규칙 16).
