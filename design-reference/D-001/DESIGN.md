---
version: D-001
name: Free-Traveler-design-system
description: A photo-led travel discovery product on a white canvas with a single coral accent. Layout density and single-accent discipline take cues from consumer marketplace patterns (see vendor/airbnb/DESIGN.md for reference only — no Airbnb color values, type, or components are reused). Inter carries Latin text with a system Korean sans fallback; headlines stay modest (max 32px) so travel photography carries visual weight. Every interactive surface is heavily rounded (10–16px, pill search/tabs/chips), with a single soft shadow tier reserved for cards-on-hover and Drawer/Modal surfaces.

colors:
  canvas: "#FFFFFF"
  surface-soft: "#F7F6F4"
  surface-card: "#FFFFFF"
  ink: "#2B2A28"
  muted: "#6B6863"
  hairline: "#E4E1DC"
  coral: "#F0653C"
  coral-active: "#D64F29"
  coral-soft: "#FDE3D8"
  on-coral: "#FFFFFF"
  error: "#D0342C"
  warning: "#B7791F"
  safety: "#1F4B8F"
  success: "#1E8A5F"
  focus-ring: "#1F4B8F"

typography:
  display-lg:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.25
  display-md:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
  button:
    fontFamily: "'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2

rounded:
  sm: 10px
  md: 16px
  pill: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px

components:
  header:
    height-desktop: 72px
    height-mobile: 56px
    backgroundColor: "{colors.canvas}"
    borderBottom: "1px solid {colors.hairline}"
  footer:
    backgroundColor: "{colors.canvas}"
    borderTop: "1px solid {colors.hairline}"
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.on-coral}"
    rounded: "{rounded.sm}"
    height: 48px
  button-primary-active:
    backgroundColor: "{colors.coral-active}"
  button-primary-disabled:
    backgroundColor: "{colors.coral-soft}"
    textColor: "{colors.on-coral}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.sm}"
    height: 48px
  search-bar-pill:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.pill}"
    height: 56px
  chip:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: 36px
  tab-active:
    textColor: "{colors.coral}"
    borderBottom: "2px solid {colors.coral}"
  tab-inactive:
    textColor: "{colors.muted}"
  destination-card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline}"
  mate-post-card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
    border: "1px solid {colors.hairline}"
  status-badge-recruiting:
    backgroundColor: "{colors.coral-soft}"
    textColor: "{colors.coral-active}"
  status-badge-closed:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
  safety-badge:
    backgroundColor: "#E8EEF9"
    textColor: "{colors.safety}"
  drawer-modal:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    shadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)"
    scrim: "rgba(0,0,0,0.5)"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-coral}"
    rounded: "{rounded.sm}"
  text-input:
    backgroundColor: "{colors.canvas}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.sm}"
    height: 48px
    focus-border: "2px solid {colors.focus-ring}"
---

## Overview

Free Traveler는 흰색 캔버스(`{colors.canvas}`)와 짙은 웜그레이 텍스트(`{colors.ink}` — #2B2A28)를 기본으로 하고, 코랄(`{colors.coral}` — #F0653C) 단일 액센트만 주요 CTA·활성 탭·브랜드 강조에 사용하는 여행 사진 중심 제품이다. 참고 문서 `design-reference/vendor/airbnb/DESIGN.md`는 "여백을 넉넉히 쓰되 카드 밀도는 높게", "단일 액센트 컬러만 반복 사용", "그림자는 한 단계만 쓴다" 같은 **레이아웃 밀도·위계 개념만** 참고하며, Airbnb의 색상 값(#ff385c 등)·폰트명(Airbnb Cereal)·로고·문구·컴포넌트는 그대로 가져오지 않는다.

타이포그래피는 Inter(오픈소스 Google Font)가 영문·숫자를 담당하고, 한글은 OS 기본 한글 산세리프(Apple SD Gothic Neo / Malgun Gothic)로 자연스럽게 대체된다. 별도 라이선스가 필요한 폰트 파일은 사용하지 않는다.

## Color Token

| 토큰 | 값 | 용도 |
|---|---|---|
| `colors.canvas` | `#FFFFFF` | 기본 배경 |
| `colors.surface-soft` | `#F7F6F4` | Section 교차 배경, Empty State 배경 |
| `colors.surface-card` | `#FFFFFF` | 카드 배경 |
| `colors.ink` | `#2B2A28` | 제목·본문 텍스트 |
| `colors.muted` | `#6B6863` | 보조 설명, 메타 텍스트, 비활성 탭 |
| `colors.hairline` | `#E4E1DC` | 카드 테두리, 구분선, 입력창 테두리 |
| `colors.coral` | `#F0653C` | 주 CTA, 활성 탭, 브랜드 강조 (그 외 용도 사용 금지) |
| `colors.coral-active` | `#D64F29` | 코랄 버튼 pressed |
| `colors.coral-soft` | `#FDE3D8` | 코랄 disabled, 모집중 배지 배경 |
| `colors.on-coral` | `#FFFFFF` | 코랄 배경 위 텍스트 |
| `colors.error` | `#D0342C` | 폼 오류, 실패 상태 |
| `colors.warning` | `#B7791F` | 경고, 마감 임박 등 주의 |
| `colors.safety` | `#1F4B8F` | 국가 안전정보, 공식 출처, 안전 고지 전용 |
| `colors.success` | `#1E8A5F` | 제출 완료, 승인 등 성공 상태 |
| `colors.focus-ring` | `#1F4B8F` | 키보드 포커스 링(3px, offset 2px) |

**규칙:** 위 표에 없는 색상은 임의로 추가하지 않는다. 새 의미(예: 새 상태)가 필요하면 기존 토큰 중 의미가 가장 가까운 것을 재사용하고, 정말 불가피하면 이 표를 갱신한 뒤 사용한다. 코랄은 오류·경고·안전정보와 절대 혼용하지 않는다(별도 semantic color로 항상 분리).

## Typography

| 토큰 | 크기/굵기 | 줄간격 | 용도 |
|---|---|---|---|
| `typography.display-lg` | 32px / 700 | 1.25 | 메인·대표소개 Hero 타이틀 |
| `typography.display-md` | 24px / 700 | 1.3 | Section 제목 |
| `typography.title` | 18px / 600 | 1.35 | 카드 제목, 탭 라벨 |
| `typography.body` | 16px / 400 | 1.6 | 기본 본문 |
| `typography.body-sm` | 14px / 400 | 1.5 | 카드 메타, 보조 설명 |
| `typography.caption` | 13px / 500 | 1.4 | 배지, 폼 캡션, 라벨 |
| `typography.button` | 16px / 600 | 1.2 | 버튼 라벨 |

폰트 스택: `'Inter', 'Apple SD Gothic Neo', 'Malgun Gothic', -apple-system, system-ui, 'Noto Sans KR', sans-serif`. Hero 타이틀도 32px를 넘지 않는다 — 위계는 사진과 여백으로 만들고 타이포로 밀어붙이지 않는다.

## Spacing

기본 단위 4px. `spacing.xs` 4 · `spacing.sm` 8 · `spacing.md` 12 · `spacing.base` 16 · `spacing.lg` 24 · `spacing.xl` 32 · `spacing.xxl` 48. 카드 내부 패딩은 `spacing.lg`(24px), 카드 간 Grid 간격은 `spacing.base`(16px)를 기본으로 한다.

## Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `rounded.sm` | 10px | 버튼, 입력창 |
| `rounded.md` | 16px | 카드, Drawer/Modal |
| `rounded.pill` | 999px | 검색창, Chip, 탭 인디케이터 배경, 배지 |

하드 코너(0px)는 페이지 그리드 자체를 제외하고 사용하지 않는다.

## Shadow (Elevation)

단일 그림자 톤만 존재한다: `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)`. 적용 대상은 **카드 hover**, **Drawer/Modal**, **Toast** 세 가지뿐이며, 나머지 표면(Header, Footer, 정적 Section 배경)은 그림자 없이 `colors.hairline` 1px 구분선으로만 분리한다. 단계별(2단계 이상) 그림자 시스템은 만들지 않는다.

## Header · Footer

**Header** — Desktop 72px / Mobile 56px, `colors.canvas` 배경 + 하단 1px `colors.hairline`. 좌측 Free Traveler 텍스트 워드마크, 중앙(Desktop)에 메인/여행 준비/동행 찾기/대표 소개 내비게이션, 우측에 계정 진입점(비로그인 "로그인" 텍스트 링크 / 로그인 시 닉네임 아바타). Mobile은 로고 + 햄버거 메뉴로 축소되고, 메뉴는 Modal 시트로 열린다.

**Footer** — `colors.canvas` 배경 + 상단 1px `colors.hairline` (그림자 없음). Desktop 3열(서비스/회사/정책) → Mobile 1열. 하단 legal band에 저작권 문구와 "항공·호텔 정보는 외부 사이트로 연결되며 예약을 대행하지 않습니다" 고지를 포함한다. Header/Footer는 SCR-001~005 5개 화면에서 완전히 동일한 컴포넌트를 재사용한다.

## Search · Filter

검색창은 `component.search-bar-pill`(56px 높이, `rounded.pill`, `colors.hairline` 테두리)을 기본으로 하며 focus 시 `colors.focus-ring` 2px 테두리로 전환한다(그림자·글로우 추가 없음). 필터는 드롭다운/체크박스 조합이며 적용 결과는 항상 "총 N개의 결과" 형태의 요약 텍스트를 동반한다. 결과 0건일 때는 6장 "완성형 Empty State" 규칙을 따른다.

## Destination Card

`rounded.md`, `colors.hairline` 1px 테두리, 그림자는 hover 시에만. 구조: 실제 여행 사진(상단, `rounded.md` 상단 모서리만 클리핑) → 지역/국가명(`typography.title`) → 테마·계절 태그 Chip → 즐겨찾기 아이콘(우상단). 해외 카드에는 안전정보 배지(`component.safety-badge`)를 추가로 붙일 수 있다.

## Form · Tabs

폼 입력창은 `component.text-input`(48px 높이, `rounded.sm`)을 기본으로 하며, 라벨은 `typography.caption`으로 입력창 위에 고정 배치한다. 오류 시 테두리를 `colors.error`로 바꾸고 필드 아래 오류 문구를 `typography.caption`/`colors.error`로 표시하며 `aria-describedby`로 연결한다. 탭은 밑줄형(`component.tab-active`/`tab-inactive`)이며 최소 3개(SCR-003: 항공편/숙소/동행 구하기)까지 가로 배치, 각 탭 터치 영역 44px 이상을 유지한다.

## Mate Post Card

`rounded.md`, `colors.hairline` 테두리. 구조: 모집 상태 배지(`status-badge-recruiting`/`status-badge-closed`) → 국가·지역·기간(아이콘+텍스트) → 제목(`typography.title`) → 여행 스타일 Chip → CTA(상세보기/참가 요청). **별점, 후기, 매너온도, "실시간 N명 대기중" 같은 조작된 실시간 통계는 이 카드에 포함하지 않는다** — Do Not 섹션 참조.

## Drawer · Modal

`component.drawer-modal`: `colors.canvas` 배경, `rounded.md`, 단일 그림자 톤, `rgba(0,0,0,0.5)` scrim. Desktop에서는 우측/중앙 Drawer 또는 중앙 Modal로, Mobile에서는 하단에서 올라오는 Bottom Sheet로 변환된다. 열릴 때 포커스를 내부 첫 상호작용 요소로 이동시키고 닫힐 때 트리거로 복귀시키는 Focus Trap을 적용한다. `Esc`와 바깥 클릭으로 닫힌다.

## Alert · Toast

- **인라인 Alert**: Section/폼 상단에 고정 배치, 성격에 따라 `colors.safety`(정보/안전 고지), `colors.warning`(주의), `colors.error`(오류) 배경 tint + 아이콘 + 텍스트 라벨을 함께 표시한다(색상만으로 구분하지 않는다).
- **Toast**: `component.toast`(짙은 `colors.ink` 배경, `rounded.sm`), 화면 하단 또는 상단에 3~5초 노출 후 자동 소멸. 참가 요청 접수·승인/거절·신고 접수 등 인앱 알림에 사용하며 실제 이메일 발송을 대체한다.

## Loading · Empty · Error 상태

| 상태 | 규칙 |
|---|---|
| **Loading** | 실제 콘텐츠와 동일한 크기의 회색 스켈레톤 블록만 사용한다. 스피너 단독 전체화면 사용은 지양한다. |
| **Empty** | 아래 "완성형 Empty State" 규칙을 반드시 따른다(빈 화면·빈 카드 금지). |
| **Error** | Section 단위 인라인 오류(`colors.error` 아이콘+텍스트) + "다시 시도" 액션을 함께 제공한다. 동일 탭 이탈 없이 표시한다. |
| **Unauthorized** | 로그인/성인 확인이 필요한 액션은 실행 대신 안내 카드(`colors.safety` 톤) + 로그인/가입 CTA로 대체한다. |

---

## Desktop · Mobile 규칙

### Breakpoint 기준

| 기준 | 폭 |
|---|---|
| Desktop | **1440px** |
| Mobile | **390px** |
| Tablet(보간) | 744–1128px |

### Page Section 최대 폭과 상하 여백

- Desktop 콘텐츠 최대 폭: **1200–1280px**, 중앙 정렬.
- Desktop Section 상하 여백: **64–96px**.
- Mobile Section 상하 여백: **40–64px**.
- Mobile Card Grid는 **1열**(가로 스크롤 캐러셀 대체 가능), Desktop 대비 카드 밀도만 낮추고 콘텐츠·CTA는 동일하게 유지한다.

### Hero 높이와 다음 Section 노출 규칙

- Desktop Hero 높이 목표: **520–600px**. 1440px 화면(뷰포트 900px 대 기준)에서 스크롤 없이 다음 Section의 상단 100px 이상이 함께 보여야 한다.
- Hero는 `min-height: 100vh` 또는 이에 준하는 전체 뷰포트 채움을 사용하지 않는다.
- Mobile Hero는 검색창/CTA 등 핵심 요소만 세로로 압축 배치한다.

### Section별 제목·설명·본문·CTA 계층과 시각적 리듬

모든 Section은 다음 4단 계층을 지킨다.

1. **제목** — `typography.display-md`, 자연스러운 한국어 완성 문장형 헤드라인.
2. **설명** — `typography.body` 또는 `body-sm`, 1~3문장.
3. **본문** — 실제 콘텐츠(Card Grid, Chip 목록, Timeline, Gallery, Form 등).
4. **CTA** — 다음 행동으로 연결되는 버튼/링크(모든 Section에 필수는 아니며, 본문 자체가 명확한 다음 행동이면 생략 가능).

시각적 리듬은 Hero → Card Grid → 좌우 분할 → Chip 목록 → 3단계 안내 → CTA Banner를 교차 배치해서 만든다. **동일 화면 안에서 같은 형식의 Card Grid를 3회 이상 연속 반복하지 않는다.**

### 화면별 Section 순서와 최소 콘텐츠 수

| Screen | Section 순서 | 최소 콘텐츠 수 |
|---|---|---|
| **SCR-001** `/` 메인 (7 Section) | 검색 Hero → 국내 여행지 Card Grid → 해외 여행지 Card Grid → 여행 동기 Chip → 국가별 주의사항 Card Grid+Drawer 연결 → 최근 동행글 List/완성형 Empty → free_traveler 요약+CTA | 국내 카드 6개, 해외 카드 6개, 테마 Chip 6개, 안전정보 카드 6개, 동행글 3개(데이터 없으면 Empty State) |
| **SCR-002** `/about` 대표 소개 (7 Section) | 프로필 Hero → 여행 지표 → 소개 문단 → Timeline → 방문 국가 Chip → Gallery → 기억에 남는 여행지+CTA | 지표 카드 3개(`50+ Trips`/`30+ Countries`/권역 수), 소개 문단 2~4개, Timeline 항목 **6개 이상**, 방문 국가 **30개국 이상**(권역별 그룹), Gallery 사진 **8장 이상**, 추천 여행지 4개 |
| **SCR-003** `/travel-tools` 통합 여행 준비 (6 Section) | Intro(이용 3단계) → 항공/숙소/동행 3-Tab → 조건 입력 Form → 요약+외부 이동 Action Card → 비전달 고지+Tip → 동행 탭 로그인 안내/작성 Form+안전 안내 | Tab 3개(항공편/숙소/동행 구하기), Tip **3개**, 동행 작성 필드 전체(제목/국가/지역/기간/인원/스타일/설명/안전수칙 동의) |
| **SCR-004** `/mates` 동행 조회 (6 Section) | Intro+작성 CTA → Filter+결과 요약 → 동행글 목록(최대 8개)/완성형 Empty → 목록+상세 분할(Desktop)/Drawer(Mobile) → 신청 방법 3단계 → 안전/신고/차단 안내+CTA | 동행글 카드 최대 **8개**, 신청 방법 **3단계**, 안내 문구 각 1문단 이상 |
| **SCR-005** `/account` 계정·관리 (역할별 탭) | Guest: Intro → 로그인/가입/재설정 Form → 로그인 후 가능한 기능 → 보안 안내. Member: 프로필 요약 → 내 글 → 참가 요청 → 차단 목록 → 새 글쓰기 CTA. Admin: 관리 Intro → 신고 상태 변경 → 외부 URL 설정 | 역할에 없는 탭은 렌더링하지 않는다. Admin 탭은 신고 상태(OPEN/REVIEWING/RESOLVED/DISMISSED) 필터와 항공·숙소 외부 URL 설정 Form을 반드시 포함한다 — 어떤 화면 버전에서도 이 탭을 생략하지 않는다. |

### 완성형 Empty State와 Placeholder 문구 금지 규칙

- 모든 목록형 Section은 데이터가 없어도 다음 3요소를 갖춘 **완성형 Empty State**로 표시한다: ① 왜 비어 있는지 설명하는 한 문장, ② 이 기능을 어떻게 이용하는지 안내, ③ 다음 행동으로 이어지는 명확한 CTA.
- `Lorem ipsum`, `준비 중`, `정보 확인 필요`와 같은 자리표시자 문구는 어떤 화면·상태에서도 사용하지 않는다.
- 의미 없이 비어 있는 Card(이미지·텍스트가 없는 껍데기 카드)나 과도한 빈 여백을 남기지 않는다.
- 모든 제목·설명·본문 문구는 자연스러운 한국어 완성 문장으로 작성하고, 사진에는 실제 장소·상황을 설명하는 alt 텍스트를 붙인다(예: "노을이 지는 발리 울루와투 절벽 사원").

---

## Do / Do Not

### Do

- 이 문서에 정의된 Color Token, Typography, Spacing, Radius, Shadow만 사용한다.
- 모든 이미지에 실제 장소를 설명하는 alt 텍스트를 붙인다.
- 코랄은 CTA·활성 상태·브랜드 강조에만 쓰고, 오류·경고·안전정보는 각각 전용 semantic color로 분리한다.
- 목록형 Section의 빈 상태는 항상 완성형 Empty State(사유+이용 방법+CTA)로 표시한다.
- 항공·호텔 입력 폼에는 "입력값은 저장되거나 외부로 전달되지 않습니다" 고지를 항상 노출한다.
- 외부 사이트로 나가는 모든 링크는 새 탭 + `noopener,noreferrer`를 적용하고, 사용자가 입력한 목적지·날짜를 URL 쿼리로 붙이지 않는다.
- 최소 터치 영역 44×44px, 키보드 포커스 링(`colors.focus-ring`, 3px, offset 2px)을 모든 상호작용 요소에 적용한다.
- 모든 문구는 자연스러운 한국어 완성 문장으로 작성한다.

### Do Not

- Airbnb의 로고·워드마크·컬러 값(#ff385c 등)·폰트명(Airbnb Cereal)·문구·컴포넌트를 그대로 가져오지 않는다.
- "예약하기", "결제", "장바구니" 등 구매·예약·결제를 암시하는 UI나 문구를 넣지 않는다.
- 별점(★), 후기, 리뷰 인용문, "매너온도" 같은 평판 점수를 어떤 카드에도 넣지 않는다.
- "실시간 N명 대기중"처럼 실제 데이터가 없는 실시간 통계를 조작해서 표시하지 않는다.
- "최저가 실시간 비교", "항공권 비교"처럼 내부 가격 비교·실시간 검색 기능이 있는 것처럼 표현하지 않는다 — 항공·호텔은 조건 정리 후 외부 일반 페이지로 이동만 한다.
- 광고 배너, 스폰서 콘텐츠를 넣지 않는다.
- Proprietary(유료/독점 라이선스) 폰트 파일을 프로젝트에 포함하지 않는다 — Inter(오픈소스)와 시스템 한글 폰트만 사용한다.
- 이 문서의 Color Token 표에 없는 임의의 색상을 추가하지 않는다.
- `Lorem ipsum`, `준비 중`, `정보 확인 필요` 같은 자리표시자 문구를 사용하지 않는다.
- SCR-005에서 Admin 탭(신고 상태 변경, 외부 URL 설정)을 생략하지 않는다.
