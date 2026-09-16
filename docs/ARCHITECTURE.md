# Free Traveler — Architecture

- **Document ID:** ARCH-TRAVEL-001
- **기반 문서:** `package.json`, `docs/06_SRS_UIUX_REVISED.md`, `docs/PROJECT_SCOPE.md`, `design-reference/D-001/DESIGN.md`, `design-reference/UI_CONTRACT.md`, `design-reference/SCREEN_ROUTE_CONTRACT.json`, `TASKS/TASK_MANIFEST.csv`
- **목적:** 이 문서는 Free Traveler를 "무엇으로, 어디까지" 구현하는지 확정하는 아키텍처 경계 문서다. 새 기술을 도입하거나 범위를 넓히기 전에 반드시 이 문서를 먼저 갱신한다.

---

## 1. 기술 스택 개요

| 계층 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js App Router** (`next` 16.3.4, `package.json` 확인) | Route Handler, Server Component, Server Action을 포함한 단일 풀스택 애플리케이션 |
| 언어 | **TypeScript** (`typescript` ^5, `@types/*`) | `strict` 모드, `any` 남용 금지 |
| UI 런타임 | React 19 (`react`, `react-dom`) | Server/Client Component 혼합 |
| 스타일 | Tailwind CSS 4 (`@tailwindcss/postcss`) | `design-reference/D-001/DESIGN.md` 토큰을 그대로 반영 |
| 데이터/인증 | **Supabase**(PostgreSQL + Auth) | 7장 참조, Auth와 동행 기능 범위로 한정 |
| ORM | **사용하지 않음** | 10장 참조 |
| 테스트 | **Vitest**(단위/통합) + **Playwright Chromium**(Smoke) | 12장 참조 |
| CI/CD | **GitHub Actions** + **Vercel Preview** | 13장 참조 |
| 배포 인프라 | **Vercel만 사용** | AWS·EC2 등 별도 클라우드 인프라 없음(14장) |

---

## 2. 화면 구성 — 핵심 4개 · 보조 1개

`design-reference/SCREEN_ROUTE_CONTRACT.json`(`schema_version: traveler-screen-route-v1`)을 정본으로, 승인된 디자인 Screen은 정확히 5개이며 **핵심 화면 4개 + 보조 화면 1개**로 분류한다.

| 분류 | Screen | Route | Page Entry |
|---|---|---|---|
| 핵심 | SCR-001 여행지 탐색 | `/` | `src/app/page.tsx` |
| 핵심 | SCR-003 통합 여행 준비(항공+숙소) | `/travel-tools` | `src/app/travel-tools/page.tsx` |
| 핵심 | SCR-004 동행 조회 | `/mates` | `src/app/mates/page.tsx` |
| 핵심 | (SCR-003이 항공·숙소 두 기능을 겸함 — 핵심 기능은 여행지 탐색/항공/숙소/동행 찾기 4개, 물리 화면은 SCR-001·003·004 3개) | — | — |
| 보조 | SCR-002 대표 소개 | `/about` | `src/app/about/page.tsx` |

지원(비핵심·비보조) 화면 1개가 추가로 존재한다.

| 분류 | Screen | Route | Page Entry |
|---|---|---|---|
| 지원 | SCR-005 계정·관리(로그인/프로필/내 활동/간단 관리자) | `/account` | `src/app/account/page.tsx` |

> 핵심 4개 기능(여행지 탐색·항공·숙소·동행 찾기)은 물리적으로 SCR-001·SCR-003·SCR-004 3개 화면에 배치되며 항공·숙소는 SCR-003 한 화면의 탭으로 통합된다(`docs/06_SRS_UIUX_REVISED.md` §2). 보조 화면은 SCR-002(대표 소개) 1개다. 기존 SRS Baseline의 다중 Route(`/destinations`, `/flights`, `/mates/[id]` 등)는 이 5개 Screen의 Section·탭·Drawer/Modal로 통합되며 별도 Route로 만들지 않는다.

---

## 3. Server Component / Client Component 경계

기본값은 **Server Component**다. 아래 조건 중 하나라도 해당하면 그 하위 트리만 `"use client"`로 분리한다.

| Client Component로 분리하는 경우 | 예시 |
|---|---|
| 브라우저 전용 상태(폼 입력, 탭 선택, Drawer 열림/닫힘)를 다룰 때 | 항공/숙소 입력 Form, SCR-003 탭 바, SCR-001 Drawer/Modal |
| `localStorage`/`sessionStorage`를 읽고 쓸 때 | 즐겨찾기(`SHR-FAVORITES-STORAGE`) |
| 브라우저 API(Web Share, `window`, 이벤트 리스너)를 쓸 때 | URL 공유(`SHR-SHARE-LINK`), 키보드 포커스 트랩 |
| 사용자 상호작용에 즉시 반응해야 할 때(실시간 검증, Toast) | 날짜 검증, 연락처 패턴 탐지, `SHR-TOAST-NOTIFY` |

| Server Component로 유지하는 경우 | 예시 |
|---|---|
| 정적 데이터(`src/data`) 렌더링 | 여행지 목록·상세, 국가 안전정보, 대표 소개 콘텐츠 |
| Supabase에서 읽기만 하는 목록/상세 | 동행글 목록·상세 초기 렌더 |
| SEO 메타데이터, 레이아웃, Header/Footer 뼈대 | `SHR-HEADER-FOOTER`, `SHR-SEO-METADATA` |

각 Page Entry(`src/app/**/page.tsx`)는 기본적으로 Server Component로 시작하고, 그 안에서 상호작용이 필요한 부분만 Client Component를 `import`해서 조합한다. 페이지 전체를 `"use client"`로 선언하지 않는다.

---

## 4. 항공·숙소 입력 폼 — Client Component 일시 상태 전용

SCR-003(`/travel-tools`)의 항공(`CMP-SCR003-FLIGHT-FORM`)·숙소(`CMP-SCR003-HOTEL-FORM`) 입력 폼은 다음 원칙을 절대 규칙으로 따른다.

- 국가·지역·출발일/귀국일(또는 체크인/체크아웃) 입력값은 **Client Component의 일시 상태(`useState`/`useReducer`)로만 유지**한다. 전역 상태 관리 라이브러리, `localStorage`, 쿠키에 영속화하지 않는다.
- 이 폼을 위한 **API Route, Server Action, DB 테이블을 만들지 않는다.** 검증·요약·외부 이동은 전부 클라이언트에서 처리한다(`docs/02_SRS_BASELINE.md` §6.1 부록: "항공·호텔 폼에는 서버 API를 만들지 않는다"와 동일 원칙).
- 브라우저 탭/컴포넌트가 언마운트되면(새로고침, 페이지 이탈) 입력값은 사라진다 — 이것이 의도된 동작이다.

---

## 5. 항공·숙소 입력값 비전달 원칙

항공·숙소 조건 입력값은 아래 채널 중 **어디로도 전송하지 않는다.**

| 금지 채널 | 확인 방법 |
|---|---|
| API Route / Server Action | 해당 폼에 연결된 API Route·Server Action이 존재하지 않음(4장) |
| Supabase DB(`profiles`, `mate_posts` 등 어떤 테이블도) | 6개 테이블 중 항공·숙소 조건을 저장하는 컬럼이 없음(8장) |
| 외부 이동 URL의 쿼리 파라미터 | `INFRA-OUTBOUND-LINKS`가 목적지·날짜 쿼리 없이 일반 랜딩 URL만 새 탭으로 연다 |
| 서버/분석 로그 | 클라이언트 상태 변경만 발생, 서버로 향하는 요청 자체가 없음 |

외부 이동은 `noopener,noreferrer`를 적용한 새 탭 오픈만 수행하며, 항공/숙소 각각 `FLIGHT_OUTBOUND_URL`/`HOTEL_OUTBOUND_URL` 환경변수(또는 SCR-005 Admin 탭에서 설정한 `app_settings` 값)의 HTTPS 허용목록 URL로만 이동한다.

---

## 6. 정적 데이터 (`src/data`)

여행지·국가 안전정보·대표 소개 콘텐츠는 데이터베이스 테이블이 아니라 **`src/data`의 정적 TypeScript 데이터**로 관리한다.

| 파일(예정) | 내용 | 대응 Task |
|---|---|---|
| `src/data/destinations.ts` | 국내 10개 이상, 해외 15개국 30개 도시 이상의 여행지 콘텐츠 | `DATA-DESTINATIONS` |
| `src/data/safety.ts` | 해외 15개국 국가 안전정보(8개 카테고리, 출처, 최종 확인일) | `DATA-SAFETY` |
| `src/data/representative.ts` | 대표 소개, `50+ Trips`/`30+ Countries`, 타임라인, 방문 국가, Gallery | `DATA-REPRESENTATIVE` |

콘텐츠 CRUD 관리자 화면(CMS)을 만들지 않는다 — 콘텐츠 변경은 코드 수정(PR)으로 이뤄진다. stale 경고(안전정보 7일 경과)는 DB 배치 작업이 아니라 **렌더링 시점에 `verified_at` 값을 계산**해서 표시한다.

---

## 7. Supabase — Auth와 동행 기능 중심

Supabase는 **인증(Auth)과 동행(Travel Mate) 관련 기능에만** 사용한다. 여행지·안전정보·대표 소개는 Supabase에 저장하지 않는다(6장).

- **Auth:** 이메일 가입·인증·로그인·로그아웃·비밀번호 재설정, 성인 확인 상태(`is_adult`, `adult_verified_at`만 저장, 정확한 생년월일 미저장).
- **PostgreSQL:** 동행 모집글, 참가 요청, 차단, 신고, 관리자 설정만 저장(8장 6개 테이블).
- **Storage:** 사용하지 않는다 — 이미지는 일반 인터넷 이미지 URL을 참조한다(`docs/PROJECT_SCOPE.md` 구현 방식).

---

## 8. DB — 6개 테이블

Supabase PostgreSQL 테이블은 아래 **6개로 제한**한다(`DB-SCHEMA-BASE`). 그 이상 추가하지 않는다.

| 테이블 | 역할 |
|---|---|
| `profiles` | 닉네임, 연령대, 성별(선택), 여행 스타일, 성인 확인 상태 |
| `mate_posts` | 동행 모집글(국가·지역·기간·인원·설명·모집 상태) |
| `mate_applications` | 참가 요청과 상태(PENDING/ACCEPTED/REJECTED) |
| `user_blocks` | 사용자 간 차단 관계 |
| `reports` | 신고 대상·사유·처리 상태 |
| `app_settings` | 관리자가 설정하는 항공·숙소 외부 URL(HTTPS 허용목록) |

감사 로그, 미디어 자산, 콘텐츠 CMS용 테이블은 만들지 않는다(`docs/PROJECT_SCOPE.md` EXCLUDED: REQ-FUNC-056/072/073/076).

---

## 9. Supabase Client — Browser / Server 분리

| Client 종류 | 위치(예정) | 용도 |
|---|---|---|
| **Browser Client** | `src/lib/supabase/client.ts` | Client Component에서 로그인 폼 제출, 실시간 상호작용(참가 요청 제출 등)에 사용. `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 사용 |
| **Server Client** | `src/lib/supabase/server.ts` | Server Component/Server Action에서 세션 쿠키 기반으로 데이터를 읽고 쓸 때 사용. 요청 스코프의 사용자 세션으로 동작하며 RLS를 그대로 적용받는다 |

두 Client 모두 **로그인한 사용자의 권한(anon key + 세션)으로만 동작**한다. RLS를 우회하는 `service_role` 키는 기본적으로 서버 코드에 두지 않으며, 꼭 필요한 관리자 작업(예: SCR-005 Admin 탭의 신고 상태 변경)이 있다면 해당 작업만 명시적으로 서버 전용 함수로 격리한다.

---

## 10. 간단한 RLS 원칙

`DB-RLS-BASE`가 구현하는 원칙은 다음과 같다.

1. **본인 데이터만 쓸 수 있다.** `profiles`, `mate_posts`, `mate_applications`는 `auth.uid() = user_id` 조건으로 본인 행만 INSERT/UPDATE/DELETE 가능.
2. **공개 데이터는 조건부로 읽을 수 있다.** `mate_posts`는 모집중 상태이고 차단 관계가 아닌 경우에만 SELECT 허용.
3. **비공개 데이터는 당사자만 읽는다.** `mate_applications`, `reports`는 요청자·글 작성자·Moderator/Admin만 SELECT 가능.
4. **차단 관계는 상호 비노출.** `user_blocks`에 관계가 있으면 양쪽 모두 서로의 글/프로필/요청을 조회할 수 없다.
5. **Admin 전용 쓰기는 role 기반.** `reports.status`, `app_settings`는 Admin/Moderator role을 가진 세션만 UPDATE 가능.

**Prisma·TypeORM 등 ORM은 사용하지 않는다(11장)** — 위 정책은 Supabase SQL 마이그레이션(`supabase/migrations/*.sql`)과 RLS 정책(`supabase/policies/rls.sql`)으로 직접 작성하고, 애플리케이션 코드는 `@supabase/supabase-js`(또는 `@supabase/ssr`) 클라이언트로 테이블에 직접 질의한다.

---

## 11. ORM 미사용

Prisma, Drizzle, TypeORM 등 어떤 ORM도 도입하지 않는다. 이유:

- 테이블 수가 6개로 고정되어 있어 스키마 관리 오버헤드가 크지 않다.
- Supabase RLS와 SQL 마이그레이션만으로 8~10장의 원칙을 직접·명시적으로 표현할 수 있다.
- ORM 마이그레이션 도구와 Supabase 마이그레이션 도구가 이중으로 존재하면 스키마 정본이 흔들린다.

데이터 접근은 `src/lib/db/*.ts`(예: `mates.ts`, `reports.ts`, `admin.ts`)에서 `@supabase/supabase-js` 쿼리 빌더를 직접 사용해 타입이 있는 함수로 감싼다(`DB-ACCESS`).

---

## 12. 테스트 — Vitest + Playwright Chromium Smoke

| 계층 | 도구 | 범위 |
|---|---|---|
| 단위 테스트 | **Vitest** | 날짜 검증(`UNIT-TRAVEL-DATES`), 연락처 패턴 탐지(`UNIT-CONTACT-DETECTION`), 동행 상태 전이(`UNIT-MATE-STATE`) |
| 통합 테스트 | **Vitest** + 테스트 Supabase 프로젝트 | RLS 기본 정책(`TEST-RLS-BASIC`) |
| E2E Smoke | **Playwright, Chromium 프로젝트만** | 핵심 흐름 5~7개를 3개 Task로 묶음: `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH` |

Playwright는 Chromium 하나만 구성한다 — Firefox/WebKit 다중 브라우저 매트릭스나 시각 회귀 테스트는 범위 밖이다. `package.json`에는 아직 `vitest`, `@playwright/test`가 설치되어 있지 않다(15장 착수 차단 참조).

---

## 13. CI/CD — GitHub Actions + Vercel Preview

- **GitHub Actions**(`.github/workflows/ci.yml`, `CI-LINT-TYPECHECK-TEST`): `next lint`, `tsc --noEmit`, Vitest 단위/통합 테스트를 main 병합 전 게이트로 실행한다.
- **Vercel Preview**: PR마다 Vercel이 자동으로 생성하는 Preview 배포를 사용해 리뷰한다(`DEPLOY-VERCEL-SETUP`). 별도의 자체 스테이징 서버를 구축하지 않는다.
- 프로덕션 배포는 `main` 브랜치 병합 후 Vercel이 트리거한다.

---

## 14. AWS·EC2 미사용

컴퓨팅·호스팅 인프라는 **Vercel만** 사용한다. AWS EC2, ECS, Lambda 등 어떤 형태의 AWS 리소스도 프로비저닝하지 않는다. 데이터베이스·인증은 Supabase(관리형)를 사용하므로 별도 서버 운영이 필요 없다. (`docs/PROJECT_SCOPE.md` 제외 기능: "EC2·AWS 인프라")

---

## 15. 자동 Merge 미사용

PR 병합은 **사람이 직접 검토하고 수행**한다. GitHub Actions는 검사(lint/typecheck/test) 결과만 보고하며, 검사를 통과했다고 자동으로 병합하는 워크플로(Auto-merge, Merge Queue 자동화 등)는 구성하지 않는다. (`docs/PROJECT_SCOPE.md` 제외 기능: "무인 자동 Merge Runner")

---

## 16. Page Entry 정본

| Screen | Page Entry |
|---|---|
| SCR-001 | `src/app/page.tsx` |
| SCR-002 | `src/app/about/page.tsx` |
| SCR-003 | `src/app/travel-tools/page.tsx` |
| SCR-004 | `src/app/mates/page.tsx` |
| SCR-005 | `src/app/account/page.tsx` |

현재 저장소에는 `src/app/page.tsx`만 Next.js 기본 스타터 상태로 존재하며, 나머지 4개는 아직 생성되지 않았다(`TASKS/TASK_MANIFEST.csv`의 `detail_file_exists`는 Task 상세 파일 존재 여부이며, 실제 페이지 구현 여부와는 별개다 — 구현 여부는 17장을 참조).

---

## 17. 착수 차단 (실제로 필요한데 누락된 것만)

아래 항목은 구현 Task(`PAGE-SCR003`, `INFRA-AUTH`, `DB-SCHEMA-BASE`, `CI-LINT-TYPECHECK-TEST` 등)를 시작하기 전에 실제로 없으면 진행할 수 없는 파일·환경변수다. 존재하지 않는 것으로 추측되는 항목이 아니라, 이 저장소를 직접 확인해 없는 것만 기록했다.

| 항목 | 상태 | 필요한 이유 |
|---|---|---|
| `@supabase/supabase-js`(또는 `@supabase/ssr`) 의존성 | `package.json`에 없음 | `INFRA-AUTH`, `DB-ACCESS`가 Supabase Client를 사용하려면 필요 |
| `vitest` 의존성 및 설정 | `package.json`에 없음 | 12장 단위/통합 테스트 실행 불가 |
| `@playwright/test` 의존성 및 설정 | `package.json`에 없음 | 12장 E2E Smoke 실행 불가 |
| `.env.example`(및 로컬 `.env.local`) | 저장소에 없음 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `FLIGHT_OUTBOUND_URL`, `HOTEL_OUTBOUND_URL` 값이 없으면 Auth·외부 이동 기능을 개발·테스트할 수 없음 |
| Supabase 프로젝트 자체 및 위 환경변수 값 | 프로젝트 존재 여부 미확인(로컬에서 확인 불가) | 값이 없으면 `INFRA-AUTH`, `DB-SCHEMA-BASE`, `DB-RLS-BASE`가 대상 프로젝트 없이 진행 불가 — `SUPABASE-ENV-VERIFY`에서 배포 전 확인 필요 |
| `supabase/migrations/`, `supabase/policies/`, `supabase/seed.sql` | 디렉터리 자체가 없음 | `DB-SCHEMA-BASE`/`DB-RLS-BASE`/`DB-SEED-BASE`의 Expected Files 대상 경로가 아직 생성되지 않음 |
| `.github/workflows/ci.yml` | 디렉터리 자체가 없음 | 13장 CI 게이트가 아직 없음(`CI-LINT-TYPECHECK-TEST`) |
| `src/app/about`, `src/app/travel-tools`, `src/app/mates`, `src/app/account` | 디렉터리 자체가 없음 | 16장의 나머지 4개 Page Entry가 아직 생성되지 않음 |

위 목록은 "필요한데 없는 것"만 담았다 — 있으면 좋은 선택 사항(예: 선택적 모니터링 도구)은 여기 포함하지 않는다.

---

## 18. 프로젝트 범위에서 제외

아래 항목은 이 프로젝트의 구현 범위가 아니다. 착수 차단 목록(17장)에도 포함하지 않으며, 필요 파일이 없다는 이유로 작업을 막지 않는다.

| 제외 항목 | 대체 방식 |
|---|---|
| **CMS(콘텐츠 관리 시스템)** | 여행지·안전정보·대표 소개는 `src/data` 정적 코드로 직접 관리(6장). 콘텐츠 CRUD 관리자 화면, 게시 워크플로, 미디어 업로드 승인을 만들지 않는다 |
| **외부 이메일 공급자(SendGrid, Postmark 등)** | 참가 요청·승인/거절·신고 접수 알림은 인앱 Toast(`SHR-TOAST-NOTIFY`)로만 제공한다. 실제 이메일 발송 연동을 하지 않는다 |
| **Monitoring(Sentry, Datadog 등 외부 모니터링/APM)** | 별도 모니터링 서비스를 연동하지 않는다. 오류 확인은 Vercel 기본 로그와 릴리스 전 수동 점검(`RELEASE-CHECK-LIGHTHOUSE`, `RELEASE-CHECK-EXTERNAL-LINKS`, `MANUAL-A11Y-KEYBOARD`)으로 대체한다 |

이 세 가지는 `docs/PROJECT_SCOPE.md`의 EXCLUDED 분류(전체 콘텐츠 CMS, 외부 이메일 사업자 연동, 자동 백업·장애 알림)와 일치한다.
