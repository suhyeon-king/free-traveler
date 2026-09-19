import { test, expect } from "@playwright/test";

/**
 * 공개 탐색 Smoke(로그인 불필요) — E2E-001~002(TASK-E2E-PUBLIC-SMOKE).
 * `/travel-tools`의 항공·숙소·동행탭 흐름(E2E-003~005)은
 * `tests/e2e/travel-tools.spec.ts`(TASK-E2E-TRAVEL-TOOLS)가 담당한다 — 이전에는
 * 이 파일에 잘못 섞여 있었으나 Task 경계에 맞춰 분리했다.
 * Chromium 프로젝트로만 실행한다(playwright.config.ts).
 *
 * Selector는 실제 구현(PAGE-SCR001/PAGE-SCR002)의 role·accessible name을
 * 그대로 반영했다.
 */

test.describe("E2E-001 메인 페이지의 추천 여행지와 주요 CTA", () => {
  test("국내/해외 추천 여행지 Card Grid와 '여행 준비 시작하기' CTA가 노출된다", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /국내 여행지/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /해외 여행지/ }),
    ).toBeVisible();

    // 추천 여행지 Card Grid는 목록 형태(listitem)로 접근 가능해야 하며 최소 1개 이상 있어야 한다.
    await expect(page.getByRole("listitem").first()).toBeVisible();

    const primaryCta = page.getByRole("link", { name: "여행 준비 시작하기" });
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveAttribute("href", "/travel-tools");
  });
});

test.describe("E2E-002 대표 소개의 free_traveler, 50회 이상, 30개국 이상", () => {
  test("SCR-001에서 SCR-002로 이동해 대표 소개 핵심 정보를 확인한다", async ({
    page,
  }) => {
    await page.goto("/");

    const aboutCta = page.getByRole("link", { name: "대표 소개 더 보기" });
    await expect(aboutCta).toBeVisible();
    await aboutCta.click();
    await expect(page).toHaveURL(/\/about$/);

    await expect(
      page.getByRole("heading", { name: "free_traveler" }),
    ).toBeVisible();
    await expect(page.getByText("50+ Trips", { exact: true })).toBeVisible();
    await expect(
      page.getByText("30+ Countries", { exact: true }),
    ).toBeVisible();
  });
});
