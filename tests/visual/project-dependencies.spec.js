import { expect, test } from "./font-service.js";

test("project dependencies link in both directions without empty sections", async ({
  page,
}, testInfo) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/projects/tylerbutlercom/");
    await page.evaluate((theme) => {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
    }, theme);

    const poweredBy = page.getByRole("region", { name: "Powered by" });
    await expect(poweredBy.getByRole("link")).toHaveText([
      "rehype-footnotes",
      "remark-lazy-links",
      "remark-shift-headings",
    ]);
    await expect(
      page.getByRole("region", { name: "Powers", exact: true }),
    ).toHaveCount(0);
    await expect(poweredBy.getByRole("link").first()).toHaveAttribute(
      "href",
      "/projects/rehype-footnotes/",
    );
    await poweredBy.scrollIntoViewIfNeeded();
    const dependencyBounds = await poweredBy.evaluate((section) => ({
      right: section.getBoundingClientRect().right,
      viewport: document.documentElement.clientWidth,
      width: section.clientWidth,
      content: section.scrollWidth,
    }));
    expect(dependencyBounds.right).toBeLessThanOrEqual(
      dependencyBounds.viewport,
    );
    expect(dependencyBounds.content).toBeLessThanOrEqual(
      dependencyBounds.width,
    );
    await page.screenshot({
      path: testInfo.outputPath(`powered-by-${theme}.png`),
      fullPage: true,
    });

    await poweredBy.getByRole("link").first().click();
    const powers = page.getByRole("region", { name: "Powers", exact: true });
    await expect(powers.getByRole("link")).toHaveText(["tylerbutler.com"]);
    await expect(powers.getByRole("link")).toHaveAttribute(
      "href",
      "/projects/tylerbutlercom/",
    );
    await expect(page.getByRole("region", { name: "Powered by" })).toHaveCount(
      0,
    );
    await powers.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: testInfo.outputPath(`powers-${theme}.png`),
      fullPage: true,
    });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);

    await powers.getByRole("link").click();
    await expect(page).toHaveURL(/\/projects\/tylerbutlercom\/$/);
  }

  await page.goto("/projects/engineer/");
  await expect(page.locator(".project-relationships")).toHaveCount(0);
});
