import { expect, test } from "./font-service.js";

const PINNED_ARTICLE = "/base64-encoded-sha256-hashes/";

test("Idlewild mastheads fit desktop and narrow screens", async ({ page }) => {
  for (const route of ["/", PINNED_ARTICLE]) {
    for (const width of [320, 481, 768, 1440]) {
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
            (font) =>
              font.family.replaceAll('"', "") === "Idlewild SSm" &&
              font.weight === "300" &&
              font.status === "loaded",
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

      expect(masthead.family).toMatch(/^"?Idlewild SSm"?/);
      expect(masthead.loaded).toBe(true);
      expect(masthead.weight).toBe("300");
      expect(masthead.height, `${route} at ${width}px`).toBeLessThanOrEqual(
        masthead.lineHeight + 1,
      );
      expect(masthead.left).toBeGreaterThanOrEqual(masthead.headerLeft);
      expect(masthead.right).toBeLessThanOrEqual(masthead.headerRight);
    }
  }
});

test("Lato labels and the Adelle tagline fit without horizontal overflow", async ({
  page,
}) => {
  for (const route of ["/", PINNED_ARTICLE, "/articles/", "/search/"]) {
    for (const width of [320, 481, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const typography = await page.evaluate(async () => {
        await document.fonts.ready;
        const navLinks = [
          ...document.querySelectorAll('.site-header nav[aria-label="Main"] a'),
        ];
        const tagline = document.querySelector(".tagline");
        const title = document.querySelector(".site-header h1, .site-title");
        if (!title || navLinks.length === 0)
          throw new Error("Missing masthead or navigation");
        return {
          titleSize: Number.parseFloat(getComputedStyle(title).fontSize),
          tagline: tagline
            ? {
                family: getComputedStyle(tagline).fontFamily,
                style: getComputedStyle(tagline).fontStyle,
                weight: getComputedStyle(tagline).fontWeight,
                transform: getComputedStyle(tagline).textTransform,
              }
            : null,
          links: navLinks.map((link) => {
            const bounds = link.getBoundingClientRect();
            const style = getComputedStyle(link);
            return {
              family: style.fontFamily,
              weight: style.fontWeight,
              left: bounds.left,
              right: bounds.right,
              width: Math.ceil(bounds.width),
              scrollWidth: link.scrollWidth,
              height: bounds.height,
              singleLineHeight: Math.max(
                Number.parseFloat(style.minHeight),
                Number.parseFloat(style.lineHeight) +
                  Number.parseFloat(style.paddingTop) +
                  Number.parseFloat(style.paddingBottom),
              ),
            };
          }),
          regularLoaded: [...document.fonts].some(
            (font) =>
              font.family.replaceAll('"', "") === "Lato" &&
              font.weight === "400" &&
              font.status === "loaded",
          ),
          viewportWidth: document.documentElement.clientWidth,
          documentWidth: document.documentElement.scrollWidth,
        };
      });
      expect(typography.titleSize).toBeLessThanOrEqual(route === "/" ? 36 : 24);
      expect(typography.regularLoaded).toBe(true);
      if (route === "/") {
        expect(typography.tagline?.family).toMatch(/^"?adelle"?/);
        expect(typography.tagline?.style).toBe("italic");
        expect(typography.tagline?.weight).toBe("400");
        expect(typography.tagline?.transform).toBe("none");
      }
      for (const link of typography.links) {
        expect(link.family).toMatch(/^"?Lato"?/);
        expect(link.weight).toBe("400");
        expect(link.left).toBeGreaterThanOrEqual(0);
        expect(link.right).toBeLessThanOrEqual(typography.viewportWidth);
        expect(link.scrollWidth).toBeLessThanOrEqual(link.width);
        expect(link.height).toBeLessThanOrEqual(link.singleLineHeight + 1);
      }
      expect(
        typography.documentWidth,
        `${route} at ${width}px`,
      ).toBeLessThanOrEqual(typography.viewportWidth);
    }
  }
});

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
