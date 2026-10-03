import { expect, test } from "./font-service.js";

for (const context of ["inline", "highlighted"]) {
  for (const operator of ["->", "|>"]) {
    test(`${context} code renders ${operator} as a ligature`, async ({
      page,
    }) => {
      await page.goto("/");
      const target =
        context === "inline"
          ? page.locator("code:not(pre code)").first()
          : page
              .locator(".expressive-code .code span")
              .filter({ hasText: /->/ })
              .first();
      await target.evaluate((element, text) => {
        element.textContent = text;
        element.dataset.testid = "code-ligature";
      }, operator);
      const code = page.getByTestId("code-ligature");
      await page.evaluate(() => document.fonts.ready);
      await expect(code).toHaveCSS("letter-spacing", "normal");
      await expect(code).toHaveCSS("font-family", /^"?PragmataPro"?,/);
      expect(
        await page.evaluate(() =>
          [...document.fonts].some(
            (font) =>
              font.family.replaceAll('"', "") === "PragmataPro" &&
              font.status === "loaded",
          ),
        ),
      ).toBe(true);

      const original = await code.screenshot();
      await code.evaluate((element) => {
        element.style.fontFeatureSettings = '"liga" 1, "calt" 1, "dlig" 1';
      });
      expect(await code.screenshot()).toEqual(original);

      await code.evaluate((element) => {
        element.style.fontFeatureSettings = '"liga" 0, "calt" 0, "dlig" 0';
      });
      expect(await code.screenshot()).not.toEqual(original);
    });
  }
}
