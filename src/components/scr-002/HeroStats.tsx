import { OptimizedImage } from "@/components/shared/OptimizedImage";
import {
  REPRESENTATIVE_GALLERY,
  REPRESENTATIVE_INTRO,
  REPRESENTATIVE_NAME,
  REPRESENTATIVE_STATS,
  REPRESENTATIVE_VISITED_COUNTRIES,
} from "@/data/representative";

/**
 * 국가명 → 권역 매핑. `REPRESENTATIVE_VISITED_COUNTRIES`(다른 완료된 Task 소유 파일)에는
 * 권역 필드가 없어, 이 Component 안에서만 지표 카드 3번째 값을 계산하기 위한 로컬 매핑이다.
 * PRD의 "여행 권역: 아시아, 유럽, 북미, 오세아니아 중심" 서술과 일치한다.
 */
const COUNTRY_REGION_MAP: Record<string, string> = {
  대한민국: "아시아",
  일본: "아시아",
  베트남: "아시아",
  태국: "아시아",
  대만: "아시아",
  말레이시아: "아시아",
  싱가포르: "아시아",
  인도네시아: "아시아",
  필리핀: "아시아",
  캄보디아: "아시아",
  라오스: "아시아",
  이탈리아: "유럽",
  프랑스: "유럽",
  스페인: "유럽",
  영국: "유럽",
  독일: "유럽",
  포르투갈: "유럽",
  그리스: "유럽",
  튀르키예: "유럽",
  스위스: "유럽",
  오스트리아: "유럽",
  체코: "유럽",
  헝가리: "유럽",
  네덜란드: "유럽",
  크로아티아: "유럽",
  슬로베니아: "유럽",
  폴란드: "유럽",
  아이슬란드: "유럽",
  오스트레일리아: "오세아니아",
  뉴질랜드: "오세아니아",
  미국: "북미",
  캐나다: "북미",
};

function countVisitedRegions(): number {
  const regions = new Set(
    REPRESENTATIVE_VISITED_COUNTRIES.map(
      (country) => COUNTRY_REGION_MAP[country] ?? "기타",
    ),
  );
  return regions.size;
}

/**
 * SCR-002 ① 프로필 Hero + 여행 지표(REQ-FUNC-057). `/`(SCR-001)와 동일한
 * `src/data/representative.ts` 값을 사용해 항상 같은 수치를 보여준다.
 * Hero는 뷰포트 전체를 채우지 않아 다음 Section 상단이 보인다.
 */
export function HeroStats() {
  const heroImage = REPRESENTATIVE_GALLERY[0];
  const regionCount = countVisitedRegions();

  return (
    <section className="flex min-h-[420px] flex-col items-center gap-8 px-4 py-16 text-center md:min-h-[480px]">
      <div className="relative h-48 w-48 overflow-hidden rounded-[16px]">
        <OptimizedImage
          src={heroImage.url}
          alt={heroImage.alt}
          fill
          className="object-cover"
          isPriority
          sizes="192px"
        />
      </div>

      <div>
        <h1 className="text-[32px] font-bold text-[#2B2A28]">
          {REPRESENTATIVE_NAME}
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[16px] leading-[1.6] text-[#2B2A28]">
          {REPRESENTATIVE_INTRO}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-[16px] border border-[#E4E1DC] px-4 py-3">
          <p className="text-[24px] font-bold text-[#F0653C]">
            {REPRESENTATIVE_STATS.tripsLabel}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E4E1DC] px-4 py-3">
          <p className="text-[24px] font-bold text-[#F0653C]">
            {REPRESENTATIVE_STATS.countriesLabel}
          </p>
        </div>
        <div className="rounded-[16px] border border-[#E4E1DC] px-4 py-3">
          <p className="text-[24px] font-bold text-[#F0653C]">
            {regionCount}개 권역
          </p>
        </div>
      </div>
    </section>
  );
}
