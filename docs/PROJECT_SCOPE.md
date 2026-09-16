# Free Traveler — PROJECT_SCOPE

- **Document ID:** SCOPE-TRAVEL-001
- **기반 문서:** `docs/01_PRD.md.md` (PRD-TRAVEL-001), `docs/02_SRS_BASELINE.md.md` (SRS-TRAVEL-001)
- **작성 대상:** 현재 저장소 구현 범위 (Next.js App Router, `src/app`)
- **상태 값:** `IMPLEMENT` = 구현하고 테스트함 / `EXCLUDED` = 만들지 않음(사유 명시)

---

## 1. 화면 구성

### 1-1. 핵심 화면 4개

| 화면 | 라우트(예정) | 대응 기능 |
|---|---|---|
| 여행지 탐색(목록·상세) | `/destinations`, `/destinations/[slug]` | F1 Destination Guide |
| 비행기 찾기 | `/flights` | F2 Flight Link-out |
| 호텔 찾기 | `/hotels` | F3 Hotel Link-out |
| 동행 찾기(목록·상세·작성) | `/mates`, `/mates/[id]`, `/mates/new` | F4 Travel Mate |

### 1-2. 보조 화면 1개

| 화면 | 라우트(예정) | 대응 기능 |
|---|---|---|
| 대표 소개 | `/about` | F6 About free_traveler |

### 1-3. 그 외 지원 화면 (요구사항 항목 3, 6~10에서 직접 지정)

| 화면 | 라우트(예정) | 대응 기능 |
|---|---|---|
| 국가별 안전정보 | `/safety`, `/safety/[countryCode]` | F5 Country Safety |
| 로그인·회원가입·성인 확인 | `/auth/*` | Supabase 이메일 인증, 성인 확인 |
| 내 활동(글·요청·차단) | `/my/*` | 참가 요청, 차단, 신고 |
| 간단한 관리자 탭 | `/admin/*` | 신고 상태, 외부 URL 설정 |

---

## 2. 구현 방식 요약

| 영역 | 방식 |
|---|---|
| 여행지·안전·대표 콘텐츠 | `src/data`의 정적 데이터로 관리, 별도 CMS·DB CRUD 없이 코드 변경으로 갱신 |
| 즐겨찾기 | 서버 저장 없이 브라우저 `localStorage`만 사용 |
| 참가 요청/신고/차단 알림 | 실제 이메일 발송 없이 Toast 또는 화면 상태(인앱)로만 표시 |
| 동행글 자동 마감 | 배치 작업 없이 목록·상세 조회 시점에 종료일을 계산해 마감 여부 판단 |
| 안전정보 stale 표시 | 배치 작업 없이 페이지 렌더링 시점에 `verified_at` 기준 7일 경과 여부 계산 |
| 이미지 | 일반 인터넷 이미지 URL과 `alt` 텍스트만 사용, 별도 라이선스 승인·업로드 파이프라인 없음 |
| 관리자 기능 | 신고 상태 변경과 외부 URL(항공·호텔) 설정만 제공, 그 외 콘텐츠 관리 기능 없음 |
| 인증·데이터 저장 | Supabase(Auth, PostgreSQL, RLS)로 동행·신고·차단 등 사용자 생성 데이터만 저장, 항공·호텔 입력값은 저장하지 않음 |
| 테스트 | Playwright로 핵심 사용자 흐름 Smoke Test 수행 |
| 배포 | Vercel |

---

## 3. 제외 기능과 사유

| 제외 기능 | 사유 |
|---|---|
| 전체 콘텐츠 CMS(여행지·안전·대표 콘텐츠 CRUD 관리자 UI) | 콘텐츠를 `src/data` 정적 데이터로 직접 관리하므로 별도 CRUD 화면이 불필요 |
| 미디어 업로드·라이선스 승인 워크플로 | 이미지가 일반 인터넷 URL 참조 방식이므로 업로드·라이선스 승인 절차가 필요 없음 |
| 범용 감사 로그(actor/action/before/after 추적) | 소규모 MVP 운영 범위를 벗어나는 운영 인프라이며, git 커밋 이력과 신고 상태값으로 대체 |
| 자동 백업·장애 알림·부하 테스트 | 별도 모니터링·인프라 구축 없이 Vercel/Supabase 플랫폼 기본 제공 수준에 의존 |
| 외부 이메일 사업자 연동 | 실제 이메일 발송 대신 Toast·화면 상태로 알림을 대체 |
| EC2·AWS 인프라 | Vercel + Supabase 조합만 사용, 별도 클라우드 인프라를 구성하지 않음 |
| 무인 자동 Merge Runner | 코드 병합은 사람이 직접 검토·수행 |

---

## 4. 요구사항 매핑

> 아래 표는 PRD/SRS의 `REQ-FUNC-001`~`REQ-FUNC-080`, `REQ-NF-001`~`REQ-NF-034`를 한 번씩 모두 기록한다. 어떤 요구사항도 삭제하지 않는다.

### 4-1. F1 Destination Guide (REQ-FUNC-001~010)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-001 | IMPLEMENT | 국내/해외 탭으로 `src/data` 정적 여행지 데이터를 구분 표시 | Playwright: 탭별 결과의 `scope` 값 검증 |
| REQ-FUNC-002 | IMPLEMENT | 국가·도시·계절·테마·기간 필터를 클라이언트에서 AND 조건으로 적용 | Playwright: 복수 필터 조합 결과 검증 |
| REQ-FUNC-003 | IMPLEMENT | 클라이언트 측 키워드(한글 부분 일치) 검색 | Playwright: 검색어 입력 후 결과/빈 결과 확인 |
| REQ-FUNC-004 | IMPLEMENT | 여행지 상세 콘텐츠 스키마(소개·명소 5개↑·시기·1일/3일 일정·예산·교통·음식 3개↑·에티켓·출처·수정일)를 `src/data`에 필수 필드로 정의하고 콘텐츠 작성 시 채움 | 콘텐츠 검수 체크리스트 + Playwright 상세 페이지 필드 렌더링 확인 |
| REQ-FUNC-005 | IMPLEMENT | 필터 결과 0건 시 조건 완화 안내와 초기화 버튼 표시 | Playwright: 결과 없음 상태와 초기화 동작 확인 |
| REQ-FUNC-006 | IMPLEMENT | 해외 여행지 상세의 `country_code`로 안전정보 페이지 링크 생성 | Playwright: 링크 대상 국가코드 일치 확인 |
| REQ-FUNC-007 | IMPLEMENT(간소화) | 대체텍스트·출처 URL만 관리, 작가·라이선스 필드는 별도 승인 워크플로 없이 정적 데이터 텍스트로만 기록 | 콘텐츠 검수: 모든 이미지에 alt·source 존재 여부 확인 |
| REQ-FUNC-008 | IMPLEMENT | `src/data` 콘텐츠 수량(국내 10↑, 해외 15개국 30도시↑)을 시드 데이터로 충족 | 단위 테스트/스크립트로 데이터 개수 검증 |
| REQ-FUNC-009 | IMPLEMENT | 동일 국가·테마 기준 관련 여행지 최대 6개를 상세 하단에 표시 | Playwright: 추천 목록 개수·중복 제외 확인 |
| REQ-FUNC-010 | IMPLEMENT | 허용된 필터 값만 URL query로 직렬화·복원 | Playwright: 새로고침/공유 URL 복원 확인 |

### 4-2. F2 Flight Link-out (REQ-FUNC-011~018)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-011 | IMPLEMENT | 국가·지역·출발일·귀국일 필수 입력 폼(Client Component) | Playwright: 폼 필드 렌더링 확인 |
| REQ-FUNC-012 | IMPLEMENT | 국가 변경 시 종속 지역 옵션 재계산·초기화 | Playwright: 국가 변경 후 지역값 초기화 확인 |
| REQ-FUNC-013 | IMPLEMENT | 과거 출발일/귀국일<출발일 조합 제출 차단 | Playwright: 경계값 케이스 제출 차단 확인 |
| REQ-FUNC-014 | IMPLEMENT | 브라우저 세션 상태로 요약 단계 표시, 수정 시 값 유지 | Playwright: 요약↔폼 왕복 후 값 유지 확인 |
| REQ-FUNC-015 | IMPLEMENT | 폼·요약에 "입력값은 외부 사이트로 전달되지 않음" 고지 문구 표시 | Playwright: 고지 문구 노출 확인 |
| REQ-FUNC-016 | IMPLEMENT | 환경변수 `FLIGHT_OUTBOUND_URL`을 `noopener,noreferrer`로 새 탭 오픈, query 미부착 | Playwright: 새 탭 URL에 query 없음 확인 |
| REQ-FUNC-017 | IMPLEMENT | 항공 입력값을 서버 DB·로그·분석 이벤트에 전송하지 않음(클라이언트 상태로만 처리) | 네트워크 요청 검사(Playwright request 로그) |
| REQ-FUNC-018 | IMPLEMENT | URL 미설정/허용목록 밖일 때 이동 차단 및 오류·재시도 UI 표시 | Playwright: 잘못된 URL 설정 시나리오 확인 |

### 4-3. F3 Hotel Link-out (REQ-FUNC-019~026)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-019 | IMPLEMENT | 국가·지역·체크인·체크아웃 필수 입력 폼 | Playwright: 폼 필드 렌더링 확인 |
| REQ-FUNC-020 | IMPLEMENT | 국가 변경 시 종속 지역 옵션 재계산·초기화 | Playwright: 국가 변경 시 지역값 초기화 확인 |
| REQ-FUNC-021 | IMPLEMENT | 과거 체크인/체크아웃≤체크인 조합 제출 차단 | Playwright: 경계값 케이스 확인 |
| REQ-FUNC-022 | IMPLEMENT | 요약 단계에 입력값과 동일한 국가·지역·기간 표시 | Playwright: 폼-요약 값 일치 확인 |
| REQ-FUNC-023 | IMPLEMENT | 비전달 고지 문구를 폼·요약에 표시 | Playwright: 고지 노출 확인 |
| REQ-FUNC-024 | IMPLEMENT | 환경변수 `HOTEL_OUTBOUND_URL`을 `noopener,noreferrer`로 새 탭 오픈 | Playwright: 새 탭 URL query 없음 확인 |
| REQ-FUNC-025 | IMPLEMENT | 호텔 입력값 서버 미저장(클라이언트 상태로만 처리) | 네트워크 요청 검사 |
| REQ-FUNC-026 | IMPLEMENT | URL 오류 시 입력 유지 + 오류 표시 + 재시도 제공 | Playwright: 오류 시나리오 확인 |

### 4-4. F4 Travel Mate (REQ-FUNC-027~045)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-027 | IMPLEMENT | Supabase Auth 세션 필요, 비회원 쓰기 요청은 로그인 화면으로 유도 | Playwright: 비로그인 접근 시 리다이렉트 확인 |
| REQ-FUNC-028 | IMPLEMENT | `is_adult`, `adult_verified_at`만 저장하고 생년월일 미저장 | Supabase 스키마 검토 + Playwright 성인 확인 플로우 |
| REQ-FUNC-029 | IMPLEMENT | 닉네임·연령대·여행 스타일 필수, 성별 선택 프로필 폼 | Playwright: 필수/선택 필드 검증 |
| REQ-FUNC-030 | IMPLEMENT | 국가·지역·기간 겹침·연령대·성별·스타일·상태 필터, 차단 사용자 글 제외 | Playwright: 필터 조합 및 차단 제외 확인 |
| REQ-FUNC-031 | IMPLEMENT | 모집글 작성 폼 전체 필드 및 날짜 검증 | Playwright: 필수값 누락/역전 날짜 차단 확인 |
| REQ-FUNC-032 | IMPLEMENT | 본문 텍스트에 전화번호·이메일·메신저 ID 정규식 탐지 후 제출 차단 | 단위 테스트로 탐지 패턴 검증 + Playwright 제출 차단 확인 |
| REQ-FUNC-033 | IMPLEMENT | 목록·상세 응답에서 이메일·연락처 필드 제외 | API 응답 스냅샷 검사 |
| REQ-FUNC-034 | IMPLEMENT | 500자 이내 참가 메시지, 작성자/요청자만 열람(Supabase RLS) | Playwright + RLS 정책 테스트 |
| REQ-FUNC-035 | IMPLEMENT | DB unique 제약으로 동일 글 중복 PENDING/ACCEPTED 차단 | Supabase 제약 테스트 |
| REQ-FUNC-036 | IMPLEMENT(간소화) | 작성자가 승인/거절 상태 변경, 변경 이력은 신고 관리자 탭 수준으로만 최소 기록(범용 감사 로그 아님) | Playwright: 상태 변경 및 권한 확인(403) |
| REQ-FUNC-037 | IMPLEMENT | 배치 작업 없이 목록/상세 조회 시 `end_date` 경과 여부를 계산해 자동 마감 처리 | Playwright: 종료일 경과 데이터로 마감 표시 확인 |
| REQ-FUNC-038 | IMPLEMENT | 작성자의 수동 마감·수정·삭제 기능, 승인자 존재 시 경고 표시 | Playwright: 수정/삭제/경고 시나리오 확인 |
| REQ-FUNC-039 | IMPLEMENT | 글·사용자·요청 신고 폼과 접수번호 표시 | Playwright: 신고 접수 흐름 확인 |
| REQ-FUNC-040 | IMPLEMENT | 차단/해제 기능과 상호 노출 제한(Supabase RLS/쿼리 필터) | Playwright + RLS 테스트 |
| REQ-FUNC-041 | IMPLEMENT(간소화) | 관리자 탭에서 신고 상태(OPEN/REVIEWING/RESOLVED/DISMISSED) 필터만 제공 | Playwright: 관리자 탭 필터 확인 |
| REQ-FUNC-042 | IMPLEMENT(간소화) | 신고 상태 변경(처리 완료/기각)만 제공, 경고·계정 제한 등 세분화된 제재 워크플로와 범용 감사 로그는 제외 | Playwright: 상태 변경 확인 |
| REQ-FUNC-043 | IMPLEMENT(간소화) | 인앱 Toast/화면 상태로만 알림 제공, 이메일 발송은 제외(외부 이메일 사업자 연동 제외) | Playwright: Toast 노출 확인 |
| REQ-FUNC-044 | IMPLEMENT | Supabase RLS로 본인/대상 작성자/Moderator·Admin만 비공개 데이터 열람 | RLS 정책 테스트 |
| REQ-FUNC-045 | EXCLUDED | 탈퇴 시 30일 이내 자동 삭제·보존 예외 처리 파이프라인은 구축하지 않음(회원 탈퇴는 계정 비활성화·공개 프로필 숨김 수준으로만 처리) | 사유: 자동 개인정보 삭제·보존 파이프라인은 범용 감사 로그·운영 인프라와 동일하게 MVP 범위 밖 |

### 4-5. F5 Country Safety (REQ-FUNC-046~056)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-046 | IMPLEMENT | 소개되는 해외 15개국 전체에 대해 `src/data` 안전정보 페이지 시드 | 데이터 개수 검증 스크립트 |
| REQ-FUNC-047 | IMPLEMENT | 치안·사기·법규·교통·재난·보건·문화·긴급연락처 8개 카테고리를 정적 데이터 스키마로 필수화 | 콘텐츠 검수 체크리스트 |
| REQ-FUNC-048 | IMPLEMENT | 출처명·URL·최종 확인일·편집자 필드를 정적 데이터로 기록(관리자 CRUD 화면 없이 코드로 관리) | 콘텐츠 검수 체크리스트 |
| REQ-FUNC-049 | IMPLEMENT | 외교부 해외안전여행 링크를 `noopener,noreferrer` 새 탭으로 제공 | Playwright: 링크 속성·URL 확인 |
| REQ-FUNC-050 | IMPLEMENT | 배치 작업 없이 렌더링 시점에 `verified_at` 기준 7일 경과 여부 계산해 경고 표시 | Playwright: 경과/미경과 데이터로 경고 노출 확인 |
| REQ-FUNC-051 | IMPLEMENT | 중대 경보 단계를 상단 텍스트 라벨로 표시(색상 단독 사용 금지) | Playwright + 접근성 검사 |
| REQ-FUNC-052 | IMPLEMENT | `scope_type`/`scope_text` 필드로 국가·지역 범위 구분 표시 | 콘텐츠 검수 + Playwright 렌더링 확인 |
| REQ-FUNC-053 | IMPLEMENT | 현지 긴급전화·영사콜센터 정보를 정적 데이터로 표시 | 콘텐츠 검수 체크리스트 |
| REQ-FUNC-054 | IMPLEMENT | 공식 판단 대체 불가 고지 문구를 안전 페이지와 항공 요약에 표시 | Playwright: 고지 문구 노출 확인 |
| REQ-FUNC-055 | EXCLUDED | 별도 Editor/Admin 작성·검수·게시 워크플로(CMS) 없이 개발자가 `src/data`를 직접 작성·수정 | 사유: 전체 콘텐츠 CMS 제외 |
| REQ-FUNC-056 | EXCLUDED | 이전 값·사유·담당자·시각을 포함한 변경 이력 DB 보존 기능은 만들지 않음 | 사유: 범용 감사 로그 제외, git 커밋 이력으로 대체 |

### 4-6. F6 About free_traveler (REQ-FUNC-057~063)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-057 | IMPLEMENT | 대표명·`50+ Trips`·`30+ Countries`를 단일 정적 데이터 소스로 관리해 대표 페이지·홈에 동일 표시 | Playwright: 두 위치 값 일치 확인 |
| REQ-FUNC-058 | IMPLEMENT | 확정 소개문·철학·편집 원칙을 정적 데이터로 전문 표시 | 콘텐츠 검수 체크리스트 |
| REQ-FUNC-059 | IMPLEMENT | 방문 권역 지도 또는 30개국 이상 목록을 정적 데이터로 제공 | Playwright: 목록 개수·연결 확인 |
| REQ-FUNC-060 | IMPLEMENT | 연도·장소·요약 필드를 가진 여행 타임라인 정적 데이터 | 콘텐츠 검수 체크리스트 |
| REQ-FUNC-061 | IMPLEMENT(간소화) | 대체텍스트·출처 URL 제공, 작가·라이선스 URL은 승인 워크플로 없이 텍스트 필드로만 기록 | 콘텐츠 검수 체크리스트 |
| REQ-FUNC-062 | IMPLEMENT(간소화) | 문의·SNS 링크를 관리자 CRUD 대신 설정 파일/환경변수로 관리, 빈 값은 미표시 | Playwright: 링크 표시/미표시 확인 |
| REQ-FUNC-063 | IMPLEMENT | 추천 여행지 6개를 공개 여행지 상세로 연결, 비공개 시 자동 제외 | Playwright: 링크 유효성 확인 |

### 4-7. F7 Common, Admin, Governance (REQ-FUNC-064~080)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-FUNC-064 | IMPLEMENT | 전역 내비게이션·푸터에 핵심 화면 4개+보조 화면 1개 및 정책 링크 배치 | Playwright: 2회 이내 이동 경로 확인 |
| REQ-FUNC-065 | IMPLEMENT | Tailwind CSS 기반 320px~데스크톱 반응형 레이아웃 | Playwright viewport 테스트 |
| REQ-FUNC-066 | IMPLEMENT | Supabase Auth로 이메일 가입·인증·로그인·로그아웃·비밀번호 재설정 | Playwright 인증 플로우 |
| REQ-FUNC-067 | IMPLEMENT | 여행지·안전정보 통합 검색(클라이언트 측 정적 데이터 검색) | Playwright: 통합 검색 결과 라벨 확인 |
| REQ-FUNC-068 | IMPLEMENT | 즐겨찾기를 서버 저장 없이 `localStorage`에 저장, 중복 방지 | Playwright: 중복 즐겨찾기 방지 확인 |
| REQ-FUNC-069 | IMPLEMENT | Web Share API 사용, 실패 시 URL 복사 폴백 | Playwright: 공유 버튼 동작 확인 |
| REQ-FUNC-070 | IMPLEMENT | Next.js Metadata API로 title/description/canonical/OG 제공 | Playwright/스크립트: 메타 태그 존재 확인 |
| REQ-FUNC-071 | EXCLUDED | 폼 시작·검증완료·외부클릭 등 행동 분석 이벤트 파이프라인은 구축하지 않음 | 사유: 별도 분석 인프라 구축은 장애 알림·모니터링 제외 범위와 동일 맥락으로 제외 |
| REQ-FUNC-072 | EXCLUDED | 여행지·콘텐츠 CRUD 및 미리보기, DRAFT/REVIEW/PUBLISHED 상태 관리 UI는 만들지 않음 | 사유: 전체 콘텐츠 CMS 제외 |
| REQ-FUNC-073 | EXCLUDED | 미디어 업로드 시 출처·작가·라이선스·URL·대체텍스트 필수 입력 폼은 만들지 않음 | 사유: 미디어 업로드·라이선스 승인 워크플로 제외 |
| REQ-FUNC-074 | EXCLUDED | 게시 전 완전성 게이트(자동 검증 후 PUBLISHED 전환) 기능은 만들지 않음 | 사유: 전체 콘텐츠 CMS 제외, 콘텐츠 완전성은 수동 검수 체크리스트로 대체 |
| REQ-FUNC-075 | EXCLUDED | stale 현황·담당자 대시보드는 만들지 않음, stale 표시는 공개 페이지 렌더링에서만 계산 | 사유: 전체 콘텐츠 CMS 제외 |
| REQ-FUNC-076 | EXCLUDED | actor/action/target/before/after/reason/timestamp를 포함한 감사 로그는 만들지 않음 | 사유: 범용 감사 로그 제외 |
| REQ-FUNC-077 | IMPLEMENT | 관리자 탭에서 항공·호텔 외부 URL을 HTTPS 허용목록으로 설정 | Playwright: HTTP/비허용 URL 저장 차단 확인 |
| REQ-FUNC-078 | IMPLEMENT | 404/500/권한없음/외부연결실패 화면에 홈·이전·재시도 중 최소 1개 제공 | Playwright: 오류 화면 복구 버튼 확인 |
| REQ-FUNC-079 | IMPLEMENT | 폼·모달·탭·알림에 시맨틱 HTML과 ARIA 상태 적용 | axe-core 자동 검사 + 키보드 수동 테스트 |
| REQ-FUNC-080 | IMPLEMENT | 이용약관·개인정보처리방침·동행 안전수칙·콘텐츠 면책 페이지 제공, 동행글 작성 시 정책 버전·동의 시각 저장(Supabase) | Playwright: 동의 체크 및 저장값 확인 |

### 4-8. Non-Functional — Performance (REQ-NF-001~007)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-001 | IMPLEMENT | Next.js SSR/이미지 최적화로 LCP p75 ≤2.5s 목표 대응 | Lighthouse 수동 측정 |
| REQ-NF-002 | IMPLEMENT | 경량 클라이언트 상호작용으로 INP p75 ≤200ms 목표 대응 | Lighthouse/Chrome DevTools 수동 측정 |
| REQ-NF-003 | IMPLEMENT | 레이아웃 시프트 방지(이미지 크기 지정 등)로 CLS ≤0.1 목표 대응 | Lighthouse 수동 측정 |
| REQ-NF-004 | EXCLUDED | 동시 사용자 50명 조건의 정량 부하 측정은 수행하지 않음(정적 데이터 클라이언트 필터로 체감 응답만 확보) | 사유: 부하 테스트 제외 |
| REQ-NF-005 | IMPLEMENT | Supabase 쓰기 API(글·요청·신고) 응답을 수동 측정으로 p95 ≤3s 목표 확인 | 수동 타이밍 측정 |
| REQ-NF-006 | IMPLEMENT | Next.js `<Image>`로 반응형 크기·lazy load, LCP 이미지는 `priority` | 코드 리뷰 + Lighthouse 확인 |
| REQ-NF-007 | EXCLUDED | Lighthouse Performance ≥85를 배포 전 CI 게이트로 자동화하지 않음 | 사유: 자동 성능 게이트 인프라는 부하 테스트·모니터링 제외 범위와 동일, 배포 전 수동 확인으로 대체 |

### 4-9. Non-Functional — Reliability and Recovery (REQ-NF-008~011)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-008 | EXCLUDED | 월간 가용성 99.5% SLA 측정·모니터링 체계는 구축하지 않음, Vercel 플랫폼 기본 가용성에 의존 | 사유: 자동 백업·장애 알림 제외 |
| REQ-NF-009 | EXCLUDED | 5xx 비율 모니터링·알림 체계는 구축하지 않음 | 사유: 자동 백업·장애 알림 제외 |
| REQ-NF-010 | EXCLUDED | 별도 RPO/RTO 백업 정책은 구축하지 않음, Supabase 기본 백업에 의존 | 사유: 자동 백업 제외 |
| REQ-NF-011 | EXCLUDED | 외부 링크 주 1회 자동 검사 및 Admin 알림 배치는 만들지 않음, Playwright Smoke Test 실행 시 수동 확인으로 대체 | 사유: 자동 장애 알림 제외 |

### 4-10. Non-Functional — Security and Privacy (REQ-NF-012~018)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-012 | IMPLEMENT | Vercel 기본 제공 TLS 1.2 이상 사용 | SSL 설정 확인 |
| REQ-NF-013 | IMPLEMENT | Supabase RLS 정책으로 인증·역할을 서버에서 검증 | RLS 정책 테스트 |
| REQ-NF-014 | IMPLEMENT | Next.js/Supabase 기본 CSRF 방어와 SameSite 쿠키 적용 | 보안 통합 테스트 |
| REQ-NF-015 | IMPLEMENT | 서버 액션·폼에서 입력 검증/이스케이프 적용 | OWASP 체크리스트 기반 수동 테스트 |
| REQ-NF-016 | IMPLEMENT | 비밀키는 환경변수로 관리, 클라이언트 번들 미포함 확인 | 빌드 산출물 검사 |
| REQ-NF-017 | IMPLEMENT | 항공·호텔 원시 입력값 서버·분석 미보존(클라이언트 상태로만 처리) | 네트워크·DB 로그 검사 |
| REQ-NF-018 | EXCLUDED | 개인정보 내보내기/탈퇴/삭제 요청 자동화 파이프라인은 만들지 않음 | 사유: REQ-FUNC-045와 동일하게 자동 삭제 파이프라인은 MVP 범위 밖 |

### 4-11. Non-Functional — Safety and Moderation (REQ-NF-019~022)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-019 | IMPLEMENT | 신고 접수 API 응답 목표 p95 ≤3s | 수동 타이밍 측정 |
| REQ-NF-020 | EXCLUDED | 24시간 이내 90% 1차 검토 SLA 측정 대시보드는 만들지 않음, 신고 상태값(OPEN 등)만 관리자 탭에서 확인 | 사유: 범용 감사 로그·운영 지표 모니터링 제외 |
| REQ-NF-021 | EXCLUDED | 서버 측 속도 제한(429) 인프라는 구축하지 않음, 클라이언트 중복 제출 방지만 적용 | 사유: 부하 대응 인프라는 부하 테스트 제외 범위와 동일 |
| REQ-NF-022 | EXCLUDED | Moderator 조치의 감사 로그 추적성은 제공하지 않음 | 사유: 범용 감사 로그 제외 |

### 4-12. Non-Functional — Accessibility (REQ-NF-023~025)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-023 | IMPLEMENT | WCAG 2.2 Level AA를 목표로 컴포넌트 설계 | 코드 리뷰 + axe 검사 |
| REQ-NF-024 | IMPLEMENT | Playwright + axe-core로 자동 접근성 검사 실행 | Playwright axe 통합 테스트(serious/critical 0건 목표) |
| REQ-NF-025 | IMPLEMENT | 핵심 사용자 흐름에 대해 키보드·스크린리더 수동 검사 수행 | 수동 QA 체크리스트 |

### 4-13. Non-Functional — Content, Freshness, SEO, Copyright (REQ-NF-026~030)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-026 | IMPLEMENT | 게시 콘텐츠는 필수 필드를 모두 채운 상태로 정적 데이터에 등록 | 콘텐츠 검수 체크리스트 |
| REQ-NF-027 | IMPLEMENT | 소개 해외 국가 100% 안전정보 페이지 시드 | 데이터 개수 검증 스크립트 |
| REQ-NF-028 | IMPLEMENT | 렌더링 시 `verified_at` 기준 stale 계산·경고 표시 | Playwright 경고 노출 확인 |
| REQ-NF-029 | EXCLUDED | 라이선스 타입·라이선스 URL 등 전체 메타데이터 100% 충족은 관리하지 않음, alt_text와 출처 URL만 필수로 관리 | 사유: 미디어 업로드·라이선스 승인 워크플로 제외 |
| REQ-NF-030 | IMPLEMENT | 공개 페이지 SEO 메타데이터(REQ-FUNC-070) 누락 여부 점검 | 스크립트/수동 메타 태그 점검 |

### 4-14. Non-Functional — Maintainability, Monitoring, Cost (REQ-NF-031~034)

| ID | 분류 | 처리 방법 | 확인 방법 |
|---|---|---|---|
| REQ-NF-031 | IMPLEMENT | TypeScript strict, ESLint, 단위 테스트를 병합 전 수동 실행 | `npm run lint`, `tsc --noEmit`, 단위 테스트 실행 |
| REQ-NF-032 | EXCLUDED | request_id 등 구조화 로그 수집 체계는 구축하지 않음, Vercel 기본 로그만 사용 | 사유: 운영 로깅 인프라는 장애 알림·모니터링 제외 범위와 동일 |
| REQ-NF-033 | EXCLUDED | 5xx>1% 또는 외부 링크 실패 시 5분 이내 알림 체계는 구축하지 않음 | 사유: 자동 장애 알림 제외 |
| REQ-NF-034 | IMPLEMENT | Vercel + Supabase(무료/저가 티어 지향)만 사용해 월 인프라 비용 목표(10만원 이하) 충족 | 요금제·사용량 확인 |

---

## 5. 검사 요약

- REQ-FUNC-001~080: 총 80건 기록 완료 (IMPLEMENT 71건, EXCLUDED 9건: 045, 055, 056, 071, 072, 073, 074, 075, 076)
- REQ-NF-001~034: 총 34건 기록 완료 (IMPLEMENT 21건, EXCLUDED 13건: 004, 007, 008, 009, 010, 011, 018, 020, 021, 022, 029, 032, 033)
