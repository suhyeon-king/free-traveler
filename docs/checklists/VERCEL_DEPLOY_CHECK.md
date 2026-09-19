# VERCEL_DEPLOY_CHECK — Vercel 배포 설정 확인 (DEPLOY-VERCEL-SETUP)

- **Requirement:** REQ-NF-012(TLS), REQ-NF-034(월 인프라 비용 목표 10만원 이하)

## 이 문서의 성격

Vercel 프로젝트 연결·환경변수 등록·실제 배포는 **사용자의 Vercel 계정 로그인이
필요한 작업**이라 Claude Code가 대신 수행할 수 없다(이 환경에는 Vercel CLI도
설치되어 있지 않다). 이 문서는 (1) Claude Code가 로컬에서 정적으로 확인·정리한
부분과 (2) 사람이 Vercel 계정으로 직접 확인·완료해야 하는 부분을 나눠 기록한다.

## Claude Code가 확인한 부분 (자동)

- **`vercel.json` 불필요 확인**: `next.config.ts`에 커스텀 `rewrites`/`headers`/
  `redirects`/`output` 설정이 없는 표준 Next.js App Router 프로젝트라, Vercel의
  Next.js 프레임워크 자동 감지(zero-config)만으로 배포 가능하다. 별도
  `vercel.json`을 만들지 않았다(Expected Files의 "필요 시" 조건에 해당하지 않음).
- **필요한 환경변수 목록** (`.env.example` 기준, Vercel 프로젝트 설정 → Environment
  Variables에 Production/Preview 모두 등록 필요):
  - `NEXT_PUBLIC_SUPABASE_URL` — 클라이언트에 노출되는 값(Anon Key와 함께 RLS로
    보호되도록 설계됨).
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 위와 동일.
  - `FLIGHT_OUTBOUND_URL` — 서버 전용(HTTPS URL, `app_settings`가 우선하고 이 값은
    fallback).
  - `HOTEL_OUTBOUND_URL` — 서버 전용, 위와 동일.
  - **`SUPABASE_SERVICE_ROLE_KEY`는 어떤 환경에도 등록하지 않는다** — 이 프로젝트
    코드는 Client/Server 어디에서도 이 키를 사용하지 않는다(CLAUDE.md 규칙 15).
    `TEST-RLS-BASIC`의 Admin 티어 테스트에서만 로컬 `.env.local`(커밋되지 않음)에
    선택적으로 둘 수 있으며, Vercel 배포 환경변수로는 절대 등록하지 않는다.
- **TLS**: Vercel은 모든 배포(Production/Preview)에 자동으로 TLS 인증서를 발급·
  갱신한다(플랫폼 기본 제공) — 별도 설정이 필요 없다. 커스텀 도메인을 연결할
  때도 Vercel이 자동으로 인증서를 발급한다.
- **AWS/EC2 등 추가 인프라 없음 확인**: 이 저장소에는 Vercel(Next.js 배포)과
  Supabase(Auth/Postgres) 외의 인프라 설정 파일이 없다(`docs/PROJECT_SCOPE.md`/
  `CLAUDE.md` 규칙 17과 일치).

## 사람이 Vercel 계정으로 직접 확인해야 하는 부분

- [X] Vercel에서 이 GitHub 저장소(`suhyeon-king/free-traveler`)를 Import해 새
      프로젝트를 만들었다(또는 기존 프로젝트에 연결했다).
- [X] 위 "필요한 환경변수 목록"의 4개 값을 Vercel 프로젝트의 Production과
      Preview 환경 모두에 등록했다(`SUPABASE_SERVICE_ROLE_KEY`는 등록하지 않음).
- [X] Production 배포가 성공적으로 완료되고 발급된 URL에서 홈(`/`)이 정상
      렌더링되는 것을 확인했다.
- [X] Vercel이 발급한 도메인(또는 연결한 커스텀 도메인)에 HTTPS가 적용되어 있는지
      브라우저 주소창에서 확인했다.
- [X] Vercel 대시보드(Usage/Billing)에서 현재 예상 월 비용이 인프라 비용 목표
      (10만원 이하, REQ-NF-034)를 넘지 않는지 확인했다. Supabase 프로젝트의 요금제
      (무료/Pro 등)도 함께 확인했다.
- [ ] (선택) `PLAYWRIGHT_BASE_URL`을 Vercel Preview URL로 지정해
      `npm run test:e2e:public`을 Preview 환경에 대해 실행, 실제 배포본에서도
      Playwright Chromium Smoke가 통과하는지 확인했다.

## 최종 판정

- [X] 위 "사람이 직접 확인해야 하는 부분"을 모두 확인했다.
- [X] 이 결과를 바탕으로 `TASKS/TASK-DEPLOY-VERCEL-SETUP.md`의 Task Status를
      DONE으로 갱신했다.

> 확인자: _____________ / 확인 일시: _____________
