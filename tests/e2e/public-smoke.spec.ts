import { test, expect, type Locator } from "@playwright/test";

/**
 * 공개 탐색 Smoke(로그인 불필요) — E2E-001~005.
 *
 * 대응 Task: TASKS/TASK-E2E-PUBLIC-SMOKE.md(E2E-001~004의 근거 흐름1·2),
 *            TASKS/TASK-CMP-SCR003-MATE-WRITE.md(E2E-005의 근거).
 * Chromium 프로젝트로만 실행한다(playwright.config.ts).
 *
 * Selector 우선순위: role → accessible label → test id. 이 시점에는 Page Owner Task가
 * 아직 구현되지 않아(PAGE-SCR002~005 NOT_STARTED) 아래 role/name은
 * design-reference/UI_CONTRACT.md·SCREEN_ROUTE_CONTRACT.json·docs/04_UIUX_PLAN.md에 적힌
 * 문구를 그대로 옮긴 것이다. 실제 구현 시 문구가 달라지면 이 파일도 함께 갱신한다.
 */

const NON_TRANSMISSION_NOTICE = "입력값은 외부 사이트로 전달되지 않습니다";

/** 새 탭으로 열리는 외부 이동 링크(target=_blank + noopener,noreferrer, 쿼리 파라미터 없음)를 검사한다.
 *  실제 목적지 사이트의 응답/콘텐츠는 검사하지 않는다(요청 규칙). */
async function expectOutboundLink(link: Locator) {
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
  const rel = (await link.getAttribute("rel")) ?? "";
  expect(rel).toContain("noopener");
  expect(rel).toContain("noreferrer");
  const href = await link.getAttribute("href");
  expect(href, "외부 이동 링크에 href가 있어야 한다").toBeTruthy();
  expect(href).toMatch(/^https?:\/\//);
  expect(href).not.toContain("?"); // 목적지·날짜 등 사용자 입력값이 query로 붙지 않아야 한다(REQ-FUNC-016/024).
}

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

    await expect(page.getByText(/free_traveler/)).toBeVisible();
    await expect(page.getByText(/50\+ Trips|50회 이상/)).toBeVisible();
    await expect(page.getByText(/30\+ Countries|30개국 이상/)).toBeVisible();
  });
});

test.describe("E2E-003 여행 도구의 항공 외부 이동 안내와 href", () => {
  test("항공편 탭에서 비전달 고지와 외부 이동 링크(href)를 확인한다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const flightTab = page.getByRole("tab", { name: "항공편" });
    await expect(flightTab).toBeVisible();
    await flightTab.click();

    await expect(page.getByText(NON_TRANSMISSION_NOTICE)).toBeVisible();

    const flightOutboundLink = page.getByRole("link", {
      name: /항공편.*보러 가기/,
    });
    await expectOutboundLink(flightOutboundLink);
  });
});

test.describe("E2E-004 여행 도구의 숙소 외부 이동 안내와 href", () => {
  test("숙소 탭에서 비전달 고지와 외부 이동 링크(href)를 확인한다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const hotelTab = page.getByRole("tab", { name: "숙소" });
    await expect(hotelTab).toBeVisible();
    await hotelTab.click();

    await expect(page.getByText(NON_TRANSMISSION_NOTICE)).toBeVisible();

    const hotelOutboundLink = page.getByRole("link", {
      name: /숙소.*보러 가기/,
    });
    await expectOutboundLink(hotelOutboundLink);
  });
});

test.describe("E2E-005 비로그인 동행글 작성의 로그인 안내", () => {
  test("동행 구하기 탭은 비로그인 상태에서 작성 Form 대신 로그인 안내 카드를 보여준다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const mateTab = page.getByRole("tab", { name: "동행 구하기" });
    await expect(mateTab).toBeVisible();
    await mateTab.click();

    // Unauthorized 상태 — 작성 Form이 아니라 로그인 안내 카드가 노출되어야 한다.
    await expect(page.getByRole("textbox", { name: /제목/ })).toHaveCount(0);

    const loginCta = page.getByRole("link", { name: "로그인/가입하기" });
    await expect(loginCta).toBeVisible();
    await expect(loginCta).toHaveAttribute("href", "/account");
  });
});
