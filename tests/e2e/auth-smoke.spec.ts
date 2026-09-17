import { test, expect } from "@playwright/test";

/**
 * 동행 인증 흐름 Smoke — E2E-006~007 골격.
 *
 * 대응 Task: TASKS/TASK-E2E-MATE-AUTH.md(Expected Files: tests/e2e/mate-auth.spec.ts —
 * 이번 요청에서 tests/e2e/auth-smoke.spec.ts로 파일명을 지정받아 그대로 사용했다.
 * TASKS/00_TASK_LIST.md·TASKS/TASK-E2E-MATE-AUTH.md의 Expected Files도 이 파일명으로
 * 함께 갱신해야 감사 스크립트와 어긋나지 않는다).
 *
 * 인증 테스트 계정 환경변수가 없으면 이 파일 전체를 명시적으로 skip한다(실패로 처리하지 않는다).
 * 필요한 환경변수:
 *   - NEXT_PUBLIC_SUPABASE_URL (Supabase 프로젝트가 구성되어 있는지)
 *   - E2E_TEST_USER_EMAIL / E2E_TEST_USER_PASSWORD (더미 테스트 계정 — CLAUDE.md 규칙에 따라
 *     실제 개인정보를 쓰지 않는다)
 */

const hasAuthEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.E2E_TEST_USER_EMAIL &&
  !!process.env.E2E_TEST_USER_PASSWORD;

test.describe("E2E-006 로그인 사용자의 동행글 작성과 목록·상세 확인", () => {
  test.skip(
    !hasAuthEnv,
    "NEXT_PUBLIC_SUPABASE_URL/E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD 환경변수가 없어 auth-smoke를 건너뜁니다.",
  );

  test("로그인 → 동행글 작성 → 목록·상세에서 확인된다", async ({ page }) => {
    const email = process.env.E2E_TEST_USER_EMAIL!;
    const password = process.env.E2E_TEST_USER_PASSWORD!;

    // TODO(E2E-006 골격): CMP-SCR005-AUTH 구현 후 로그인 Form의 실제 role/label로 갱신한다.
    await page.goto("/account");
    await page.getByRole("textbox", { name: /이메일/ }).fill(email);
    await page.getByRole("textbox", { name: /비밀번호/ }).fill(password);
    await page.getByRole("button", { name: "로그인" }).click();

    // TODO(E2E-006 골격): CMP-SCR003-MATE-WRITE 구현 후 작성 Form 필드의 실제 role/label로 갱신한다.
    await page.goto("/travel-tools");
    await page.getByRole("tab", { name: "동행 구하기" }).click();
    await page
      .getByRole("textbox", { name: /제목/ })
      .fill("동행 구합니다(E2E-006 테스트)");
    await page.getByRole("checkbox", { name: /안전수칙/ }).check();
    await page.getByRole("button", { name: /등록|작성/ }).click();

    // TODO(E2E-006 골격): CMP-SCR004-LIST/DETAIL 구현 후 목록·상세 확인 assertion을 완성한다.
    await expect(page).toHaveURL(/\/mates/);
    await expect(page.getByText("동행 구합니다(E2E-006 테스트)")).toBeVisible();
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
    const email = process.env.E2E_TEST_USER_EMAIL!;
    const password = process.env.E2E_TEST_USER_PASSWORD!;

    // TODO(E2E-007 골격): CMP-SCR005-AUTH 구현 후 로그인 Form의 실제 role/label로 갱신한다.
    await page.goto("/account");
    await page.getByRole("textbox", { name: /이메일/ }).fill(email);
    await page.getByRole("textbox", { name: /비밀번호/ }).fill(password);
    await page.getByRole("button", { name: "로그인" }).click();

    // TODO(E2E-007 골격): CMP-SCR004-APPLY 구현 후 참가 요청 제출 흐름의 실제 role/label로 갱신한다.
    await page.goto("/mates");
    await page.getByRole("listitem").first().click();
    await page.getByRole("button", { name: /참가 요청/ }).click();

    // TODO(E2E-007 골격): CMP-SCR005-MY-ACTIVITY 구현 후 "내 활동" 탭의 실제 role/label로 갱신한다.
    await page.goto("/account");
    await page.getByRole("tab", { name: /내 활동|참가 요청/ }).click();
    await expect(page.getByRole("listitem").first()).toBeVisible();
  });
});
