"use client";

import { useState } from "react";

import { Drawer } from "@/components/shared/Drawer";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import {
  getDestinationById,
  getRelatedDestinations,
} from "@/data/destinations";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";
import { getFavoriteIds, toggleFavorite } from "@/lib/favorites";
import { shareLink, type ShareLinkResult } from "@/lib/share";

interface DestinationDrawerProps {
  destinationId: string | null;
  onClose: () => void;
  onSelectDestination: (destinationId: string) => void;
  /** 해외 여행지의 "안전정보 보기"에서 호출한다. `countrySlug`를 안전정보 Drawer(CMP-SCR001-SAFETY-PANEL)에 전달한다. */
  onOpenSafety: (countrySlug: string) => void;
}

/**
 * 여행지 상세 Drawer(REQ-FUNC-004/009). 소개·명소 5개+·추천 시기·1일/3일 일정·예산·교통·
 * 음식 3개+·에티켓·출처·수정일을 표시하고, 해외 여행지는 안전정보 Drawer로 연결한다.
 * 관련 여행지는 최대 6개까지 하단에 보여준다(REQ-FUNC-009).
 */
export function DestinationDrawer({
  destinationId,
  onClose,
  onSelectDestination,
  onOpenSafety,
}: DestinationDrawerProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    getFavoriteIds(),
  );
  const [shareResult, setShareResult] = useState<ShareLinkResult | null>(null);

  const destination = destinationId
    ? getDestinationById(destinationId)
    : undefined;
  const relatedDestinations = destination
    ? getRelatedDestinations(destination.id)
    : [];

  if (!destination) {
    return null;
  }

  const isFavorite = favoriteIds.includes(destination.id);
  const titleId = `destination-drawer-title-${destination.id}`;

  function handleToggleFavorite() {
    const result = toggleFavorite(destination!.id);
    setFavoriteIds(result.ids);
  }

  async function handleShare() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const result = await shareLink({
      url: `${origin}/?destination=${destination!.id}`,
      title: destination!.name,
      text: destination!.summary,
    });
    setShareResult(result);
  }

  return (
    <Drawer isOpen={Boolean(destinationId)} onClose={onClose} titleId={titleId}>
      <div className="flex flex-col gap-4">
        <div className="relative h-48 w-full overflow-hidden rounded-[16px]">
          <OptimizedImage
            src={destination.image.url}
            alt={destination.image.alt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 400px, 100vw"
          />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-[24px] font-bold text-[#2B2A28]">
              {destination.name}
            </h2>
            <p className="text-[14px] text-[#6B6863]">{destination.country}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              onClick={handleToggleFavorite}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[14px] text-[#6B6863]`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              type="button"
              aria-label="공유하기"
              onClick={handleShare}
              className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} text-[14px] text-[#6B6863]`}
            >
              공유
            </button>
          </div>
        </div>

        {shareResult ? (
          <p role="status" className="text-[13px] text-[#6B6863]">
            {shareResult.method === "clipboard"
              ? "링크를 클립보드에 복사했습니다."
              : shareResult.method === "web-share"
                ? "공유 시트를 열었습니다."
                : "공유에 실패했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
        ) : null}

        <p className="text-[16px] leading-[1.6] text-[#2B2A28]">
          {destination.summary}
        </p>

        {destination.region === "overseas" ? (
          <button
            type="button"
            onClick={() => onOpenSafety(destination.countrySlug)}
            className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} w-fit rounded-[999px] bg-[#1F4B8F] px-6 text-[16px] font-semibold text-[#FFFFFF]`}
          >
            안전정보 보기
          </button>
        ) : null}

        <section>
          <h3 className="text-[18px] font-semibold text-[#2B2A28]">명소</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {destination.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-[999px] border border-[#E4E1DC] px-3 py-1 text-[13px] text-[#2B2A28]"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[18px] font-semibold text-[#2B2A28]">
            추천 시기
          </h3>
          <p className="text-[14px] text-[#2B2A28]">{destination.bestSeason}</p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-[18px] font-semibold text-[#2B2A28]">
              1일 일정
            </h3>
            <p className="text-[14px] text-[#2B2A28]">
              {destination.itinerary.oneDay}
            </p>
          </div>
          <div>
            <h3 className="text-[18px] font-semibold text-[#2B2A28]">
              3일 일정
            </h3>
            <p className="text-[14px] text-[#2B2A28]">
              {destination.itinerary.threeDay}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-[18px] font-semibold text-[#2B2A28]">예산</h3>
          <p className="text-[14px] text-[#2B2A28]">{destination.budget}</p>
        </section>

        <section>
          <h3 className="text-[18px] font-semibold text-[#2B2A28]">교통</h3>
          <p className="text-[14px] text-[#2B2A28]">{destination.transport}</p>
        </section>

        <section>
          <h3 className="text-[18px] font-semibold text-[#2B2A28]">음식</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {destination.food.map((food) => (
              <li
                key={food}
                className="rounded-[999px] border border-[#E4E1DC] px-3 py-1 text-[13px] text-[#2B2A28]"
              >
                {food}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[18px] font-semibold text-[#2B2A28]">에티켓</h3>
          <p className="text-[14px] text-[#2B2A28]">{destination.etiquette}</p>
        </section>

        <p className="text-[13px] text-[#6B6863]">
          출처: {destination.source} · 수정일: {destination.updatedAt}
        </p>

        {relatedDestinations.length > 0 ? (
          <section>
            <h3 className="text-[18px] font-semibold text-[#2B2A28]">
              관련 여행지
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {relatedDestinations.map((related) => (
                <li key={related.id}>
                  <button
                    type="button"
                    onClick={() => onSelectDestination(related.id)}
                    className={`${FOCUS_RING_CLASS_NAME} rounded-[999px] border border-[#E4E1DC] px-3 py-1 text-[13px] text-[#2B2A28]`}
                  >
                    {related.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Drawer>
  );
}
