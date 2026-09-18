"use client";

import { COUNTRY_SAFETY, isSafetyStale } from "@/data/safety";

const CARDS_COUNT = 6;

interface SafetyGridProps {
  /**
   * 카드 클릭 시 호출한다. Optional — Server Component(`PAGE-SCR001`)는 Client
   * Component에 함수를 prop으로 전달할 수 없어(RSC 직렬화 제약) 생략하고 렌더링할
   * 수 있어야 한다. 생략되면 클릭해도 아무 동작을 하지 않는다.
   */
  onSelectCountry?: (countrySlug: string) => void;
}

/**
 * SCR-001 ④ 국가별 주의사항 Card Grid(REQ-FUNC-047/048/050). 시드 기준 6개 카드를
 * 보여주며, 최종 확인 7일 초과 국가는 stale 경고 배지를 텍스트로 함께 표시한다
 * (색상 단독 구분 금지).
 */
export function SafetyGrid({ onSelectCountry }: SafetyGridProps) {
  const countries = COUNTRY_SAFETY.slice(0, CARDS_COUNT);

  return (
    <section aria-labelledby="safety-grid-heading">
      <h2
        id="safety-grid-heading"
        className="mb-4 text-[24px] font-bold text-[#2B2A28]"
      >
        국가별 주의사항
      </h2>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {countries.map((country) => {
          const stale = isSafetyStale(country.verifiedAt);
          return (
            <li key={country.countrySlug} className="list-none">
              <button
                type="button"
                onClick={() => onSelectCountry?.(country.countrySlug)}
                className="block w-full rounded-[16px] border border-[#E4E1DC] p-4 text-left"
              >
                <span className="text-[18px] font-semibold text-[#2B2A28]">
                  {country.countryName}
                </span>
                <p className="mt-1 text-[13px] text-[#1F4B8F]">안전정보 보기</p>
                {stale ? (
                  <p className="mt-2 text-[13px] font-semibold text-[#B7791F]">
                    최신 정보 재확인 필요(최종 확인 7일 초과)
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
