# Free Traveler — Project State

- **Document ID:** PROJECT-STATE-001
- **목적:** 지금 이 순간 프로젝트가 어디까지 와 있는지 보여주는 스냅샷이다. 실제 저장소 파일(`package.json`, `TASKS/`, `.github/`, `supabase/`, 환경변수 파일 등)을 직접 확인해 작성했으며, 추측이나 희망 상태를 적지 않았다.
- **갱신 방법:** 이 문서는 자동으로 갱신되지 않는다. `/run-wave`, `/release-check` 등을 실행한 뒤에는 그 결과를 반영해 이 문서를 사람이(또는 다음 작업에서) 직접 갱신한다. 마지막 확인 시점 이후 상태가 바뀌었을 수 있다 — 정확한 최신 값이 필요하면 아래 각 필드의 "근거"에 적힌 파일을 다시 확인한다.

---

## Harness Schema

```
traveler-screen-route-v1
```

근거: `design-reference/SCREEN_ROUTE_CONTRACT.json`의 `schema_version`.

## Design Version

**D-001** — Status: **LOCKED**

근거: `design-reference/DESIGN_MANIFEST.md`(`Active Design Version: D-001`, `Status: LOCKED`, `Active File: design-reference/D-001/DESIGN.md`).

## Scope Mode

**ACTIVE** — IMPLEMENT 92건 / EXCLUDED 22건 (REQ-FUNC 80 + REQ-NF 34 = 114건 전체 분류 완료)

근거: `docs/PROJECT_SCOPE.md`. EXCLUDED 22건의 상세는 `TASKS/00_TASK_LIST.md` §4 NON_IMPLEMENTATION 표에도 동일하게 보존되어 있다.

## Current Wave

**NOT_DEFINED**

근거: `TASKS/WAVES.md`(WAVE_PLAN)가 아직 저장소에 없다. `TASKS/WAVE_STATE.md`도 아직 없다. Wave 실행(`/run-wave`)을 시작하려면 먼저 `TASKS/WAVES.md`를 작성해야 한다.

## Current Task

**NONE**

근거: `/prepare-task` 또는 `/implement-task`가 아직 한 번도 실행되지 않았다(어떤 `TASKS/TASK-*.md`에도 `**Task Status:**` 필드가 아직 쓰여 있지 않다).

## Completed Tasks

**0 / 64**

근거: `TASKS/TASK-*.md` 64개 파일 전수 확인 — `**Task Status: DONE**` 표기를 가진 파일이 0개다. Task List 자체(`TASKS/00_TASK_LIST.md`)와 상세 파일(`TASKS/TASK-*.md`) 생성, 그리고 `scripts/audit_tasks.py` 감사(18개 항목 `AUDIT_PASS`)까지는 완료됐지만, 이는 **계획 산출물**이며 실제 구현 착수는 아니다.

## Blocked Tasks

**N/A — 아직 어떤 Task도 `/prepare-task`로 시도되지 않았다.**

다만 실제로 저장소를 확인한 결과, Task를 시작하기 전에 먼저 해결해야 할 것으로 이미 알려진 항목은 다음과 같다(`docs/ARCHITECTURE.md` §17과 동일):

| 항목 | 상태 |
|---|---|
| `TASKS/WAVES.md`(WAVE_PLAN) | 없음 — Wave 배정이 아직 없어 `/prepare-task`의 "Wave 포함 여부" 검사가 전부 `BLOCKED_INPUT`을 낼 것이다 |
| `@supabase/supabase-js`(또는 `@supabase/ssr`), `vitest`, `@playwright/test` 의존성 | `package.json`에 없음 |
| `.env.local`/`.env` | 없음(Supabase URL/키, 외부 URL 환경변수 미설정) |
| Supabase 프로젝트 자체 | 존재 여부 미확인 |
| `supabase/migrations/`, `supabase/policies/`, `supabase/seed.sql` | 없음 |
| `.github/workflows/ci.yml` | 없음 |
| `src/app/about`, `src/app/travel-tools`, `src/app/mates`, `src/app/account` | 없음(4개 Page Entry 미생성, `src/app/page.tsx`는 Next.js 기본 스타터 상태 그대로) |

## Latest CI

**NONE**

근거: `.github/workflows/` 디렉터리 자체가 저장소에 없다. CI가 아직 한 번도 구성·실행되지 않았다.

## Supabase State

**NOT_PROVISIONED**

근거: `supabase/` 디렉터리 없음, `package.json`에 Supabase 클라이언트 의존성 없음, `.env`/`.env.local` 없음. 6개 테이블(`profiles`, `mate_posts`, `mate_applications`, `user_blocks`, `reports`, `app_settings`)과 RLS 정책은 아직 정의되지 않았다(설계는 `docs/ARCHITECTURE.md` §8~10, `DECISION_LOG.md` DEC-005/006에 확정되어 있으나 구현 전).

## Vercel Preview URL

**NONE**

근거: 배포가 아직 수행되지 않았다. `docs/checklists/VERCEL_DEPLOY_CHECK.md`도 아직 없다.

## Screen Checkpoints

| Screen | Route | Checkpoint |
|---|---|---|
| SCR-001 | `/` | PENDING |
| SCR-002 | `/about` | PENDING |
| SCR-003 | `/travel-tools` | PENDING |
| SCR-004 | `/mates` | PENDING |
| SCR-005 | `/account` | PENDING |
| **FINAL** | — | **PENDING** |

각 Screen의 Checkpoint는 해당 Screen의 `PAGE_OWNER` Task가 `DONE`이 되고 사람이 Vercel Preview(또는 로컬 실행 화면)를 확인했을 때만 `PENDING`에서 다음 상태로 바뀐다(`CLAUDE.md` 규칙 22, `run-wave.md`의 Preview Checkpoint 절차). FINAL은 5개 Screen Checkpoint가 모두 통과하고 `/release-check`가 `RELEASE_READY`를 낼 때 바뀐다.

## Playwright State

**NOT_CONFIGURED**

근거: `package.json`에 `@playwright/test`가 없고 Playwright 설정 파일(`playwright.config.ts` 등)도 없다. `E2E-PUBLIC-SMOKE`, `E2E-TRAVEL-TOOLS`, `E2E-MATE-AUTH` 3개 Task는 계획만 되어 있고(Chromium Smoke, `TASKS/00_TASK_LIST.md` §2-13) 아직 실행된 적이 없다.

## Deferred Items

**EXCLUDED 22건** — `docs/PROJECT_SCOPE.md`와 `TASKS/00_TASK_LIST.md` §4 NON_IMPLEMENTATION에 근거·후속 방향과 함께 기록되어 있다. 대표 항목: 전체 콘텐츠 CMS, 미디어 업로드·라이선스 워크플로, 범용 감사 로그, 자동 백업/장애 알림, 외부 이메일 연동, 회원 탈퇴 자동 삭제 파이프라인, 서버 속도 제한, 다중 브라우저/부하 테스트 자동화. 이 항목들은 이번 릴리스 범위에서 구현하지 않으며, `/prepare-task`·`/implement-task`·`scripts/audit_tasks.py`가 이 항목들이 구현 대상으로 되살아나지 않는지 계속 감시한다.

## Next Action

아래 순서로 진행한다(현재 상태 기준 다음 실행 가능한 행동).

1. **`TASKS/WAVES.md`(WAVE_PLAN) 작성** — `TASKS/00_TASK_LIST.md`의 `Depends On` 그래프를 근거로 Wave 구성을 정한다(`DEC-010`). 예: Wave 1 = `DATA-*`/`DB-*`/`INFRA-*`/`SHR-*` 기반 Task, 이후 Wave부터 Screen별 `COMPONENT`+`PAGE_OWNER`.
2. **착수 차단 항목 해소** — `docs/ARCHITECTURE.md` §17에 정리된 누락 의존성(Supabase/Vitest/Playwright 패키지), `.env.local`, Supabase 프로젝트 생성, `.github/workflows/ci.yml`을 준비한다.
3. **`/run-wave W01` 실행** — 첫 Wave부터 `/prepare-task` → `/implement-task` 순서로 Task를 하나씩 진행한다.
4. Screen 관련 Wave가 끝날 때마다 사람이 Preview를 확인하고 `/run-wave resume`으로 다음 Wave를 진행한다(위 Screen Checkpoints 표를 그때마다 갱신한다).
5. 모든 Wave가 끝나면 `/release-check`로 `RELEASE_READY` 여부를 확인한다.
