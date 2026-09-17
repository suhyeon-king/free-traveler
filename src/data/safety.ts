/**
 * 국가별 안전정보 정적 데이터(해외 15개국 전체, REQ-FUNC-046/048, REQ-NF-027/028).
 *
 * 소개된 해외 15개국(`src/data/destinations.ts`의 `countrySlug`와 동일한 값) 전체에
 * 8개 안전 카테고리(치안·흔한 사기·현지 법규·교통·재난·기후·보건·문화·복장·긴급연락처)와
 * 출처명·출처 URL·최종 확인일(`verifiedAt`)·편집자 필드를 빠짐없이 채운다.
 * 이 데이터는 공식 판단을 대체하지 않으며, 출국 전 출처 원문을 반드시 재확인해야 한다.
 */

export type SafetyCategoryKey =
  | "security"
  | "scams"
  | "law"
  | "transport"
  | "disasterClimate"
  | "health"
  | "cultureDress"
  | "emergencyContacts";

export const SAFETY_CATEGORY_LABELS: Record<SafetyCategoryKey, string> = {
  security: "치안",
  scams: "흔한 사기",
  law: "현지 법규",
  transport: "교통",
  disasterClimate: "재난·기후",
  health: "보건",
  cultureDress: "문화·복장",
  emergencyContacts: "긴급연락처",
};

/** 카테고리 표시 순서(8개, REQ-FUNC-047 기준). */
export const SAFETY_CATEGORY_ORDER: SafetyCategoryKey[] = [
  "security",
  "scams",
  "law",
  "transport",
  "disasterClimate",
  "health",
  "cultureDress",
  "emergencyContacts",
];

export type SafetyCategories = Record<SafetyCategoryKey, string>;

export interface CountrySafety {
  /** `src/data/destinations.ts`의 `countrySlug`와 동일한 값. */
  countrySlug: string;
  countryName: string;
  categories: SafetyCategories;
  sourceName: string;
  sourceUrl: string;
  /** ISO 8601 날짜. 마지막으로 출처를 대조·확인한 날짜. */
  verifiedAt: string;
  editor: string;
}

const OFFICIAL_SOURCE_NAME = "대한민국 외교부 해외안전여행(0404)";
const OFFICIAL_SOURCE_URL = "https://www.0404.go.kr/";
const VERIFIED_AT = "2026-09-17";
const EDITOR = "free_traveler";

export const COUNTRY_SAFETY: CountrySafety[] = [
  {
    countrySlug: "japan",
    countryName: "일본",
    categories: {
      security:
        "전반적으로 치안이 안정적이나 대도시 번화가 심야 시간에는 소지품 관리에 주의한다.",
      scams:
        "관광지 인근 고가 청구 유흥업소 유인, 가짜 티켓 판매 등의 사례가 보고된다.",
      law: "공공장소 흡연 제한 구역이 많고 일부 의약품 성분(감기약 등)의 반입이 제한될 수 있다.",
      transport:
        "대중교통은 정확하고 안전한 편이나 태풍·폭설 시 열차가 대규모로 지연·운휴될 수 있다.",
      disasterClimate:
        "지진·태풍이 빈번한 지역이라 호텔 내 비상 대피로를 미리 확인하는 것이 권장된다.",
      health:
        "의료 수준은 높지만 진료비가 비싼 편이라 해외여행자보험 가입이 권장된다.",
      cultureDress:
        "온천·사찰 등에서는 문신 노출 제한이나 복장 규정이 있는 시설이 있다.",
      emergencyContacts:
        "긴급전화 경찰 110/구급 119, 주일본 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "vietnam",
    countryName: "베트남",
    categories: {
      security:
        "대체로 안전하나 관광지 밀집 구역에서 소매치기·오토바이 날치기 사례가 있다.",
      scams:
        "택시 미터기 조작, 환전 사기, 과다 요금 청구 등이 보고되어 공인 업체 이용이 권장된다.",
      law: "마약류에 대한 처벌이 매우 엄격하며 소지·투약 시 강력한 형사처벌을 받을 수 있다.",
      transport:
        "오토바이 통행량이 많아 도로 횡단·이동 시 각별한 주의가 필요하다.",
      disasterClimate:
        "우기(5~10월)에는 집중호우와 홍수, 태풍의 영향을 받을 수 있다.",
      health: "뎅기열 등 모기 매개 질병 예방을 위해 방역 조치가 권장된다.",
      cultureDress: "사찰·사원 방문 시 어깨와 무릎을 가리는 복장이 요구된다.",
      emergencyContacts:
        "긴급전화 경찰 113/구급 115, 주베트남 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "thailand",
    countryName: "태국",
    categories: {
      security:
        "관광지는 대체로 안전하나 야간 유흥가 주변 시비·다툼에 연루되지 않도록 주의한다.",
      scams:
        "보석·투어 상품 사기, 미터기 없는 택시 과다 요금 등의 사례가 알려져 있다.",
      law: "왕실 모독죄가 엄격히 처벌되며 관련 언행·게시물에 주의해야 한다.",
      transport:
        "툭툭·오토바이 택시 이용 시 사고 위험이 있어 헬멧 착용과 안전벨트를 확인한다.",
      disasterClimate:
        "우기(6~10월) 집중호우로 인한 홍수, 남부 해안 지역은 계절풍 영향을 받는다.",
      health:
        "뎅기열 등 열대성 질병 예방 조치가 권장되며 대도시 의료 수준은 양호하다.",
      cultureDress:
        "사원 방문 시 노출이 적은 복장이 필요하며 신발을 벗어야 하는 구역이 있다.",
      emergencyContacts:
        "긴급전화 경찰 191/관광경찰 1155, 주태국 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "taiwan",
    countryName: "대만",
    categories: {
      security:
        "치안이 매우 안정적인 편이며 강력범죄 발생률이 낮은 것으로 알려져 있다.",
      scams:
        "관광지 대비 사기 사례는 적은 편이나 일부 야시장 환전상 이용 시 환율을 확인하는 것이 좋다.",
      law: "전자담배 등 일부 품목의 반입이 제한되며 마약류 처벌이 엄격하다.",
      transport:
        "대중교통이 정확하고 안전하나 태풍 시 철도·항공편이 대거 결항될 수 있다.",
      disasterClimate:
        "지진과 태풍이 빈번해 계절과 시기에 따라 기상 특보를 확인해야 한다.",
      health:
        "의료 수준이 높고 접근성이 좋아 여행자에게 비교적 안전한 지역으로 평가된다.",
      cultureDress:
        "사원 등 종교 시설에서는 정숙한 태도와 단정한 복장이 요구된다.",
      emergencyContacts:
        "긴급전화 경찰 110/구급 119, 주타이베이 대한민국 대표부 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "malaysia",
    countryName: "말레이시아",
    categories: {
      security:
        "대도시는 대체로 안전하나 야간 인적이 드문 구역에서는 소매치기에 주의한다.",
      scams: "가짜 여행사 상품, 신용카드 복제 등 사기 사례가 보고된다.",
      law: "마약류 소지·유통에 대해 사형을 포함한 매우 엄격한 처벌이 적용된다.",
      transport:
        "대중교통은 대도시 중심으로 잘 갖춰져 있으나 지방은 대중교통 인프라가 제한적이다.",
      disasterClimate:
        "우기(11~2월 동해안 중심)에 홍수 위험이 있으며 열대성 기후로 습도가 높다.",
      health:
        "뎅기열 등 매개 감염병 주의가 필요하며 도심 의료 수준은 양호하다.",
      cultureDress:
        "이슬람 문화권 특성상 사원 방문 시 노출이 적은 복장과 여성용 스카프가 필요할 수 있다.",
      emergencyContacts:
        "긴급전화 경찰·구급 999, 주말레이시아 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "italy",
    countryName: "이탈리아",
    categories: {
      security:
        "전반적으로 안전하나 로마·밀라노 등 대도시 관광지에서 소매치기가 빈번하다.",
      scams:
        "가짜 장미 판매, 팔찌 강매, 소매치기를 위한 접근 등 관광객 대상 수법이 다양하다.",
      law: "문화유산 훼손(낙서 등)에 대한 벌금이 매우 높게 부과될 수 있다.",
      transport:
        "기차·지하철은 대체로 안전하나 혼잡한 역 구내에서 소지품 관리가 중요하다.",
      disasterClimate:
        "지역에 따라 지진 위험이 있으며 여름철 폭염 경보가 발생하기도 한다.",
      health:
        "의료 수준이 높은 편이며 EU 국가로서 응급 의료 접근성이 양호하다.",
      cultureDress:
        "성당 방문 시 어깨와 무릎을 가리는 복장이 요구되는 곳이 많다.",
      emergencyContacts:
        "긴급전화 통합 112, 주이탈리아 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "france",
    countryName: "프랑스",
    categories: {
      security:
        "관광지 전반은 안전하나 파리 주요 명소·대중교통에서 소매치기 사례가 잦다.",
      scams:
        "서명 청원 사기, 팔찌 강매, 가짜 설문조사를 이용한 접근 등이 알려져 있다.",
      law: "공공장소 마스크 착용 등 시기별 규정이 바뀔 수 있어 최신 공지를 확인해야 한다.",
      transport: "대중교통 파업이 종종 발생해 여행 일정에 영향을 줄 수 있다.",
      disasterClimate:
        "지역별 기후 차이가 크며 여름철 폭염 경보가 발생하기도 한다.",
      health: "의료 수준이 높은 편이며 응급 시 EU 통합 응급번호로 연결된다.",
      cultureDress: "성당 등 종교 시설 방문 시 단정한 복장이 권장된다.",
      emergencyContacts:
        "긴급전화 통합 112, 주프랑스 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "spain",
    countryName: "스페인",
    categories: {
      security:
        "대도시 관광지 중심으로 소매치기·가방 날치기 사례가 잦아 소지품 관리가 중요하다.",
      scams: "거리 공연·기부 강요, 가짜 경찰 사칭 등의 사기 수법이 보고된다.",
      law: "일부 지역에서 공공장소 음주에 대한 규제가 있을 수 있다.",
      transport:
        "대중교통은 안전한 편이나 혼잡한 지하철·버스 내 소매치기에 주의해야 한다.",
      disasterClimate:
        "여름철 남부 지역은 폭염이 심하며 산불 위험이 있는 시기가 있다.",
      health:
        "의료 수준이 높은 편이며 EU 통합 응급번호로 응급 서비스에 접근할 수 있다.",
      cultureDress:
        "성당 등 종교 시설 방문 시 단정한 복장이 요구되는 경우가 많다.",
      emergencyContacts:
        "긴급전화 통합 112, 주스페인 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "uk",
    countryName: "영국",
    categories: {
      security:
        "전반적으로 안전하나 대도시 일부 구역에서 소매치기·휴대폰 날치기 사례가 있다.",
      scams:
        "가짜 티켓 판매, 거리 설문조사를 이용한 접근 등의 수법이 알려져 있다.",
      law: "공공장소 음주 제한 구역이 있으며 지역별 조례가 다를 수 있다.",
      transport:
        "지하철·버스는 안전한 편이나 혼잡 시간대 소지품 관리에 주의가 필요하다.",
      disasterClimate:
        "대체로 온화하나 겨울철 폭풍이나 홍수 경보가 발생할 수 있다.",
      health: "의료 수준이 높으며 응급 상황 시 통합 응급번호로 연결된다.",
      cultureDress:
        "종교 시설 방문 시 단정한 복장이 권장되며 특별한 규제는 크지 않다.",
      emergencyContacts:
        "긴급전화 통합 999(또는 112), 주영국 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "germany",
    countryName: "독일",
    categories: {
      security:
        "전반적으로 안전한 편이나 대도시 중앙역 인근에서 소매치기에 주의해야 한다.",
      scams:
        "가짜 자선단체 서명 요청, 거리 게임을 이용한 금품 요구 등의 사례가 있다.",
      law: "나치 상징물 관련 표현이나 특정 극단주의 표현물은 법적으로 엄격히 금지된다.",
      transport:
        "대중교통은 정확하고 안전한 편이며 도시 간 이동은 기차가 편리하다.",
      disasterClimate:
        "대체로 온화하나 겨울철 폭설·결빙으로 인한 교통 지연이 발생할 수 있다.",
      health:
        "의료 수준이 높으며 EU 통합 응급번호로 응급 서비스 접근이 가능하다.",
      cultureDress:
        "특별한 복장 규정은 적으나 종교 시설 방문 시 단정한 옷차림이 권장된다.",
      emergencyContacts:
        "긴급전화 통합 112, 주독일 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "portugal",
    countryName: "포르투갈",
    categories: {
      security:
        "유럽 내에서도 치안이 안정적인 편으로 평가되나 관광지 소매치기는 주의가 필요하다.",
      scams: "택시 요금 과다 청구, 관광지 주변 호객 행위 등이 보고된다.",
      law: "경범죄에 대한 처벌은 일반적인 유럽 국가 수준이며 특별한 특이 규정은 적다.",
      transport:
        "트램·지하철은 대체로 안전하나 혼잡 시간대 소지품 관리가 필요하다.",
      disasterClimate:
        "여름철 산불 위험이 있는 지역이 있으며 대체로 온화한 기후다.",
      health:
        "의료 수준이 양호하며 EU 통합 응급번호로 응급 서비스에 접근할 수 있다.",
      cultureDress: "성당 등 종교 시설 방문 시 단정한 복장이 권장된다.",
      emergencyContacts:
        "긴급전화 통합 112, 주포르투갈 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "greece",
    countryName: "그리스",
    categories: {
      security:
        "관광지는 대체로 안전하나 대도시 중심가에서 소매치기 사례가 발생한다.",
      scams: "택시 미터기 조작, 식당 과다 요금 청구 등의 사례가 보고된다.",
      law: "고대 유적지에서 유물 무단 반출은 강력히 처벌되는 중대 범죄로 취급된다.",
      transport:
        "여객선 이동이 많은 지역 특성상 기상 악화 시 결항이 자주 발생한다.",
      disasterClimate:
        "여름철 폭염과 산불 위험이 높은 편이며 지진 발생 가능 지역이다.",
      health:
        "본토 대도시는 의료 수준이 양호하나 소규모 섬은 의료시설이 제한적이다.",
      cultureDress: "정교회 성당 방문 시 어깨와 무릎을 가리는 복장이 요구된다.",
      emergencyContacts:
        "긴급전화 통합 112, 주그리스 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "turkiye",
    countryName: "튀르키예",
    categories: {
      security:
        "주요 관광지는 대체로 안전하나 국경 접경 지역은 여행경보 대상일 수 있어 사전 확인이 필요하다.",
      scams: "카펫·보석 판매 강매, 환전 사기 등 관광객 대상 수법이 보고된다.",
      law: "정치적 발언이나 시위 관련 행위는 법적으로 민감하게 다뤄질 수 있다.",
      transport:
        "대도시 대중교통은 양호하나 장거리 버스·페리는 기상에 영향을 받을 수 있다.",
      disasterClimate:
        "지진 발생 위험이 높은 지역이 있어 건물 안전 상태를 확인하는 것이 좋다.",
      health:
        "대도시 의료 수준은 양호하나 지방은 의료 접근성이 제한적일 수 있다.",
      cultureDress:
        "모스크 방문 시 신발을 벗고 여성은 머리를 가리는 복장 규정이 있다.",
      emergencyContacts:
        "긴급전화 통합 112, 주튀르키예 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "switzerland",
    countryName: "스위스",
    categories: {
      security:
        "치안이 매우 안정적인 편이며 강력범죄 발생률이 낮은 것으로 알려져 있다.",
      scams:
        "관광지 대상 사기 사례는 적은 편이나 고가 렌털 장비 이용 시 약관을 꼼꼼히 확인해야 한다.",
      law: "경범죄에 대한 벌금이 상대적으로 높게 책정되는 편이다.",
      transport:
        "산악 지형 특성상 기상 악화 시 산악열차·케이블카 운행이 중단될 수 있다.",
      disasterClimate:
        "산악 지역은 눈사태·낙석 위험이 있어 지정 탐방로 준수가 중요하다.",
      health:
        "의료 수준이 매우 높으나 진료비가 비싼 편이라 여행자보험 가입이 권장된다.",
      cultureDress:
        "특별한 복장 규정은 적으나 종교 시설 방문 시 단정한 옷차림이 권장된다.",
      emergencyContacts:
        "긴급전화 경찰 117/구급 144, 주스위스 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
  {
    countrySlug: "australia",
    countryName: "오스트레일리아",
    categories: {
      security:
        "전반적으로 치안이 안정적이나 대도시 유흥가 심야 시간에는 주의가 필요하다.",
      scams:
        "가짜 임대주택·투자 사기, 전화 금융사기 등 관광객보다 체류자 대상 사례가 보고된다.",
      law: "야생동물 보호 규정이 엄격하며 검역·반입 금지 품목 규정이 매우 까다롭다.",
      transport:
        "대중교통은 안전한 편이나 장거리 도로 이동 시 야생동물 출현에 주의해야 한다.",
      disasterClimate:
        "여름철 산불과 해파리·상어 등 해양 위험 요소에 대한 안내를 확인해야 한다.",
      health:
        "의료 수준이 높은 편이며 강한 자외선으로 인한 피부 화상 주의가 필요하다.",
      cultureDress:
        "특별한 복장 규정은 적으나 해변에서는 지정 안전 구역을 지켜야 한다.",
      emergencyContacts:
        "긴급전화 통합 000, 주오스트레일리아 대한민국 대사관 영사콜센터를 통해 연결 가능하다.",
    },
    sourceName: OFFICIAL_SOURCE_NAME,
    sourceUrl: OFFICIAL_SOURCE_URL,
    verifiedAt: VERIFIED_AT,
    editor: EDITOR,
  },
];

export function getCountrySafety(
  countrySlug: string,
): CountrySafety | undefined {
  return COUNTRY_SAFETY.find((entry) => entry.countrySlug === countrySlug);
}

/** `verifiedAt` 기준으로 지정한 기간(기본 7일, REQ-NF-028)이 지났는지 계산한다. */
export function isSafetyStale(verifiedAt: string, staleDays = 7): boolean {
  const verifiedTime = new Date(verifiedAt).getTime();
  const diffMs = Date.now() - verifiedTime;
  return diffMs > staleDays * 24 * 60 * 60 * 1000;
}
