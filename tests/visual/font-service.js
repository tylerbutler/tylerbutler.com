import { test as base } from "@playwright/test";

const FONT_SERVICE_ORIGIN = "https://fonts.tylerbutler.com";
const sourceOrigin = new URL(
  process.env.FONT_SERVICE_TEST_ORIGIN ?? FONT_SERVICE_ORIGIN,
).origin;

export const test = base.extend({
  page: async ({ page }, use) => {
    // Local previews are not approved font-service origins. Fetch as the
    // production site so visual tests can use the real published font bytes.
    await page.route(`${FONT_SERVICE_ORIGIN}/**`, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const response = await route.fetch({
        url: new URL(`${url.pathname}${url.search}`, sourceOrigin).href,
        headers: {
          ...request.headers(),
          origin: "https://tylerbutler.com",
        },
      });
      const headers = {
        ...response.headers(),
        "access-control-allow-origin": request.headers().origin ?? "*",
      };
      if (response.headers()["content-type"]?.startsWith("text/css")) {
        await route.fulfill({
          response,
          headers,
          body: (await response.text())
            .replaceAll(sourceOrigin, FONT_SERVICE_ORIGIN)
            .replaceAll("http://fonts.tylerbutler.com", FONT_SERVICE_ORIGIN),
        });
      } else {
        await route.fulfill({ response, headers });
      }
    });
    await use(page);
  },
});

export { expect } from "@playwright/test";
