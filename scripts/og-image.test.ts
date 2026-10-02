import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type TestContext, test } from "node:test";
import sharp from "sharp";

const sourceFont = await fs.readFile(
  new URL(
    "../node_modules/@fontsource/lato/files/lato-latin-400-normal.woff2",
    import.meta.url,
  ),
);
const kit = [
  '@font-face {font-family:"adelle";font-weight:700;font-style:normal;src:url("https://example.com/bold.otf") format("opentype");}',
  '@font-face {font-family:"adelle";font-weight:400;font-style:italic;src:url("https://example.com/italic.otf") format("opentype");}',
].join("\n");

function mockFonts(t: TestContext, failedFont?: "kit" | "bold"): string[] {
  const requests: string[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (input: Parameters<typeof fetch>[0]) => {
      const url = String(input);
      requests.push(url);
      if (url === "https://use.typekit.net/zsx5vsn.css") {
        return new Response(kit, { status: failedFont === "kit" ? 403 : 200 });
      }
      assert.ok(
        [
          "https://example.com/bold.otf",
          "https://example.com/italic.otf",
        ].includes(url),
      );
      return new Response(new Uint8Array(sourceFont), {
        status: failedFont === "bold" && url.endsWith("/bold.otf") ? 403 : 200,
      });
    },
  );
  return requests;
}

test("OG images use local Lato labels and convert them to SFNT", async (t) => {
  const requests = mockFonts(t);
  const { createOgImage }: typeof import("../src/lib/og-image.ts") =
    await import(
      new URL("../src/lib/og-image.ts?success", import.meta.url).href
    );
  for (const options of [
    {
      title: "Article",
      kind: "ARTICLE" as const,
      date: new Date("2026-10-02"),
    },
    { title: "Tyler Butler", kind: "WEBSITE" as const },
  ]) {
    const image = await createOgImage(options);
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
  }
  assert.deepEqual(requests, [
    "https://use.typekit.net/zsx5vsn.css",
    "https://example.com/bold.otf",
    "https://example.com/italic.otf",
  ]);
  for (const weight of [300, 400]) {
    const converted = await fs.readFile(
      path.join(os.tmpdir(), "tylerbutler-og-fonts", `lato-${weight}.ttf`),
    );
    assert.equal(converted.readUInt32BE(0), 0x00010000);
  }
});

test("OG image generation fails explicitly when the Adobe kit is unavailable", async (t) => {
  mockFonts(t, "kit");
  const { createOgImage }: typeof import("../src/lib/og-image.ts") =
    await import(
      new URL("../src/lib/og-image.ts?failure", import.meta.url).href
    );
  await assert.rejects(
    createOgImage({
      title: "Article",
      kind: "ARTICLE",
      date: new Date("2026-10-02"),
    }),
    /Could not load Adobe Fonts kit: 403/,
  );
});

test("OG image generation fails explicitly when Adelle is unavailable", async (t) => {
  mockFonts(t, "bold");
  const { createOgImage }: typeof import("../src/lib/og-image.ts") =
    await import(
      new URL("../src/lib/og-image.ts?bold-failure", import.meta.url).href
    );
  await assert.rejects(
    createOgImage({
      title: "Article",
      kind: "ARTICLE",
      date: new Date("2026-10-02"),
    }),
    /Could not download adelle: 403/,
  );
});
