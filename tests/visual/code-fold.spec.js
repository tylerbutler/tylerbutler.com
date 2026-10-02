import { expect, test } from "@playwright/test";

test("long code blocks unfold only when clicked", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/2026-04-09-fold-test");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("#oridomi-test")).toHaveCount(0);

  const firstBlock = page.locator(".expressive-code.has-long-lines").first();
  const blockTop = await firstBlock.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate(
    (top) => window.scrollTo(0, top - window.innerHeight * 0.7),
    blockTop,
  );
  await page.waitForTimeout(100);

  const shell = firstBlock.locator("xpath=preceding-sibling::*[1]");
  const proxy = shell.locator(".ec-fold-proxy");
  const hint = shell.getByRole("button", { name: "Expand code" });

  await expect(firstBlock).toBeHidden();
  await expect(shell).toBeVisible();
  await expect(hint).toBeVisible();

  const foldedTransform = await proxy
    .locator(".oridomi-panel")
    .first()
    .evaluate((element) => getComputedStyle(element).transform);
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.2));
  await page.waitForTimeout(100);
  const scrolledTransform = await proxy
    .locator(".oridomi-panel")
    .first()
    .evaluate((element) => getComputedStyle(element).transform);
  expect(scrolledTransform).toBe(foldedTransform);

  await hint.click();
  await expect(firstBlock).toBeVisible({ timeout: 1000 });
  await expect(shell).toBeHidden();
});
