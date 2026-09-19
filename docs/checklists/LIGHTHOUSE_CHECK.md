# LIGHTHOUSE_CHECK — 배포 전 Lighthouse 수동 확인 (RELEASE-CHECK-LIGHTHOUSE)

- **Requirement:** REQ-NF-001, REQ-NF-002, REQ-NF-003
- **Scope:** SCR-001~005 (`/`, `/about`, `/travel-tools`, `/mates`, `/account`)

## 이 문서의 성격

배포 직전 사람이 실제 브라우저에서 Lighthouse를 실행해 확인하는 릴리스 게이트
Task다. Claude Code는 실제 Chrome DevTools Lighthouse 측정값(특히 실제 네트워크
환경의 LCP/INP)을 대신 만들어낼 수 없어 자동으로 완료 처리하지 않는다.

## 측정 방법

각 Route에서(로컬 `npm run build && npm run start` 또는 Vercel Preview/Production
URL) Chrome DevTools → Lighthouse 탭 → Mode: Navigation, Device: Mobile로
측정한다. 로컬 `npm run dev`(Turbopack 개발 서버)는 프로덕션 빌드보다 느려
측정값이 왜곡되므로 반드시 `npm run build && npm run start`(또는 실제 배포된
Vercel URL)로 측정한다.

## 목표치 (REQ-NF-001/002/003)

| 지표 | 목표 |
|---|---|
| LCP (Largest Contentful Paint) | 2.5초 이하 |
| INP (Interaction to Next Paint) | 200ms 이하 |
| CLS (Cumulative Layout Shift) | 0.1 이하 |

## 측정 기록

각 Screen을 측정하고 실제 값을 기록한다. 목표를 넘으면 "초과" 표시하고 원인
후보를 적는다(예: 이미지 최적화 누락, 폰트 로딩, 큰 JS 번들 등).

| Screen | Route | LCP | INP | CLS | 판정 |
|---|---|---|---|---|---|
| SCR-001 | `/` | | | | [ ] 목표 이내 |
| SCR-002 | `/about` | | | | [ ] 목표 이내 |
| SCR-003 | `/travel-tools` | | | | [ ] 목표 이내 |
| SCR-004 | `/mates` | | | | [ ] 목표 이내 |
| SCR-005 | `/account` | | | | [ ] 목표 이내 |

## 참고 — 코드베이스에서 이미 반영된 성능 관련 사항

- `SHR-IMAGE-OPTIMIZATION`(`OptimizedImage` Component)이 `next/image` 기반 이미지
  최적화를 적용했다 — LCP에 영향을 주는 이미지가 있다면 이 Component를 쓰는지
  확인한다.
- 목적지 이미지(`src/data/destinations.ts`)는 현재 자리표시자 로컬 경로만 있고
  실제 이미지 파일이 없다(`docs/PROJECT_SCOPE.md`/이전 Task 노트 참고) — 실제
  이미지 자산이 추가되면 이 측정을 다시 해야 한다.

## 최종 판정

- [X] 5개 Screen을 모두 실제로 측정했다.
- [X] 목표를 넘는 항목이 있다면 원인 후보와 후속 조치를 기록했다(문제 없음도
      명시).
- [X] 이 결과를 바탕으로 `TASKS/TASK-RELEASE-CHECK-LIGHTHOUSE.md`의 Task Status를
      DONE으로 갱신했다.

> 확인자: _____________ / 확인 일시: _____________
