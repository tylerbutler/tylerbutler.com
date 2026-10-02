import { expect, test } from "@playwright/test";

const PINNED_ARTICLE = "/base64-encoded-sha256-hashes/";

test("Michroma mastheads fit desktop and narrow screens", async ({ page }) => {
  for (const route of ["/", PINNED_ARTICLE]) {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);

      const masthead = await page.evaluate(async () => {
        await document.fonts.ready;
        const title = document.querySelector(".site-header h1, .site-title");
        const header = document.querySelector(".site-header");
        const link = title?.querySelector("a");
        if (!(title instanceof HTMLElement) || !header || !link) {
          throw new Error("Missing masthead title, header, or home link");
        }
        const style = getComputedStyle(title);
        const titleBounds = title.getBoundingClientRect();
        const linkBounds = link.getBoundingClientRect();
        const headerBounds = header.getBoundingClientRect();

        return {
          family: style.fontFamily,
          loaded: Array.from(document.fonts).some(
            (font) => font.family === "Michroma" && font.status === "loaded",
          ),
          weight: style.fontWeight,
          height: titleBounds.height,
          lineHeight: Number.parseFloat(style.lineHeight),
          left: linkBounds.left,
          right: linkBounds.right,
          headerLeft: headerBounds.left,
          headerRight: headerBounds.right,
        };
      });

      expect(masthead.family).toMatch(/^"?Michroma"?/);
      expect(masthead.loaded).toBe(true);
      expect(masthead.weight).toBe("400");
      expect(masthead.height).toBeLessThanOrEqual(masthead.lineHeight + 1);
      expect(masthead.left).toBeGreaterThanOrEqual(masthead.headerLeft);
      expect(masthead.right).toBeLessThanOrEqual(masthead.headerRight);
    }
  }
});

test("homepage offers an early current-issue index", async ({ page }) => {
  await page.goto("/");

  const issue = page.getByRole("navigation", { name: "Current Issue" });
  await expect(issue).toBeVisible();
  await expect(issue.getByRole("listitem")).toHaveCount(5);
  await expect(
    issue.getByRole("link", { name: /All \d+ Articles/ }),
  ).toBeVisible();
});

test("interior pages use one page heading and a compact masthead", async ({
  page,
}) => {
  await page.goto(PINNED_ARTICLE);

  await expect(page.locator(".site-header")).toHaveClass(/site-header--small/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.locator(".article-content .heading-anchor").first(),
  ).not.toHaveAttribute("aria-label", "Link to this heading");
});

test("article archive groups years by decade with counts", async ({ page }) => {
  await page.goto("/articles/");

  const archiveNav = page.getByRole("navigation", {
    name: "Browse by Decade",
  });
  await expect(archiveNav).toBeVisible();
  await expect(archiveNav.getByRole("heading", { level: 3 })).not.toHaveCount(
    0,
  );
  await expect(
    archiveNav.getByRole("link", { name: /\d{4}, \d+ articles?/ }).first(),
  ).toBeVisible();
});

test("Pagefind returns content titles instead of the site name", async ({
  page,
}) => {
  await page.goto("/search/");

  const titles = await page.evaluate(async () => {
    const pagefindPath = "/pagefind/pagefind.js";
    const pagefind = await import(pagefindPath);
    const search = await pagefind.search("Gleam");
    const resultTitles = [];
    for (const result of search.results.slice(0, 5)) {
      const data = await result.data();
      resultTitles.push(data.meta.title);
    }
    return resultTitles;
  });

  expect(titles.length).toBeGreaterThan(0);
  expect(titles).not.toContain("Tyler Butler");
});
