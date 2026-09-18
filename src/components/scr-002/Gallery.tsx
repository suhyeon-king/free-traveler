import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { REPRESENTATIVE_GALLERY } from "@/data/representative";

/**
 * SCR-002 ⑥ 여행 Gallery(8장 이상, REQ-FUNC-061 간소화). 각 사진은 장소 설명
 * alt 텍스트와 출처(자체 촬영 표기)를 함께 표시한다. 작가·라이선스 승인
 * 워크플로는 없다(정적 텍스트 필드로만 기록).
 */
export function Gallery() {
  return (
    <section className="px-4">
      <h2 className="mb-4 text-[24px] font-bold text-[#2B2A28]">
        여행 Gallery
      </h2>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {REPRESENTATIVE_GALLERY.map((photo) => (
          <li key={photo.url} className="list-none">
            <div className="relative aspect-square w-full overflow-hidden rounded-[16px]">
              <OptimizedImage
                src={photo.url}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 25vw, 50vw"
              />
            </div>
            <p className="mt-1 text-[13px] text-[#6B6863]">
              {photo.attribution}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
