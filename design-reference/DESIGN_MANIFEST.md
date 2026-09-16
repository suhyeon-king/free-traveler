# Free Traveler — Design Manifest

- **Active Design Version:** D-001
- **Status:** LOCKED
- **Active File:** `design-reference/D-001/DESIGN.md`
- **Vendor Reference:** `design-reference/vendor/airbnb/DESIGN.md` (레이아웃 밀도·위계 개념 참고 전용, 상표·색상·폰트·컴포넌트 미차용)
- **Approved Screens:** SCR-001 ~ SCR-005
- **Mobile Variants:** SCR-001, SCR-003

---

## 승인 화면 인벤토리 (Google Stitch)

- **Project:** https://stitch.withgoogle.com/projects/13153454374746250658
- **Project ID:** `13153454374746250658`

| Screen | Device | Screen ID | 비고 |
|---|---|---|---|
| SCR-001 `/` 메인 | Desktop | `a5a15721ea2d4eefaf157cda00e7ea53` | |
| SCR-001 `/` 메인 | Mobile | `61729c4ff06943519d98483d8024b3e9` | |
| SCR-002 `/about` 대표 소개 | Desktop | `50714ac1427f41c7b444876175b1df32` | |
| SCR-003 `/travel-tools` 통합 여행 준비 | Desktop | `f1cb952570ea4a9c83d937021f6431c3` | |
| SCR-003 `/travel-tools` 통합 여행 준비 | Mobile | `756c8c329e1d4ff6a83c41b2a7f06058` | |
| SCR-004 `/mates` 동행 조회 | Desktop | `fe02271d3d4f428295b861ab626df5f4` | |
| SCR-005 `/account` 계정·관리 | Desktop | `2ee7f3cb5d6641b9826113c2c53d64ab` | |

> 중복 화면(`4721aa04536e4ac999d5872670b7f403`, `da0116c8e87b463c8b7d34fab6a5aca1`)과 계약 불일치 잉여 화면(`461eb4ef62154686864a0342cc7a8696`)은 정본에서 제외된다. `D-001/DESIGN.md`를 정본으로 구현할 때 이 세 화면은 참조하지 않는다.

## D-001이 대체·고정하는 내용

`docs/STITCH_VALIDATION_REPORT.md`(검증 시점 판정: `STITCH_VALIDATION_NEEDS_HUMAN`)에서 발견된 아래 위반 사항은 `D-001/DESIGN.md`의 **Do Not** 규칙으로 명문화되어, 이후 모든 구현·재생성 화면에 공통 적용된다.

| 검증 보고서에서 발견된 문제 | D-001에서 고정한 규칙 |
|---|---|
| SCR-003: "항공권 비교", "실시간" 배지, "최저가 실시간 비교" 문구 | Do Not — 내부 가격 비교·실시간 검색을 암시하는 문구 금지 |
| SCR-003: 별점·후기 위젯, 조작된 "실시간 142명 대기중" | Do Not — 별점/후기/매너온도, 가짜 실시간 통계 금지 |
| SCR-004: "매너온도 98.6℃", "이전 동행 평점 5.0(후기 9개)", "상호 리뷰 시스템" | Do Not — Mate Post Card에 별점·후기·매너온도 포함 금지 |
| SCR-005: "후기 작성 안내" 버튼, Admin 영역(신고 상태 변경·외부 URL 설정) 부재 | Do Not — 후기 기능 금지 / Section 계약에 Admin 탭 필수 명시 |
| 중복·잉여 화면 정리 미비 | 본 매니페스트의 승인 화면 인벤토리로 정본 7개만 고정 |

## 변경 절차

- `Status: LOCKED` 상태에서는 `D-001/DESIGN.md`의 토큰·규칙을 임의로 수정하지 않는다.
- 새 디자인 버전이 필요하면 `design-reference/D-002/DESIGN.md`를 새로 만들고, 이 매니페스트의 `Active Design Version`/`Active File`을 갱신한 뒤 `Status`를 전환한다(기존 D-001은 보존).
- Stitch 화면이 추가로 승인되면 위 "승인 화면 인벤토리" 표와 `Approved Screens`/`Mobile Variants` 값을 함께 갱신한다.
