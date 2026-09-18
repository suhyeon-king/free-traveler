import type { Metadata } from "next";

/**
 * 페이지별 SEO 메타데이터 공통 유틸리티 (REQ-FUNC-070, REQ-NF-030).
 *
 * Page Owner(`PAGE-SCR00N`)는 `getScreenMetadata(path)`를 `export const metadata`에
 * 그대로 대입해 title/description/canonical/Open Graph를 채운다. `NEXT_PUBLIC_SITE_URL`이
 * 없으면 로컬 개발 기준값으로 대체하며, 실제 배포 도메인은 `DEPLOY-VERCEL-SETUP`에서 설정한다.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** 실제 이미지 파일은 아직 없다 — 콘텐츠 검수 단계에서 채워야 한다. */
const DEFAULT_OG_IMAGE_PATH = "/og-default.png";

export interface PageMetadataInput {
  title: string;
  description: string;
  /** 사이트 루트 기준 경로(예: `/`, `/about`). */
  path: string;
  ogImagePath?: string;
}

/** title/description/canonical/Open Graph/Twitter Card를 모두 채운 `Metadata`를 만든다. */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImagePath = DEFAULT_OG_IMAGE_PATH,
}: PageMetadataInput): Metadata {
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImageUrl = `${SITE_URL}${ogImagePath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Free Traveler",
      images: [{ url: ogImageUrl }],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

interface ScreenMetadataEntry {
  title: string;
  description: string;
}

/** `design-reference/SCREEN_ROUTE_CONTRACT.json`의 5개 Screen 경로에 대응하는 고유 메타데이터. */
const SCREEN_METADATA: Record<string, ScreenMetadataEntry> = {
  "/": {
    title: "Free Traveler | 여행지 탐색과 동행 찾기",
    description:
      "국내외 여행지 정보, 항공·숙소 준비, 동행 모집을 한곳에서 확인하는 여행 준비 허브.",
  },
  "/about": {
    title: "대표 소개 | Free Traveler",
    description:
      "50회 이상의 자유여행과 30개국 이상의 경험을 바탕으로 여행지를 소개하는 free_traveler의 이야기.",
  },
  "/travel-tools": {
    title: "여행 준비 | Free Traveler",
    description:
      "항공편·숙소 조건을 정리하고 외부 사이트로 이동하거나 동행을 모집해 보세요.",
  },
  "/mates": {
    title: "동행 찾기 | Free Traveler",
    description: "함께 여행할 동행을 찾고, 모집글에 참가를 요청해 보세요.",
  },
  "/account": {
    title: "계정 | Free Traveler",
    description: "로그인, 내 활동, 프로필 관리를 한곳에서 확인하세요.",
  },
};

/**
 * 등록된 5개 Screen 경로 중 하나에 대한 `Metadata`를 반환한다.
 * 등록되지 않은 경로가 들어오면 콘텐츠 완전성 누락을 조기에 드러내기 위해 예외를 던진다.
 */
export function getScreenMetadata(path: string): Metadata {
  const entry = SCREEN_METADATA[path];
  if (!entry) {
    throw new Error(`SCREEN_METADATA에 등록되지 않은 경로입니다: ${path}`);
  }
  return buildPageMetadata({ ...entry, path });
}
