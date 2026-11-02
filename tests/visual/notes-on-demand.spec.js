import { expect, test } from "./font-service.js";

test.describe("On-demand notes", () => {
  test.skip(!process.env.NOTES_TEST_BASE_URL, "Requires an Astro SSR target");

  test("direct feeds, archives, pagination, and canonical note pages work", async ({
    page,
    request,
  }) => {
    for (const [path, target] of [
      ["/notes/feed.json", "https://tylerbutler.micro.blog/feed.json"],
      ["/notes/feed.xml", "https://tylerbutler.micro.blog/feed.xml"],
    ]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(302);
      expect(response.headers().location).toBe(target);
    }
    const stream = await page.goto("/notes/");
    expect(stream.status()).toBe(200);
    expect(stream.headers()["content-type"]).toContain("text/html");
    await expect(page.locator("h1")).toHaveText("Notes");
    const pathname = await page
      .locator(".note-permalink-icon.u-url")
      .first()
      .getAttribute("href");
    await page.goto("/notes/2/");
    await expect(page.locator(".page-indicator")).toContainText("Page 2");
    await expect(page.locator(".h-entry")).toHaveCount(20);
    await expect(page.locator(".note-source-icon").first()).toHaveAttribute(
      "role",
      "img",
    );
    await page.goto(pathname);
    await expect(page.locator(".h-entry")).toHaveCount(1);
    await expect(page.locator(".e-content")).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://tylerbutler.com${pathname.replace(/\/$/, "")}`,
    );
    const [, , year, month] = pathname.split("/");
    await page.goto(`/notes/${year}/`);
    await expect(page.locator("h1")).toContainText(year);
    await page.goto(`/notes/${year}/${month}/`);
    await expect(page.locator(".archive-count")).toBeVisible();
    expect((await request.get("/notes/999999/")).status()).toBe(404);
    const sitemap = await request.get("/notes/sitemap.xml");
    expect(await sitemap.text()).toContain(
      `https://tylerbutler.com${pathname}/`,
    );
    expect((await request.get("/micropub?q=config")).status()).toBe(401);
  });
  test("photos load and keep their microformats in light and dark layouts", async ({
    page,
  }) => {
    await page.goto("/notes/");
    let card = page
      .locator(".note-card")
      .filter({ has: page.locator(".e-content img") })
      .first();
    if (!(await card.count())) {
      await page.goto("/notes/2/");
      card = page
        .locator(".note-card")
        .filter({ has: page.locator(".e-content img") })
        .first();
    }
    test.skip(!(await card.count()), "Requires a published photo note");
    const pathname = await card
      .locator(".note-permalink-icon.u-url")
      .getAttribute("href");
    await page.goto(pathname);
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
