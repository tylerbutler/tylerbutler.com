import { expect, test } from "@playwright/test";

// Screenshots are font- and content-sensitive: wait for webfonts (Typekit +
// local) so captures don't race the fallback-font render, and pin the
// randomized tagline to fixed text so the header height is deterministic.
/** @param {import("@playwright/test").Page} page */
const waitForFonts = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    // Stop the tagline rotation timer so pinned text survives the capture
    let id = window.setTimeout(() => {}, 0);
    while (id--) {
      window.clearTimeout(id);
      window.clearInterval(id);
    }
    const tagline = document.getElementById("random-headline");
    if (tagline) tagline.textContent = "Fixed tagline for visual tests ";
  });

test.describe("Homepage Layout", () => {
  test("homepage full page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);
    await expect(page).toHaveScreenshot("homepage-full.png", {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 1000,
      timeout: 30000, // very long page; WebKit needs more than the 5s default
      // Mask dynamic regions: randomized tagline, animated Lottie
      // constellations, live kudos counts, remote webring avatars
      mask: [
        page.locator("#random-headline"),
        page.locator(".constellation-icon"),
        page.locator(".preview-actions"),
        page.locator(".tinylytics_webring_avatar"),
      ],
    });
  });

  test("homepage header", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);
    await expect(page.locator(".site-header")).toHaveScreenshot("header.png", {
      mask: [
        page.locator("#random-headline"),
        page.locator(".tinylytics_webring_avatar"),
      ],
    });
  });

  test("homepage sidebar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);
    const sidebar = page.locator("#sidebar");
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot("sidebar.png");
    }
  });

  test("homepage main content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    // Hide dynamic elements that cause instability
    await page.addStyleTag({
      content: `
        iframe[src*="spotify"] { display: none !important; }
        time { visibility: hidden !important; }
        .date { visibility: hidden !important; }
      `,
    });

    // Wait a bit longer for content to stabilize
    await page.waitForTimeout(2000);

    await expect(page.locator("#main-content")).toHaveScreenshot(
      "main-content.png",
      {
        timeout: 10000,
        mask: [
          page.locator(".constellation-icon"),
          page.locator(".preview-actions"),
        ],
      },
    );
  });
});

test.describe("Article Layout", () => {
  test("single article page", async ({ page }) => {
    // Navigate to the first article available
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    // Find and click on the first article link
    const firstArticleLink = page.locator("article h2 a").first();
    await firstArticleLink.waitFor({ state: "visible" });
    await firstArticleLink.click();

    // Wait for the article page to load
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    // Take screenshot of the full article page
    await expect(page).toHaveScreenshot("article-full.png", {
      fullPage: true,
      threshold: 0.2,
      maxDiffPixels: 1000,
      timeout: 30000, // long article pages; WebKit needs more than the 5s default
      mask: [
        page.locator("#random-headline"),
        page.locator(".tinylytics_kudos"),
        page.locator(".tinylytics_webring_avatar"),
      ],
    });
  });

  test("article content area", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    const firstArticleLink = page.locator("article h2 a").first();
    await firstArticleLink.waitFor({ state: "visible" });
    await firstArticleLink.click();

    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    // Screenshot just the article content area - try different selectors
    const articleSelectors = [
      "article.post",
      "article",
      ".post",
      "main article",
      '[role="article"]',
    ];
    let foundSelector = null;

    for (const selector of articleSelectors) {
      if (await page.locator(selector).isVisible()) {
        foundSelector = selector;
        break;
      }
    }

    if (foundSelector) {
      await expect(page.locator(foundSelector)).toHaveScreenshot(
        "article-content.png",
      );
    } else {
      // Fallback to main content area
      await expect(page.locator("main, #main, .main")).toHaveScreenshot(
        "article-content.png",
      );
    }
  });
});

test.describe("Code Blocks", () => {
  test("code syntax highlighting", async ({ page }) => {
    // Navigate to an article that contains code blocks
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    // Look for a code block in any article on the homepage, or navigate to a specific article
    const codeBlock = page.locator("pre code").first();
    if (await codeBlock.isVisible()) {
      await expect(codeBlock).toHaveScreenshot("code-block.png");
    }
  });
});

test.describe("Footer", () => {
  test("footer layout", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    // Try different footer selectors
    const footerSelectors = [
      "footer#primary",
      "footer",
      ".footer",
      "#footer",
      '[role="contentinfo"]',
    ];
    let foundSelector = null;

    for (const selector of footerSelectors) {
      if (await page.locator(selector).isVisible()) {
        foundSelector = selector;
        break;
      }
    }

    if (foundSelector) {
      await expect(page.locator(foundSelector)).toHaveScreenshot("footer.png");
    } else {
      // Skip test if no footer found
      console.log("No footer element found, skipping footer screenshot test");
    }
  });
});
