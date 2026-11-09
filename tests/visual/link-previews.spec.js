import { expect, test } from "@playwright/test";

test("link posts render source metadata and preserve attribution", async ({
  page,
}) => {
  await page.goto("/aerobie/");
  const source = page.locator(".link-post-reference");
  const preview = source.locator(".link-preview");
  await expect(preview).toBeVisible();
  await expect(
    preview.getByRole("link", { name: "A source title for the link preview" }),
  ).toHaveAttribute(
    "href",
    "https://priceonomics.com/the-invention-of-the-aeropress/",
  );
  await expect(preview.locator(".link-preview__description")).toContainText(
    "The source description provides context",
  );
  await expect(
    preview.getByRole("img", { name: "A painted sky" }),
  ).toHaveAttribute("src", "https://tylerbutler.com/bg-hq.webp");
  await expect(
    source.getByRole("link", { name: "Read original" }),
  ).toHaveAttribute("target", "_blank");
  await expect(source.getByRole("link", { name: "John Gruber" })).toBeVisible();

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
});

test("missing images and failed metadata keep the original link usable", async ({
  page,
}) => {
  await page.goto("/software-hatred/");
  const preview = page.locator(".link-post-reference .link-preview");
  await expect(preview).toHaveClass(/link-preview--no-media/);
  await expect(preview.getByRole("link")).toHaveText(
    "A source without an image",
  );
  await expect(preview.locator("img, video")).toHaveCount(0);

  await page.goto("/getting-rich/");
  const source = page.locator(".link-post-reference");
  await expect(source.locator(".link-preview")).toBeHidden();
  await expect(
    source.getByRole("link", { name: "Read original" }),
  ).toHaveAttribute("href", "https://paulgraham.com/bubble.html");
});

test("standard articles do not unfurl ordinary body links", async ({
  page,
}) => {
  await page.goto("/base64-encoded-sha256-hashes/");
  await expect(page.locator(".link-preview")).toHaveCount(0);
  await expect(page.locator(".article-content a[href]")).not.toHaveCount(0);
});

test("project pages unfurl websites but keep HexDocs as badge links", async ({
  page,
}) => {
  await page.goto("/projects/engineer/");
  const preview = page.locator(".project-previews .link-preview");
  await expect(preview.getByRole("link")).toHaveText("Engineer documentation");
  await expect(preview.getByRole("link")).toHaveAttribute(
    "href",
    "https://engineer.readthedocs.org/",
  );
  await expect(preview.locator("img")).toHaveCount(1);
  await expect(
    page.locator(".project-links").getByRole("link", { name: "Website" }),
  ).toHaveAttribute("data-tinylytics-event", "project.url");

  await page.goto("/projects/shelf/");
  await expect(page.locator(".project-previews .link-preview")).toHaveCount(1);
  await expect(
    page.locator(".project-previews .link-preview__title"),
  ).toHaveAttribute("href", "https://shelf.tylerbutler.com/");
  await expect(
    page.locator('.project-previews a[href^="https://hexdocs.pm/"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('.badge-rows a[href="https://hexdocs.pm/shelf"]'),
  ).toBeVisible();
  await expect(
    page.locator(".project-links").getByRole("link", { name: "GitHub" }),
  ).toBeVisible();
});

test("failed project previews retain actions and do not add empty spacing", async ({
  page,
}) => {
  await page.goto("/projects/trellis/");
  await expect(page.locator(".project-previews")).toBeHidden();
  await expect(
    page.locator(".project-links").getByRole("link", { name: "Website" }),
  ).toHaveAttribute("href", "https://trellis.tylerbutler.com/");

  await page.goto("/projects/repopo/");
  await expect(page.locator(".project-previews")).toHaveCount(0);
  await expect(
    page.locator(".project-links").getByRole("link", { name: "GitHub" }),
  ).toBeVisible();
});

test("the projects listing keeps links without unfurling", async ({ page }) => {
  await page.goto("/projects/");
  await expect(page.locator(".link-preview")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Website", exact: true }).first(),
  ).toBeVisible();
});
