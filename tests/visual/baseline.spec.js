import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:4173";

/** @param {import("@playwright/test").Page} page */
async function stabilizePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
      iframe[src*="spotify"] {
        display: none !important;
      }
    `,
  });
}

/** @param {import("@playwright/test").Page} page
 * @param {string} path
 */
async function open(page, path) {
  const response = await page.goto(`${BASE_URL}${path}`);
  expect(response).toBeTruthy();
  const status = response?.status() ?? 500;
  expect(status).toBeLessThan(400);
  await page.waitForLoadState("networkidle");
}

test.describe("Visual smoke checks", () => {
  test("homepage full page baseline", async ({ page }) => {
    await open(page, "/");
    await stabilizePage(page);

    await expect(page).toHaveScreenshot("homepage-full.png", {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 2000,
      animations: "disabled",
      caret: "hide",
    });
  });

  test("homepage structural regions are visible", async ({ page }) => {
    await open(page, "/");

    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("main").first()).toBeVisible();
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("article page renders heading and content", async ({ page }) => {
    await open(page, "/introducing-ccl");

    await expect(page.locator("article").first()).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".article-content").first()).toBeVisible();
  });

  test("article page includes at least one code block", async ({ page }) => {
    await open(page, "/introducing-ccl");

    const codeBlocks = page.locator("pre");
    await expect(codeBlocks.first()).toBeVisible();
  });
});
