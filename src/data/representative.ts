/**
 * 대표(free_traveler) 프로필 정적 데이터 (REQ-FUNC-057~063).
 *
 * 대표명·경력 통계는 대표 소개 화면(SCR-002)과 메인 화면(SCR-001) 양쪽에서
 * 이 파일 하나만 참조해 항상 같은 값을 표시한다(REQ-FUNC-057). 문의·SNS 링크는
 * 관리자 CRUD 없이 환경변수로만 관리하며, 값이 없으면 화면에 표시하지 않는다(REQ-FUNC-062).
 */

import { DESTINATIONS, type Destination } from "./destinations";

export interface TimelineEntry {
  year: number;
  place: string;
  summary: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  /** 이미지 출처 URL(REQ-FUNC-061). 자체 촬영본은 대표 본인 채널을 출처로 기록한다. */
  sourceUrl: string;
  /** 작가·라이선스 정보를 승인 워크플로 없이 텍스트로만 기록한다(REQ-FUNC-061 간소화). */
  attribution: string;
}

export interface ContactLink {
  label: string;
  url: string;
}

export const REPRESENTATIVE_NAME = "free_traveler";

export const REPRESENTATIVE_STATS = {
  tripsCount: 50,
  tripsLabel: "50+ Trips",
  countriesCount: 30,
  countriesLabel: "30+ Countries",
};

export const REPRESENTATIVE_INTRO =
  "free_traveler는 50회 이상의 자유여행으로 30개국 이상을 경험한 여행 큐레이터다. 유명 명소만 나열하기보다 이동 동선, 머무는 시간, 여행자의 체력, 안전정보까지 함께 살피는 여행을 지향한다. 처음 해외여행을 준비하는 사람도 목적지와 일정을 스스로 결정할 수 있도록 여행지의 장점뿐 아니라 불편한 점과 주의할 점을 함께 소개한다.";

export const REPRESENTATIVE_PHILOSOPHY =
  "여행지를 소개할 때는 사진이 예쁜 순간보다 그 장소에 도착하기까지의 이동 시간과 비용, 머무는 동안의 체력 소모, 그리고 안전하게 다닐 수 있는 방법을 먼저 정리한다. 추천 목록에 순위나 별점을 매기지 않으며, 실제로 걸어보고 머물러본 곳만 콘텐츠로 옮긴다. 여행은 자랑거리가 아니라 각자의 속도로 세상을 이해하는 방법이라고 믿기 때문에, 화려한 순간보다 여행자가 실제로 마주할 불편함과 대안까지 함께 적는 편집 원칙을 지킨다.";

export const REPRESENTATIVE_TIMELINE: TimelineEntry[] = [
  {
    year: 2014,
    place: "동남아시아 배낭여행",
    summary:
      "태국·베트남을 두 달간 육로로 이동하며 저예산 장기 여행의 기본기를 익힌 첫 해외 자유여행.",
  },
  {
    year: 2016,
    place: "서유럽 6개국 철도 여행",
    summary:
      "유레일 패스로 프랑스·스위스·이탈리아 등을 이동하며 도시 간 이동과 일정 설계에 대한 노하우를 쌓았다.",
  },
  {
    year: 2018,
    place: "동유럽·발칸반도 일주",
    summary:
      "체코·오스트리아를 거쳐 튀르키예까지 이어지는 여정에서 국경을 넘는 육로 이동의 실용적 팁을 정리했다.",
  },
  {
    year: 2019,
    place: "일본 지방 소도시 답사",
    summary:
      "도쿄·오사카를 넘어 지방 소도시까지 방문하며 대도시 중심이 아닌 여행 코스를 실험했다.",
  },
  {
    year: 2021,
    place: "국내 구석구석 재발견",
    summary:
      "해외 이동이 어려운 시기 국내 10여 개 지역을 다시 답사하며 국내 여행 콘텐츠의 기초 자료를 모았다.",
  },
  {
    year: 2023,
    place: "동남아시아·오세아니아 재방문",
    summary:
      "말레이시아·오스트레일리아 등을 다시 찾아 이전 방문 정보를 갱신하고 안전정보 최신화 작업을 시작했다.",
  },
  {
    year: 2025,
    place: "누적 30개국·50회 여행 달성",
    summary:
      "10년간의 여행을 정리해 누적 30개국, 50회 이상의 자유여행 기록을 완성하고 free_traveler 콘텐츠 체계를 구축했다.",
  },
];

/** 방문 국가 목록(30개국 이상, REQ-FUNC-059). */
export const REPRESENTATIVE_VISITED_COUNTRIES: string[] = [
  "대한민국",
  "일본",
  "베트남",
  "태국",
  "대만",
  "말레이시아",
  "싱가포르",
  "인도네시아",
  "필리핀",
  "캄보디아",
  "라오스",
  "이탈리아",
  "프랑스",
  "스페인",
  "영국",
  "독일",
  "포르투갈",
  "그리스",
  "튀르키예",
  "스위스",
  "오스트리아",
  "체코",
  "헝가리",
  "네덜란드",
  "크로아티아",
  "슬로베니아",
  "폴란드",
  "아이슬란드",
  "오스트레일리아",
  "뉴질랜드",
  "미국",
  "캐나다",
];

/** 대표 소개 갤러리(8개 이상, REQ-FUNC-061). 실제 사진 파일은 콘텐츠 검수 단계에서 채운다. */
export const REPRESENTATIVE_GALLERY: GalleryImage[] = [
  {
    url: "/images/representative/gallery-01.jpg",
    alt: "동남아시아 배낭여행 당시 시장 골목을 걷는 모습",
    sourceUrl: "/images/representative/gallery-01.jpg",
    attribution: "free_traveler 자체 촬영(2014)",
  },
  {
    url: "/images/representative/gallery-02.jpg",
    alt: "유럽 철도 여행 중 기차 플랫폼에서의 모습",
    sourceUrl: "/images/representative/gallery-02.jpg",
    attribution: "free_traveler 자체 촬영(2016)",
  },
  {
    url: "/images/representative/gallery-03.jpg",
    alt: "발칸반도 산악 지형을 배경으로 한 트레킹 모습",
    sourceUrl: "/images/representative/gallery-03.jpg",
    attribution: "free_traveler 자체 촬영(2018)",
  },
  {
    url: "/images/representative/gallery-04.jpg",
    alt: "일본 지방 소도시의 전통 거리 풍경",
    sourceUrl: "/images/representative/gallery-04.jpg",
    attribution: "free_traveler 자체 촬영(2019)",
  },
  {
    url: "/images/representative/gallery-05.jpg",
    alt: "국내 해안 지역 답사 중 촬영한 해변 풍경",
    sourceUrl: "/images/representative/gallery-05.jpg",
    attribution: "free_traveler 자체 촬영(2021)",
  },
  {
    url: "/images/representative/gallery-06.jpg",
    alt: "오세아니아 재방문 중 도심 스카이라인 풍경",
    sourceUrl: "/images/representative/gallery-06.jpg",
    attribution: "free_traveler 자체 촬영(2023)",
  },
  {
    url: "/images/representative/gallery-07.jpg",
    alt: "여행 기록 노트와 지도를 펼쳐놓은 작업 모습",
    sourceUrl: "/images/representative/gallery-07.jpg",
    attribution: "free_traveler 자체 촬영(2024)",
  },
  {
    url: "/images/representative/gallery-08.jpg",
    alt: "누적 30개국 방문을 기념해 정리한 여행 기록 페이지",
    sourceUrl: "/images/representative/gallery-08.jpg",
    attribution: "free_traveler 자체 촬영(2025)",
  },
];

/** 대표 소개 하단에 연결하는 추천 여행지 ID(6개, REQ-FUNC-063). */
export const RECOMMENDED_DESTINATION_IDS: string[] = [
  "seoul",
  "jeju",
  "tokyo",
  "paris",
  "santorini",
  "sydney",
];

/** 추천 여행지 ID를 실제 여행지 데이터로 변환한다. 존재하지 않거나 비공개인 ID는 자동 제외한다(REQ-FUNC-063). */
export function getRecommendedDestinations(): Destination[] {
  const byId = new Map(
    DESTINATIONS.map((destination) => [destination.id, destination]),
  );
  return RECOMMENDED_DESTINATION_IDS.map((id) => byId.get(id)).filter(
    (destination): destination is Destination => destination !== undefined,
  );
}

/**
 * 문의·SNS 링크(REQ-FUNC-062). 관리자 CRUD 대신 환경변수로만 관리하며,
 * 값이 설정되지 않은 링크는 결과 배열에서 제외해 화면에 표시되지 않게 한다.
 */
export function getRepresentativeContactLinks(): ContactLink[] {
  const email = process.env.REPRESENTATIVE_CONTACT_EMAIL;
  const candidates: ContactLink[] = [
    { label: "이메일", url: email ? `mailto:${email}` : "" },
    {
      label: "인스타그램",
      url: process.env.REPRESENTATIVE_INSTAGRAM_URL ?? "",
    },
    { label: "유튜브", url: process.env.REPRESENTATIVE_YOUTUBE_URL ?? "" },
    { label: "블로그", url: process.env.REPRESENTATIVE_BLOG_URL ?? "" },
  ];
  return candidates.filter((link) => link.url.length > 0);
}
