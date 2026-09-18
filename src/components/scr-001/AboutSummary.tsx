import Link from "next/link";

import { OptimizedImage } from "@/components/shared/OptimizedImage";
import {
  REPRESENTATIVE_GALLERY,
  REPRESENTATIVE_INTRO,
  REPRESENTATIVE_NAME,
  REPRESENTATIVE_STATS,
} from "@/data/representative";
import { FOCUS_RING_CLASS_NAME, MIN_TOUCH_TARGET_CLASS_NAME } from "@/lib/a11y";

/**
 * SCR-001 ⑦ free_traveler 요약+CTA Section(REQ-FUNC-057).
 * `/about`(SCR-002)과 동일한 대표명·통계 값을 `src/data/representative.ts`
 * 하나만 참조해 표시한다.
 */
export function AboutSummary() {
  const heroImage = REPRESENTATIVE_GALLERY[0];

  return (
    <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div className="relative h-64 w-full overflow-hidden rounded-[16px] md:h-80">
        <OptimizedImage
          src={heroImage.url}
          alt={heroImage.alt}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[24px] font-bold text-[#2B2A28]">
          {REPRESENTATIVE_NAME}
        </h2>
        <div className="flex flex-wrap gap-4">
          <span className="text-[16px] font-semibold text-[#F0653C]">
            {REPRESENTATIVE_STATS.tripsLabel}
          </span>
          <span className="text-[16px] font-semibold text-[#F0653C]">
            {REPRESENTATIVE_STATS.countriesLabel}
          </span>
        </div>
        <p className="text-[16px] leading-[1.6] text-[#2B2A28]">
          {REPRESENTATIVE_INTRO}
        </p>
        <Link
          href="/about"
          className={`${FOCUS_RING_CLASS_NAME} ${MIN_TOUCH_TARGET_CLASS_NAME} inline-flex w-fit items-center rounded-[999px] bg-[#F0653C] px-6 text-[16px] font-semibold text-[#FFFFFF] active:bg-[#D64F29]`}
        >
          대표 소개 더 보기
        </Link>
      </div>
    </section>
  );
}
