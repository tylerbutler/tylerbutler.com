import { expect, test } from "@playwright/test";

const PINNED_ARTICLE = "/base64-encoded-sha256-hashes/";

test("homepage offers an early latest-articles index", async ({ page }) => {
  await page.goto("/");

  const issue = page.locator(".current-issue");
  await expect(issue).toBeVisible();
  await expect(
    issue.getByRole("heading", { name: /Latest Articles|Read Next/ }),
  ).toBeVisible();
  await expect(issue.locator("#current-issue-list > li")).toHaveCount(5);
  const archiveLink = issue.getByRole("link", {
    name: /Browse All \d+ Articles/,
  });
  if ((page.viewportSize()?.width ?? Infinity) <= 600) {
    await expect(archiveLink).toBeHidden();
  } else {
    await expect(archiveLink).toBeVisible();
  }
});

test("desktop reading guide uses explicit modes", async ({ page }) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) < 1200,
    "The reading guide mode switch is a wide-screen enhancement.",
  );
  await page.goto("/");

  const guide = page.locator(".current-issue");
  const issueButton = guide.getByRole("button", { name: "Articles" });
  const sectionsButton = guide.getByRole("button", { name: "Sections" });

  await expect(issueButton).toHaveAttribute("aria-pressed", "true");
  await sectionsButton.click();
  await expect(sectionsButton).toHaveAttribute("aria-pressed", "true");
  await expect(guide.locator("[data-rail-heading]")).toContainText(
    "Contents ·",
  );
  await expect(guide.locator(".issue-sections:not([hidden])")).toBeVisible();
});

test("mobile homepage prioritizes reading and preserves article context", async ({
  page,
}) => {
  test.skip(
    (page.viewportSize()?.width ?? Infinity) > 600,
    "The compact article navigator is a phone layout.",
  );
  await page.goto("/");

  const issueItems = page.locator("#current-issue-list > li");
  await expect(issueItems.first()).toBeHidden();
  await expect(issueItems.nth(1)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Read Next" })).toBeVisible();
  await expect(page.locator(".identity-disclosure")).toBeVisible();
  await expect(page.locator(".identity-links--desktop")).toBeHidden();
  await expect(
    page
      .locator(".site-header")
      .getByRole("link", { name: "Subscribe via RSS" }),
  ).toBeVisible();

  const firstTitle = page.locator(".article-preview h2").first();
  await expect(firstTitle).toBeVisible();
  const firstTitleTop = await firstTitle.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(firstTitleTop).toBeLessThan(700);
  await expect(firstTitle.locator(".stream-title-icon")).toBeVisible();

  await page.locator(".article-preview").nth(1).scrollIntoViewIfNeeded();
  await expect(page.locator(".mobile-stream-nav")).toBeVisible();
});

test("subscribe page explains and exposes every feed", async ({ page }) => {
  await page.goto("/subscribe");

  await expect(
    page.getByRole("heading", { name: "Subscribe", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy address" })).toHaveCount(
    4,
  );
  await expect(page.getByRole("link", { name: "Open feed →" })).toHaveCount(4);
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
