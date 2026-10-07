import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 실제 여행지 사진이 준비되기 전까지 지역별로 구분되는 SVG 플레이스홀더
    // (public/images/**/*.svg, scripts/generate_placeholder_images.mjs로 생성)를
    // next/image로 서빙하기 위해 SVG를 허용한다. 업로드된 사용자 콘텐츠가 아니라
    // 저장소에 직접 커밋한 정적 파일만 다루므로 안전하다.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
