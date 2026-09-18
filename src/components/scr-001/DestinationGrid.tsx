"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import {
  DOMESTIC_DESTINATIONS,
  OVERSEAS_DESTINATIONS,
  type Destination,
} from "@/data/destinations";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import { getFavoriteIds, toggleFavorite } from "@/lib/favorites";
import { shareLink } from "@/lib/share";

const CARDS_PER_SECTION = 6;
const OVERSEAS_COUNTRIES = Array.from(
  new Set(OVERSEAS_DESTINATIONS.map((d) => d.country)),
);
const SEASON_KEYWORDS = ["봄", "여름", "가을", "겨울", "건기", "우기"];

interface DestinationGridProps {
  onSelectDestination: (destinationId: string) => void;
}

function matchesQuery(destination: Destination, query: string): boolean {
  if (!query) {
    return true;
  }
  const haystack = [
    destination.name,
    destination.country,
    ...destination.highlights,
    ...destination.food,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesSeason(destination: Destination, season: string): boolean {
  if (!season) {
    return true;
  }
  return destination.bestSeason.includes(season);
}

export function DestinationGrid({ onSelectDestination }: DestinationGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "";
  const season = searchParams.get("season") ?? "";

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    getFavoriteIds(),
  );

  function updateFilters(next: {
    q?: string;
    country?: string;
    season?: string;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { q: query, country, season, ...next };
    (["q", "country", "season"] as const).forEach((key) => {
      if (merged[key]) {
        params.set(key, merged[key]);
      } else {
        params.delete(key);
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function resetFilters() {
    router.replace("?", { scroll: false });
  }

  const domesticResults = useMemo(
    () =>
      DOMESTIC_DESTINATIONS.filter(
        (d) => matchesQuery(d, query) && matchesSeason(d, season),
      ).slice(0, CARDS_PER_SECTION),
    [query, season],
  );

  const overseasResults = useMemo(
    () =>
      OVERSEAS_DESTINATIONS.filter(
        (d) =>
          matchesQuery(d, query) &&
          matchesSeason(d, season) &&
          (!country || d.country === country),
      ).slice(0, CARDS_PER_SECTION),
    [query, season, country],
  );

  function handleToggleFavorite(destinationId: string) {
    const result = toggleFavorite(destinationId);
    setFavoriteIds(result.ids);
  }

  function handleShare(destination: Destination) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    void shareLink({
      url: `${origin}/?destination=${destination.id}`,
      title: destination.name,
      text: destination.summary,
    });
  }

  function renderCard(destination: Destination) {
    const isFavorite = favoriteIds.includes(destination.id);
    return (
      <li key={destination.id} className="list-none">
        <div className="overflow-hidden rounded-[16px] border border-[#E4E1DC]">
          <button
            type="button"
            onClick={() => onSelectDestination(destination.id)}
            className={`${FOCUS_RING_CLASS_NAME} block w-full text-left`}
          >
            <div className="relative h-40 w-full">
              <OptimizedImage
                src={destination.image.url}
                alt={destination.image.alt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              />
            </div>
            <div className="flex flex-col gap-1 p-4">
              <span className="text-[18px] font-semibold text-[#2B2A28]">
                {destination.name}
              </span>
              <span className="text-[14px] text-[#6B6863]">
                {destination.country}
              </span>
            </div>
          </button>
          <div className="flex items-center justify-end gap-2 px-4 pb-4">
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              onClick={() => handleToggleFavorite(destination.id)}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[14px] text-[#6B6863]`}
            >
              {isFavorite ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
            </button>
            <button
              type="button"
              aria-label="공유하기"
              onClick={() => handleShare(destination)}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[14px] text-[#6B6863]`}
            >
              공유
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          검색(도시·테마)
          <input
            type="text"
            value={query}
            onChange={(event) => updateFilters({ q: event.target.value })}
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          해외 국가
          <select
            value={country}
            onChange={(event) => updateFilters({ country: event.target.value })}
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          >
            <option value="">전체</option>
            {OVERSEAS_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] text-[#6B6863]">
          추천 시기
          <select
            value={season}
            onChange={(event) => updateFilters({ season: event.target.value })}
            className={`${FOCUS_RING_CLASS_NAME} h-12 rounded-[10px] border border-[#E4E1DC] px-3 text-[16px] text-[#2B2A28]`}
          >
            <option value="">전체</option>
            {SEASON_KEYWORDS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section aria-labelledby="domestic-destinations-heading">
        <h2
          id="domestic-destinations-heading"
          className="mb-4 text-[24px] font-bold text-[#2B2A28]"
        >
          국내 여행지
        </h2>
        {domesticResults.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {domesticResults.map(renderCard)}
          </ul>
        ) : (
          <EmptyState
            reason="조건에 맞는 국내 여행지가 없습니다."
            guidance="검색어나 추천 시기를 조정하면 더 많은 결과를 볼 수 있습니다."
            action={{ label: "필터 초기화", onClick: resetFilters }}
          />
        )}
      </section>

      <section aria-labelledby="overseas-destinations-heading">
        <h2
          id="overseas-destinations-heading"
          className="mb-4 text-[24px] font-bold text-[#2B2A28]"
        >
          해외 여행지
        </h2>
        {overseasResults.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {overseasResults.map(renderCard)}
          </ul>
        ) : (
          <EmptyState
            reason="조건에 맞는 해외 여행지가 없습니다."
            guidance="국가나 검색어, 추천 시기를 조정하면 더 많은 결과를 볼 수 있습니다."
            action={{ label: "필터 초기화", onClick: resetFilters }}
          />
        )}
      </section>
    </div>
  );
}
