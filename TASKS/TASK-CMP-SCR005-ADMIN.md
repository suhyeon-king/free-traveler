# CMP-SCR005-ADMIN — 신고 상태 변경·외부 URL 설정(Admin)

- **Category:** COMPONENT
- **Priority:** P0
- **Implementation Status:** IMPLEMENT(간소화)
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 29
- **Task Status:** DONE

> `src/components/scr-005/AdminTab.tsx` 작성 완료. `isAdmin`이 false면 `null`을 반환해 탭 자체를 렌더링하지 않는다(실제 접근 제어는 RLS `reports_update_admin_only`/`app_settings` Admin-only 정책이 서버에서 이중으로 강제). 신고 큐는 상태(OPEN/REVIEWING/RESOLVED/DISMISSED) 필터 버튼(URL 쿼리 `reportStatus` 갱신, Page Owner가 서버에서 다시 읽어 `listReports(status)` 호출)+행별 상태 변경 select. 외부 URL 설정 Form은 `type="url"` input 2개로 HTTPS 형식은 브라우저가 1차로 강제하고 실제 검증은 Page Owner가 전달하는 `onSaveOutboundUrls` Server Action 내부에서 `setAppSetting`(→`validateOutboundUrl`)으로 수행한다. 콘텐츠 CMS·감사 로그 UI 없음. `npm run build`(typecheck 포함) PASS, `npm run lint` PASS, `npx prettier --write` 적용 후 `npm run format:check` PASS.

---

## Context

**신고 상태 변경·외부 URL 설정(Admin)**. SCR-005 화면 내 특정 영역을 구현하는 Component Task다. 이 Task는 화면 전체가 아니라 지정된 Expected Files 범위의 UI 조각만 책임진다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT(간소화)** — 핵심 기능은 구현하되 운영 편의 기능(예: 미디어 라이선스 승인, 세분화된 제재 워크플로, 실제 이메일 발송)은 간소화된 방식(정적 URL 필드, 상태값 변경, Toast 알림)으로 대체한다. 자세한 사유는 `docs/PROJECT_SCOPE.md`의 해당 Requirement 행을 참조한다.

## Requirement Ref

- `REQ-FUNC-041`
- `REQ-FUNC-042`
- `REQ-FUNC-077`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-005
- **Route:** —
- **Page Entry:** —

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Form·Tabs / Do Not(콘텐츠 CMS 금지)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `DB-ACCESS`
- `INFRA-AUTH`
- `INFRA-OUTBOUND-LINKS`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/components/scr-005/AdminTab.tsx`

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- 신고 큐(OPEN/REVIEWING/RESOLVED/DISMISSED 필터+상태 변경), 항공·숙소 외부 URL 설정 Form(HTTPS 허용목록만 저장). Admin이 아니면 탭 자체를 렌더링하지 않는다.

## Visual AC

- 해당 없음(비UI Task — 시각적으로 검증할 화면 요소가 없다).

## Security/Privacy AC

- 콘텐츠 CMS·감사 로그 기능은 포함하지 않는다(EXCLUDED). HTTP/`javascript:`/`data:` URL 저장 차단.

## Test Cases

- TC-FUNC-041 (REQ-FUNC-041)
- TC-FUNC-042 (REQ-FUNC-042)
- TC-FUNC-077 (REQ-FUNC-077)

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
- 콘텐츠 CRUD(CMS), 감사 로그, 미디어 업로드 승인 워크플로를 추가하지 않는다(REQ-FUNC-072/073/076 EXCLUDED).
