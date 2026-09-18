import Link from "next/link";

import { REPRESENTATIVE_VISITED_COUNTRIES } from "@/data/representative";
import { FOCUS_RING_CLASS_NAME } from "@/lib/a11y";

/**
 * 국가명 → 권역 매핑(로컬 사본). `CMP-SCR002-HERO-STATS`와 동일한 PRD 기준
 * ("아시아/유럽/북미/오세아니아")을 사용하지만 파일 범위가 달라 별도로 유지한다.
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

const REGION_ORDER = ["아시아", "유럽", "북미", "오세아니아"];

/**
 * SCR-002 ⑤ 방문 국가 Chip(권역별, REQ-FUNC-059). 30개국 이상을 권역별로
 * 그룹화해 Chip으로 보여주고, 클릭 시 SCR-001의 해외 국가 필터로 이동한다
 * (`/?country=<국가명>` — `CMP-SCR001-DESTINATIONS`가 이미 읽는 필터 파라미터를
 * 재사용해 실제로 해당 국가로 필터링된 여행지 목록을 보여준다). 국내(대한민국)는
 * 필터 대상이 아니라 홈으로만 이동한다.
 */
export function CountryChips() {
  const regionGroups = REGION_ORDER.map((region) => ({
    region,
    countries: REPRESENTATIVE_VISITED_COUNTRIES.filter(
      (country) => COUNTRY_REGION_MAP[country] === region,
    ),
  })).filter((group) => group.countries.length > 0);

  return (
    <section className="flex flex-col gap-6 px-4">
      <h2 className="text-[24px] font-bold text-[#2B2A28]">방문 국가</h2>
      {regionGroups.map((group) => (
        <div key={group.region}>
          <h3 className="mb-2 text-[16px] font-semibold text-[#6B6863]">
            {group.region}
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {group.countries.map((country) => (
              <Link
                key={country}
                href={country === "대한민국" ? "/" : `/?country=${country}`}
                className={`${FOCUS_RING_CLASS_NAME} shrink-0 rounded-[999px] border border-[#E4E1DC] px-4 py-2 text-[14px] text-[#2B2A28]`}
              >
                {country}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
