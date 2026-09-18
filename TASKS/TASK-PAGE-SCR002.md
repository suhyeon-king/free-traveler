# PAGE-SCR002 — 대표 소개 페이지 조립

- **Category:** PAGE_OWNER
- **Priority:** P0
- **Implementation Status:** IMPLEMENT
- **Task List 출처:** `TASKS/00_TASK_LIST.md` Seq 2
- **Task Status:** DONE

> `src/app/about/page.tsx` 조립 완료. Header → HeroStats → Intro → Timeline → CountryChips → Gallery → MemorableCta → Footer 순서로 조립했다. `getScreenMetadata("/about")`로 메타데이터 적용. 모든 하위 Component가 Server Component라 SCR-001에서 겪었던 RSC 콜백 직렬화 문제는 없었다. `npm run build` PASS(`/about` 정적 라우트), `npm run dev` 실행 후 HTTP 200 + 모든 Section 텍스트("50+ Trips"/"30+ Countries"/"여행 Timeline"/"방문 국가"/"여행 Gallery"/"기억에 남는 여행지"/"여행 준비 시작하기"/"동행 찾아보기") 실제 렌더링 확인.

---

## Context

**대표 소개 페이지 조립**. 승인된 디자인 Screen SCR-002을 실제 Next.js Route Page로 조립하는 Page Owner Task다.

## Project Scope

`docs/PROJECT_SCOPE.md` 기준 **IMPLEMENT** — 이 Task가 다루는 Requirement는 간소화 없이 정식 구현 대상이다.

## Requirement Ref

- `REQ-FUNC-064`
- `REQ-FUNC-065`
- `REQ-FUNC-078`
- `REQ-FUNC-079`

정본: `docs/06_SRS_UIUX_REVISED.md`(구조), `docs/02_SRS_BASELINE.md`(요구사항 원문), `docs/UIUX_TRACEABILITY.md`(Screen/Route 매핑).

## Screen / Route / Page Entry

- **Screen:** SCR-002
- **Route:** `/about`
- **Page Entry:** `src/app/about/page.tsx`

정본: `design-reference/SCREEN_ROUTE_CONTRACT.json` (`schema_version: traveler-screen-route-v1`).

## Design Ref

`design-reference/D-001/DESIGN.md` — Header·Footer / Desktop·Mobile 규칙 / Section별 제목·설명·본문·CTA 계층 / 화면별 Section 순서와 최소 콘텐츠 수(Timeline·Gallery·방문 국가)

화면 단위 Section 순서·Component·상태·이동은 `design-reference/UI_CONTRACT.md`를 함께 따른다.

## Depends On

- `CMP-SCR002-HERO-STATS`
- `CMP-SCR002-INTRO`
- `CMP-SCR002-TIMELINE`
- `CMP-SCR002-COUNTRY-CHIPS`
- `CMP-SCR002-GALLERY`
- `CMP-SCR002-MEMORABLE-CTA`
- `DATA-REPRESENTATIVE`
- `SHR-HEADER-FOOTER`
- `SHR-SEO-METADATA`

이 Task를 시작하기 전 위 Task들이 정의하는 인터페이스(컴포넌트 props, 데이터 스키마, 함수 시그니처)가 확정되어 있어야 한다.

## Expected Files

- `src/app/about/page.tsx`(신규)

**이 Task는 위에 나열된 파일만 신규 생성하거나 수정한다. 목록 밖의 파일은 수정하지 않는다.**

## Functional AC

- Section 순서를 Profile Hero → 여행 지표 → 소개·철학 → Timeline → 방문 국가 → Gallery → 기억에 남는 여행지+CTA 순으로 재현한다.
- 전 Section 데이터 출처는 DATA-REPRESENTATIVE 단일 소스(`50+ Trips`/`30+ Countries` 수치 포함)이며 전역에서 값이 일관된다.
- `design-reference/UI_CONTRACT.md` SCR-002 상태 정의를 그대로 구현한다: Success(정적 콘텐츠, 시드 데이터로 상시 충족) · Loading(Gallery/Timeline 이미지 지연 로드 시 스켈레톤) · Error(이미지 로드 실패 시 대체 placeholder+alt 유지, 해당 Section 자체는 제거하지 않고 유지).

## Visual AC

- 최소 콘텐츠 수: Timeline 6개 이상, 방문 국가 30개국 이상(권역별), Gallery 8장 이상, 기억에 남는 여행지 4개.
- Desktop: Timeline 좌우 교차, Mobile: Timeline 좌측 고정 1열 + Gallery 2열.
- Lorem ipsum·"준비 중"·내용 없는 Card 금지. 모든 사진에 장소를 설명하는 alt 텍스트.

## Security/Privacy AC

- 이미지 출처·라이선스 메타데이터는 간소화(URL+alt만) 정책을 따른다.

## Test Cases

- TC-FUNC-064 (REQ-FUNC-064)
- TC-FUNC-065 (REQ-FUNC-065)
- TC-FUNC-078 (REQ-FUNC-078)
- TC-FUNC-079 (REQ-FUNC-079)

TC ID는 `docs/02_SRS_BASELINE.md` §5 Traceability Matrix의 번호 대응 규칙(`REQ-FUNC-NNN` ↔ `TC-FUNC-NNN`, `REQ-NF-NNN` ↔ `TC-NF-NNN`)을 따른다. 테스트 코드 자체는 이 Task의 범위가 아니면 연결된 UNIT_TEST/INTEGRATION_TEST/E2E_TEST Task에서 작성한다.

## Verify

- E2E-PUBLIC-SMOKE
- RELEASE-CHECK-LIGHTHOUSE

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
