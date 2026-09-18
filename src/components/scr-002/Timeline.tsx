import { OptimizedImage } from "@/components/shared/OptimizedImage";
import {
  REPRESENTATIVE_GALLERY,
  REPRESENTATIVE_TIMELINE,
} from "@/data/representative";

/**
 * 해당 연도가 촬영 연도로 표기된 Gallery 사진을 찾는다. `representative.ts`의
 * `TimelineEntry`에는 사진 필드가 없어(다른 완료된 Task 소유 파일), 촬영 연도가
 * 일치하는 Gallery 항목을 짝지어 "사진이 있는 항목" 요건을 충족한다.
 */
function findPhotoForYear(year: number) {
  return REPRESENTATIVE_GALLERY.find((photo) =>
    photo.attribution.includes(`(${year})`),
  );
}

/**
 * SCR-002 ④ 여행 Timeline(6개 이상, REQ-FUNC-060). 연도·장소·한 줄 요약·사진을
 * 시간순으로 표시하며 Desktop은 좌우 교차, Mobile은 좌측 고정 1열이다.
 */
export function Timeline() {
  return (
    <section className="px-4">
      <h2 className="mb-6 text-[24px] font-bold text-[#2B2A28]">
        여행 Timeline
      </h2>
      <ol className="flex flex-col gap-8">
        {REPRESENTATIVE_TIMELINE.map((entry, index) => {
          const photo = findPhotoForYear(entry.year);
          const isReversed = index % 2 === 1;

          return (
            <li
              key={`${entry.year}-${entry.place}`}
              className={`flex flex-col gap-4 md:flex-row md:items-center md:gap-8 ${
                isReversed ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[16px] bg-[#F7F6F4] md:w-64">
                {photo ? (
                  <OptimizedImage
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 256px, 100vw"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#F0653C]">
                  {entry.year}
                </p>
                <h3 className="text-[18px] font-semibold text-[#2B2A28]">
                  {entry.place}
                </h3>
                <p className="mt-1 text-[14px] text-[#2B2A28]">
                  {entry.summary}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
