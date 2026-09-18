"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DESTINATIONS } from "@/data/destinations";
import { COUNTRY_SAFETY } from "@/data/safety";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

interface SearchResult {
  type: "destination" | "safety";
  id: string;
  label: string;
  subLabel: string;
}

interface HeroSearchProps {
  /** 검색 결과에서 여행지를 선택했을 때 호출한다(상세 Drawer는 Page Owner가 연결). */
  onSelectDestination?: (destinationId: string) => void;
  /** 검색 결과에서 국가 안전정보를 선택했을 때 호출한다. */
  onSelectSafety?: (countrySlug: string) => void;
}

const MAX_RESULTS_PER_TYPE = 5;

/**
 * SCR-001 ① 검색 Hero(REQ-FUNC-003/067). 클라이언트 측 한글 부분 일치 검색으로
 * 여행지·국가 안전정보를 통합 검색하고 결과 유형 라벨("여행지"/"안전정보")을 표시한다.
 * 검색어는 어디로도 전송하지 않는다(서버 로그 미저장).
 */
export function HeroSearch({
  onSelectDestination,
  onSelectSafety,
}: HeroSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    const destinationResults: SearchResult[] = DESTINATIONS.filter(
      (destination) =>
        [destination.name, destination.country, ...destination.highlights]
          .join(" ")
          .toLowerCase()
          .includes(trimmed),
    )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .map((destination) => ({
        type: "destination",
        id: destination.id,
        label: destination.name,
        subLabel: destination.country,
      }));

    const safetyResults: SearchResult[] = COUNTRY_SAFETY.filter((country) =>
      country.countryName.toLowerCase().includes(trimmed),
    )
      .slice(0, MAX_RESULTS_PER_TYPE)
      .map((country) => ({
        type: "safety",
        id: country.countrySlug,
        label: country.countryName,
        subLabel: "국가별 안전정보",
      }));

    return [...destinationResults, ...safetyResults];
  }, [query]);

  function handleSelect(result: SearchResult) {
    if (result.type === "destination") {
      onSelectDestination?.(result.id);
    } else {
      onSelectSafety?.(result.id);
    }
  }

  return (
    <section className="flex min-h-[520px] flex-col items-center justify-center gap-6 px-4 py-16 md:min-h-[560px]">
      <h1 className="text-center text-[32px] font-bold text-[#2B2A28]">
        어디로 떠나볼까요?
      </h1>

      <div className="relative w-full max-w-xl">
        <label htmlFor="hero-search-input" className="sr-only">
          국가·도시·테마로 여행지·안전정보 검색
        </label>
        <input
          id="hero-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="국가·도시·테마로 검색"
          className={`${FOCUS_RING_CLASS_NAME} h-14 w-full rounded-[999px] border border-[#E4E1DC] px-6 text-[16px] text-[#2B2A28]`}
        />
        {results.length > 0 ? (
          <ul className="absolute inset-x-0 top-full z-10 mt-2 max-h-80 overflow-y-auto rounded-[16px] border border-[#E4E1DC] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.08)]">
            {results.map((result) => (
              <li key={`${result.type}-${result.id}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={`${FOCUS_RING_CLASS_NAME} flex w-full items-center justify-between px-4 py-3 text-left text-[14px] text-[#2B2A28]`}
                >
                  <span>{result.label}</span>
                  <span className="text-[13px] text-[#6B6863]">
                    {result.type === "destination" ? "여행지" : "안전정보"} ·{" "}
                    {result.subLabel}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <Link
        href="/travel-tools"
        className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`}
      >
        여행 준비 시작하기
      </Link>
    </section>
  );
}
