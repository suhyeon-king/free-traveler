"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

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
 *
 * 로딩에 실패하면(예: 실제 이미지 파일이 아직 준비되지 않은 자리표시자 경로)
 * 깨진 이미지 아이콘 대신 중립적인 플레이스홀더를 보여준다 — 모든 호출부가
 * `fill`과 함께 크기가 고정된 `relative` 컨테이너 안에서 쓰므로, 플레이스홀더도
 * 같은 크기(`h-full w-full`)로 그 자리를 그대로 채운다.
 */
export function OptimizedImage({
  isPriority = false,
  alt,
  sizes,
  ...rest
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center bg-[#F7F6F4] text-[#6B6863]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-8 w-8"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.5" />
          <path d="m4 17 4.5-4.5a1.5 1.5 0 0 1 2.12 0L15 17" />
          <path d="m13 15 1.88-1.88a1.5 1.5 0 0 1 2.12 0L20 16" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      priority={isPriority}
      loading={isPriority ? undefined : "lazy"}
      sizes={sizes ?? DEFAULT_SIZES}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
