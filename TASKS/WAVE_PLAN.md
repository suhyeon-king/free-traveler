# Traveler Wave Plan (WAVE_PLAN)

- **Document ID:** WAVE-PLAN-001
- **schema_version:** traveler-wave-plan-v1
- **생성:** `scripts/build_waves.py` (자동 생성 — 사람이 직접 편집하지 않는다. Task 그래프가 바뀌면 스크립트를 다시 실행해 재생성한다.)
- **generated_at:** 2026-09-17T11:35:13+00:00

`.claude/commands/run-wave.md`가 참조하는 WAVE_PLAN(`TASKS/WAVES.md`) 정본이다. Wave ID는 W00~W10으로 사전에 고정하지 않았으며, 아래 표의 실제 값이 정본이다.

## Wave 그룹 순서

1. Scaffold, 문서, Harness 확인
2. Airbnb 스타일 공통 UI, 정적 데이터, Layout
3. Supabase Auth, 6개 Table, 기본 RLS
4. SCR-001 메인 Component와 Page Owner
5. SCR-002 대표 소개 Component와 Page Owner
6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner
7. SCR-004 동행 목록·상세·신청 Component와 Page Owner
8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner
9. Unit·Playwright·접근성·CI
10. Vercel Preview와 Release 확인

## Wave 목록

| Wave ID | Wave 그룹 | Task IDs (Depends On 순서) | Preview Checkpoint |
|---|---|---|---|
| W01 | 1. Scaffold, 문서, Harness 확인 | INFRA-ENV-SECRETS, INFRA-OUTBOUND-LINKS, INFRA-SECURITY-BASELINE | 없음 |
| W02 | 2. Airbnb 스타일 공통 UI, 정적 데이터, Layout | DATA-DESTINATIONS, DATA-REPRESENTATIVE, DATA-SAFETY, SHR-A11Y-FOCUS, SHR-DRAWER-MODAL, SHR-EMPTY-STATE, SHR-ERROR-NOTFOUND | 없음 |
| W03 | 2. Airbnb 스타일 공통 UI, 정적 데이터, Layout | SHR-FAVORITES-STORAGE, SHR-HEADER-FOOTER, SHR-IMAGE-OPTIMIZATION, SHR-RESPONSIVE-LAYOUT, SHR-SEO-METADATA, SHR-SHARE-LINK, SHR-TOAST-NOTIFY | 없음 |
| W04 | 3. Supabase Auth, 6개 Table, 기본 RLS | DB-SCHEMA-BASE, DB-RLS-BASE, DB-SEED-BASE, INFRA-AUTH, DB-ACCESS | 없음 |
| W05 | 4. SCR-001 메인 Component와 Page Owner | CMP-SCR001-ABOUT-SUMMARY, CMP-SCR001-DESTINATIONS, CMP-SCR001-HERO-SEARCH, CMP-SCR001-MATE-PREVIEW, CMP-SCR001-SAFETY-PANEL, PAGE-SCR001 | SCR-001(`/`) Preview 확인 |
| W06 | 5. SCR-002 대표 소개 Component와 Page Owner | CMP-SCR002-COUNTRY-CHIPS, CMP-SCR002-GALLERY, CMP-SCR002-HERO-STATS, CMP-SCR002-INTRO, CMP-SCR002-MEMORABLE-CTA, CMP-SCR002-TIMELINE, PAGE-SCR002 | SCR-002(`/about`) Preview 확인 |
| W07 | 6. SCR-003 여행 입력·외부 이동·동행글 입력 Component와 Page Owner | CMP-SCR003-FLIGHT-FORM, CMP-SCR003-HOTEL-FORM, CMP-SCR003-MATE-WRITE, PAGE-SCR003 | SCR-003(`/travel-tools`) Preview 확인 |
| W08 | 7. SCR-004 동행 목록·상세·신청 Component와 Page Owner | CMP-SCR004-APPLY, CMP-SCR004-BLOCK, CMP-SCR004-DETAIL, CMP-SCR004-FILTER, CMP-SCR004-LIST, CMP-SCR004-REPORT, PAGE-SCR004 | SCR-004(`/mates`) Preview 확인 |
| W09 | 8. SCR-005 계정·내 활동·간단 관리자 Component와 Page Owner | CMP-SCR005-ADMIN, CMP-SCR005-AUTH, CMP-SCR005-MY-ACTIVITY, CMP-SCR005-PROFILE, PAGE-SCR005 | SCR-005(`/account`) Preview 확인 |
| W10 | 9. Unit·Playwright·접근성·CI | CI-LINT-TYPECHECK-TEST, E2E-MATE-AUTH, E2E-PUBLIC-SMOKE, E2E-TRAVEL-TOOLS, MANUAL-A11Y-KEYBOARD, TEST-RLS-BASIC, UNIT-CONTACT-DETECTION | 없음 |
| W11 | 9. Unit·Playwright·접근성·CI | UNIT-MATE-STATE, UNIT-TRAVEL-DATES | 없음 |
| W12 | 10. Vercel Preview와 Release 확인 | DEPLOY-VERCEL-SETUP, RELEASE-CHECK-EXTERNAL-LINKS, RELEASE-CHECK-LIGHTHOUSE, SUPABASE-ENV-VERIFY | FINAL — 전체 Release 확인(`/release-check` RELEASE_READY) |

Depends On 원본 그래프와 순환 의존성 검사 결과는 `TASKS/TASK_DAG.md`를 참고한다.
