import { test, expect, type Locator } from "@playwright/test";

/**
 * 여행 준비 Smoke(로그인 불필요) — E2E-003~005(TASK-E2E-TRAVEL-TOOLS).
 * Chromium 프로젝트로만 실행한다(playwright.config.ts).
 *
 * Selector는 실제 구현(PAGE-SCR003/FlightTab/HotelTab/MateWriteTab)의
 * role·accessible name을 그대로 반영했다. 탭 전환은 순수 CSS(라디오+`<label>`)로
 * 구현되어 있어 ARIA `role="tab"`이 없다(PAGE-SCR003에 알려진 제한사항으로 이미
 * 보고됨) — 그래서 탭 전환은 `getByText`로 라벨 텍스트를 클릭한다.
 */

const NON_TRANSMISSION_NOTICE = "입력값은 외부 사이트로 전달되지 않습니다";

/**
 * 항공/숙소 요약 단계에서 외부 이동 버튼(또는 미설정 오류 카드)을 검사한다.
 * 실제 구현은 `<a href>`가 아니라 `window.open(url, "_blank", "noopener,noreferrer")`를
 * 호출하는 버튼이라(REQ-FUNC-016/024), DOM 속성이 아니라 실제로 열리는
 * `popup` 페이지의 URL로 검증한다. 실제 목적지 사이트의 응답/콘텐츠는 검사하지
 * 않는다(요청 규칙) — 새 탭이 열렸는지, 그 시작 URL이 HTTPS이고 이 화면의 입력값
 * (국가·지역·날짜)이 쿼리로 붙지 않았는지만 확인한다.
 *
 * `FLIGHT_OUTBOUND_URL`/`HOTEL_OUTBOUND_URL`(또는 `app_settings`)이 설정되지
 * 않은 환경(예: 이 값을 시크릿으로 두지 않은 CI)에서는 버튼 대신 "설정되지
 * 않았습니다" 오류 카드가 노출되는 것이 정상 동작이다(Design Ref Error 상태) —
 * 이 경우 오류 카드+재시도 버튼을 검증하는 것으로 대체한다.
 */
async function expectOutboundButtonOrConfigError(
  page: import("@playwright/test").Page,
  panel: Locator,
  buttonName: string,
  notConfiguredText: string,
) {
  const outboundButton = panel.getByRole("button", { name: buttonName });
  const notConfiguredAlert = panel.getByRole("alert").filter({
    hasText: notConfiguredText,
  });

  await expect(outboundButton.or(notConfiguredAlert).first()).toBeVisible();

  if (await outboundButton.isVisible()) {
    const popupPromise = page.context().waitForEvent("page");
    await outboundButton.click();
    const popup = await popupPromise;
    const url = popup.url();
    expect(url).toMatch(/^https:\/\//);
    expect(url).not.toContain("?");
    await popup.close();
  } else {
    await expect(notConfiguredAlert).toBeVisible();
    await expect(
      notConfiguredAlert.getByRole("button", { name: "다시 시도" }),
    ).toBeVisible();
  }
}

test.describe("E2E-003 여행 도구의 항공 외부 이동 안내와 href", () => {
  test("항공편 탭에서 비전달 고지와 외부 이동 링크(href)를 확인한다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const flightTab = page.getByText("항공편", { exact: true });
    await expect(flightTab).toBeVisible();
    await flightTab.click();

    const flightPanel = page.locator("#panel-flight");
    await expect(flightPanel.getByText(NON_TRANSMISSION_NOTICE)).toBeVisible();

    const departureDate = new Date(Date.now() + 14 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const returnDate = new Date(Date.now() + 18 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const flightComboboxes = flightPanel.getByRole("combobox");
    await flightComboboxes.nth(0).selectOption("일본");
    await flightComboboxes.nth(1).selectOption("도쿄");
    await flightPanel.getByLabel("출발일").fill(departureDate);
    await flightPanel.getByLabel("귀국일").fill(returnDate);
    await flightPanel.getByRole("button", { name: "계속" }).click();

    await expect(flightPanel.getByText(NON_TRANSMISSION_NOTICE)).toBeVisible();
    await expect(flightPanel.getByText("일본 · 도쿄")).toBeVisible();

    await expectOutboundButtonOrConfigError(
      page,
      flightPanel,
      "항공편 보러 가기",
      "항공편 외부 이동 URL이 설정되지 않았습니다",
    );
  });
});

test.describe("E2E-004 여행 도구의 숙소 외부 이동 안내와 href", () => {
  test("숙소 탭에서 비전달 고지와 외부 이동 링크(href)를 확인한다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const hotelTab = page.getByText("숙소", { exact: true });
    await expect(hotelTab).toBeVisible();
    await hotelTab.click();

    const hotelPanel = page.locator("#panel-hotel");
    await expect(hotelPanel.getByText(NON_TRANSMISSION_NOTICE)).toBeVisible();

    const checkInDate = new Date(Date.now() + 14 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const checkOutDate = new Date(Date.now() + 18 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const hotelComboboxes = hotelPanel.getByRole("combobox");
    await hotelComboboxes.nth(0).selectOption("일본");
    await hotelComboboxes.nth(1).selectOption("도쿄");
    await hotelPanel.getByLabel("체크인").fill(checkInDate);
    await hotelPanel.getByLabel("체크아웃").fill(checkOutDate);
    await hotelPanel.getByRole("button", { name: "계속" }).click();

    await expect(hotelPanel.getByText(NON_TRANSMISSION_NOTICE)).toBeVisible();
    await expect(hotelPanel.getByText("일본 · 도쿄")).toBeVisible();

    await expectOutboundButtonOrConfigError(
      page,
      hotelPanel,
      "숙소 보러 가기",
      "숙소 외부 이동 URL이 설정되지 않았습니다",
    );
  });
});

test.describe("E2E-005 비로그인 동행글 작성의 로그인 안내", () => {
  test("동행 구하기 탭은 비로그인 상태에서 작성 Form 대신 로그인 안내 카드를 보여준다", async ({
    page,
  }) => {
    await page.goto("/travel-tools");

    const mateTab = page.getByText("동행 구하기", { exact: true });
    await expect(mateTab).toBeVisible();
    await mateTab.click();

    // Unauthorized 상태 — 작성 Form이 아니라 로그인 안내 카드가 노출되어야 한다.
    await expect(page.getByRole("textbox", { name: /제목/ })).toHaveCount(0);

    const loginCta = page.getByRole("link", { name: "로그인/가입하기" });
    await expect(loginCta).toBeVisible();
    await expect(loginCta).toHaveAttribute("href", "/account");
  });
});
