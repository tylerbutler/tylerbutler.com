import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type TestContext, test } from "node:test";
import sharp from "sharp";
import { FONT_SERVICE_ORIGIN, FONT_SITE } from "./font-config.ts";

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

function mockFonts(t: TestContext, failedFace?: "light" | "book"): string[] {
  const requests: string[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      const url = String(input);
      requests.push(url);
      if (url.startsWith(FONT_SERVICE_ORIGIN)) {
        assert.ok(
          ["light", "book"].some(
            (face) =>
              url ===
              `${FONT_SERVICE_ORIGIN}/fonts/idlewild/1.401/${face}.woff2`,
          ),
        );
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("Origin"), `https://${FONT_SITE}`);
        assert.equal(headers.get("Authorization"), null);
        return new Response(new Uint8Array(sourceFont), {
          status:
            failedFace && url.endsWith(`/${failedFace}.woff2`) ? 403 : 200,
        });
      }
      if (url === "https://use.typekit.net/zsx5vsn.css") {
        return new Response(kit);
      }
      assert.ok(
        [
          "https://example.com/bold.otf",
          "https://example.com/italic.otf",
        ].includes(url),
      );
      return new Response(new Uint8Array(sourceFont));
    },
  );
  return requests;
}

test("OG images use Idlewild Light and Book for labels and convert them to SFNT", async (t) => {
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
  assert.equal(
    requests.filter((url) => url.startsWith(FONT_SERVICE_ORIGIN)).length,
    2,
  );
  for (const face of ["light", "book"]) {
    assert.equal(
      requests.filter((url) => url.endsWith(`/${face}.woff2`)).length,
      1,
    );
    const converted = await fs.readFile(
      path.join(os.tmpdir(), "tylerbutler-og-fonts", `idlewild-${face}.ttf`),
    );
    assert.equal(converted.readUInt32BE(0), 0x00010000);
  }
});

test("OG image generation fails explicitly when Idlewild Light is unavailable", async (t) => {
  mockFonts(t, "light");
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
    /Could not download Idlewild light: 403/,
  );
});

test("OG image generation fails explicitly when Idlewild Book is unavailable", async (t) => {
  mockFonts(t, "book");
  const { createOgImage }: typeof import("../src/lib/og-image.ts") =
    await import(
      new URL("../src/lib/og-image.ts?book-failure", import.meta.url).href
    );
  await assert.rejects(
    createOgImage({
      title: "Article",
      kind: "ARTICLE",
      date: new Date("2026-10-02"),
    }),
    /Could not download Idlewild book: 403/,
  );
});
