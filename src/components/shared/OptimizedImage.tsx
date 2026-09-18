import Image, { type ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "loading" | "priority"> {
  /**
   * Hero 등 LCP(Largest Contentful Paint) 후보 이미지면 true로 지정해 우선 로드한다.
   * 기본값(false)은 lazy load로 동작한다(REQ-NF-006).
   */
  isPriority?: boolean;
}

const DEFAULT_SIZES =
  "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * Next.js `<Image>` 기반 반응형 이미지 래퍼. `isPriority`가 아니면 항상 lazy load,
 * `sizes`를 지정하지 않으면 카드형 반응형 기본값을 사용한다.
 */
export function OptimizedImage({
  isPriority = false,
  alt,
  sizes,
  ...rest
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      priority={isPriority}
      loading={isPriority ? undefined : "lazy"}
      sizes={sizes ?? DEFAULT_SIZES}
      {...rest}
    />
  );
}
