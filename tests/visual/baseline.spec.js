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

// The homepage rollup and "latest article" change with every publish, so
// content-driven captures are pinned to a frozen 2012 post (never edited,
// contains PowerShell/C#/Python code blocks) instead of whatever is newest.
const PINNED_ARTICLE = "/base64-encoded-sha256-hashes/";

test.describe("Homepage Layout", () => {
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
});

test.describe("Article Layout", () => {
  test("single article page", async ({ page }) => {
    await page.goto(PINNED_ARTICLE);
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
    await page.goto(PINNED_ARTICLE);
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    await expect(page.locator("article")).toHaveScreenshot(
      "article-content.png",
      {
        mask: [page.locator(".tinylytics_kudos")],
      },
    );
  });
});

test.describe("Code Blocks", () => {
  test("code syntax highlighting", async ({ page }) => {
    await page.goto(PINNED_ARTICLE);
    await page.waitForLoadState("networkidle");
    await waitForFonts(page);

    await expect(page.locator(".expressive-code").first()).toHaveScreenshot(
      "code-block.png",
    );
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
      await expect(page.locator(foundSelector)).toHaveScreenshot("footer.png", {
        // The footer constellation mark is animated; mask it so captures
        // don't race the animation frame
        mask: [page.locator(".footer-constellation")],
      });
    } else {
      // Skip test if no footer found
      console.log("No footer element found, skipping footer screenshot test");
    }
  });
});
