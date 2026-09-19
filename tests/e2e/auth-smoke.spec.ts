import { test, expect } from "@playwright/test";

/**
 * 동행 인증 흐름 Smoke — REQ-FUNC-027/034/036/066(TASK-E2E-MATE-AUTH).
 *
 * 인증 테스트 계정 환경변수가 없으면 이 파일 전체를 명시적으로 skip한다(실패로
 * 처리하지 않는다). 필요한 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL (Supabase 프로젝트가 구성되어 있는지)
 *   - E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD (더미 테스트 계정 — CLAUDE.md
 *     규칙에 따라 실제 개인정보를 쓰지 않는다)
 *
 * Selector는 실제 구현(AuthTab/MateWriteTab/MateList/MateDetailPanel/ApplyForm/
 * MyActivityTab/PAGE-SCR005)의 role·accessible name을 그대로 반영했다. `/travel-tools`,
 * `/account`의 탭 전환은 순수 CSS(라디오+`<label>`)로 구현되어 있어 ARIA
 * `role="tab"`이 없다(PAGE-SCR003/PAGE-SCR005에 알려진 제한사항으로 이미 보고됨)
 * — 그래서 탭 전환은 `getByText`로 라벨 텍스트를 클릭한다.
 */

const hasAuthEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.E2E_TEST_USER_EMAIL &&
  !!process.env.E2E_TEST_USER_PASSWORD;

async function login(page: import("@playwright/test").Page) {
  const email = process.env.E2E_TEST_USER_EMAIL!;
  const password = process.env.E2E_TEST_USER_PASSWORD!;

  await page.goto("/account");
  await page.getByRole("textbox", { name: "이메일" }).fill(email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
}

test.describe("E2E-006 로그인 사용자의 동행글 작성과 목록·상세 확인", () => {
  test.skip(
    !hasAuthEnv,
    "NEXT_PUBLIC_SUPABASE_URL/E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD 환경변수가 없어 auth-smoke를 건너뜁니다.",
  );

  test("로그인 → 동행글 작성 → 목록·상세에서 확인된다", async ({ page }) => {
    await login(page);

    const postTitle = `동행 구합니다(E2E-006 테스트 ${Date.now()})`;
    const startDate = new Date(Date.now() + 7 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const endDate = new Date(Date.now() + 10 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    await page.goto("/travel-tools");
    await page.getByText("동행 구하기", { exact: true }).click();

    await page.getByRole("textbox", { name: "제목" }).fill(postTitle);
    await page.getByRole("textbox", { name: "국가" }).fill("대한민국");
    await page.getByLabel("시작일").fill(startDate);
    await page.getByLabel("종료일").fill(endDate);
    await page
      .getByRole("textbox", { name: "설명" })
      .fill("E2E 테스트용 동행글 설명입니다.");
    await page.getByRole("checkbox", { name: /안전수칙/ }).check();
    await page.getByRole("button", { name: /동행글 등록/ }).click();

    await expect(page).toHaveURL(/\/mates\?post=/);
    await expect(page.getByRole("heading", { name: postTitle })).toBeVisible();

    await page.goto("/mates");
    await expect(page.getByText(postTitle)).toBeVisible();
  });
});

test.describe("E2E-007 동행글 신청과 계정 화면의 내 활동 확인", () => {
  test.skip(
    !hasAuthEnv,
    "NEXT_PUBLIC_SUPABASE_URL/E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD 환경변수가 없어 auth-smoke를 건너뜁니다.",
  );

  test("동행글 신청 후 계정 화면 내 활동에서 신청 내역이 확인된다", async ({
    page,
  }) => {
    await login(page);

    await page.goto("/mates");
    await page.getByRole("listitem").first().click();
    await page
      .getByRole("textbox", { name: /참가 메시지/ })
      .fill("E2E 테스트 참가 요청입니다.");
    await page.getByRole("button", { name: "참가 요청 보내기" }).click();
    await expect(page.getByText("참가 요청을 보냈습니다.")).toBeVisible();

    await page.goto("/account");
    await page.getByText("내 활동", { exact: true }).click();
    await expect(page.getByText("내가 보낸 참가 요청")).toBeVisible();
  });
});
