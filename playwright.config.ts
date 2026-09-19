import { defineConfig, devices } from "@playwright/test";

// "localhost"를 쓴다 — Next.js 개발 서버는 자기 자신을 "localhost"로 인식하므로
// "127.0.0.1"로 접근하면 다른 오리진으로 보고 클라이언트 번들 로딩을 막아
// Playwright에서 연 페이지가 전혀 하이드레이션되지 않는 문제가 실제로 있었다
// (React state/onClick이 전부 작동하지 않고, CSS만으로 동작하는 부분만 우연히
// 통과했다 — E2E-PUBLIC-SMOKE 작성 중 발견).
const DEFAULT_BASE_URL = "http://localhost:3000";
// PLAYWRIGHT_BASE_URL이 있으면 그 값(예: Vercel Preview URL)으로 덮어쓴다.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? DEFAULT_BASE_URL;
const usingRemoteBaseURL = !!process.env.PLAYWRIGHT_BASE_URL;

// PLAYWRIGHT_SCOPE=chromium-smoke(CLAUDE.md Harness Marker) — 핵심 사용자 흐름 Smoke Test만
// Chromium 프로젝트 하나로 실행한다. 다중 브라우저 매트릭스를 추가하지 않는다.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // PLAYWRIGHT_BASE_URL(Preview URL)이 지정된 경우에는 로컬 서버를 띄우지 않는다.
  // 지정되지 않은 로컬 실행 시에만 `npm run dev`를 기동해 baseURL을 서빙한다.
  webServer: usingRemoteBaseURL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
