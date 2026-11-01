import { expect, test } from "./font-service.js";

test.describe("On-demand notes", () => {
  test.skip(!process.env.NOTES_TEST_BASE_URL, "Requires an Astro SSR target");

  test("feeds, archives, pagination, and canonical note pages agree", async ({
    page,
    request,
  }) => {
    const response = await request.get("/notes/feed.json");
    expect(response.status()).toBe(200);
    const feed = await response.json();
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.items.length).toBeGreaterThan(20);
    const stream = await page.goto("/notes/");
    expect(stream.status()).toBe(200);
    expect(stream.headers()["content-type"]).toContain("text/html");
    await expect(page.locator("h1")).toHaveText("Notes");
    await page.goto("/notes/2/");
    await expect(page.locator(".page-indicator")).toContainText("Page 2");
    await expect(page.locator(".h-entry")).toHaveCount(20);
    await expect(page.locator(".note-source-icon").first()).toHaveAttribute(
      "role",
      "img",
    );
    const pathname = new URL(feed.items[0].url).pathname;
    await page.goto(pathname);
    await expect(page.locator(".h-entry")).toHaveCount(1);
    await expect(page.locator(".e-content")).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      feed.items[0].url.replace(/\/$/, ""),
    );
    const [, , year, month] = pathname.split("/");
    await page.goto(`/notes/${year}/`);
    await expect(page.locator("h1")).toContainText(year);
    await page.goto(`/notes/${year}/${month}/`);
    await expect(page.locator(".archive-count")).toBeVisible();
    expect((await request.get("/notes/999999/")).status()).toBe(404);
    const sitemap = await request.get("/notes/sitemap.xml");
    expect(await sitemap.text()).toContain(feed.items[0].url);
    expect((await request.get("/micropub?q=config")).status()).toBe(401);
  });
  test("photos load and keep their microformats in light and dark layouts", async ({
    page,
    request,
  }) => {
    const feed = await (await request.get("/notes/feed.json")).json();
    const photo = feed.items.find((item) =>
      item.content_html.includes("/uploads/"),
    );
    test.skip(!photo, "Requires a published photo note");
    await page.goto(new URL(photo.url).pathname);
    const image = page.locator(".e-content img.u-photo").first();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((img) => img.naturalWidth))
      .toBeGreaterThan(0);
    const colors = [];
    for (const theme of ["light", "dark"]) {
      await page.evaluate((theme) => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
      }, theme);
      colors.push(
        await page
          .locator(".e-content")
          .evaluate((element) => getComputedStyle(element).color),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(colors[0]).not.toBe(colors[1]);
  });
});
