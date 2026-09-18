import type { Config } from "tailwindcss";

/**
 * 반응형 레이아웃 토큰(REQ-FUNC-065). Tailwind v4는 CSS-first 설정
 * (`src/app/globals.css`의 `@theme`)이 정본이며, 이 파일은 Content 경로를
 * 명시적으로 고정해 v4의 자동 감지에 의존하지 않게 하는 용도로만 사용한다.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
};

export default config;
