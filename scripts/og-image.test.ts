import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type TestContext, test } from "node:test";
import sharp from "sharp";
import subsetFont from "subset-font";

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

async function mockFonts(
  t: TestContext,
  failedFont?: "kit" | "bold",
): Promise<{ requests: string[]; directory: string }> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "og-image-test-"));
  t.mock.method(os, "tmpdir", () => directory);
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const readFile = fs.readFile;
  t.mock.method(
    fs,
    "readFile",
    async (...args: Parameters<typeof fs.readFile>) =>
      String(args[0]).endsWith("idlewild/1.401/light.woff2")
        ? sourceFont
        : readFile(...args),
  );
  const font = await subsetFont(sourceFont, "ArticleTyler Butler", {
    targetFormat: "sfnt",
  });
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
      return new Response(new Uint8Array(font), {
        status: failedFont === "bold" && url.endsWith("/bold.otf") ? 403 : 200,
      });
    },
  );
  return { requests, directory };
}

test("OG images use Idlewild labels and retain Adelle and Lato Bold", async (t) => {
  const { requests, directory } = await mockFonts(t);
  const composite = t.mock.method<sharp.Sharp, "composite">(
    sharp.prototype,
    "composite",
  );
  const { createOgImage }: typeof import("../src/lib/og-image.ts") =
    await import(
      new URL("../src/lib/og-image.ts?success", import.meta.url).href
    );
  for (const options of [
    {
      title: "Article",
      subtitle: "An italic subtitle",
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
  const requestedFonts = composite.mock.calls.flatMap((call) =>
    call.arguments[0].flatMap(({ input }) =>
      input && typeof input === "object" && "text" in input && input.text
        ? [input.text.font]
        : [],
    ),
  );
  assert.deepEqual(requestedFonts, [
    "Idlewild SSm Light, 30",
    "Lato Bold 18",
    "adelle-700-normal 72",
    "adelle-400-italic 34",
    "Lato Bold 18",
    "Idlewild SSm Light, 30",
    "Lato Bold 18",
    "adelle-700-normal 72",
  ]);
  const idlewild = await fs.readFile(
    path.join(directory, "tylerbutler-og-fonts", "idlewild-light.ttf"),
  );
  assert.equal(idlewild.readUInt32BE(0), 0x00010000);
  const fontfile = path.join(directory, "tylerbutler-og-fonts", "lato-700.ttf");
  const converted = await fs.readFile(fontfile);
  assert.equal(converted.readUInt32BE(0), 0x00010000);
  const render = (font: string) =>
    sharp({
      text: { text: "ARTICLE", font, fontfile, rgba: true },
    })
      .raw()
      .toBuffer({ resolveWithObject: true });
  const custom = await render("Lato Bold 18");
  const fallback = await render("nonexistent-og-font Bold 18");
  assert.notDeepEqual(
    custom.data,
    fallback.data,
    "The custom font must not render as the system fallback",
  );
});

test("OG image generation fails explicitly when the Adobe kit is unavailable", async (t) => {
  await mockFonts(t, "kit");
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
  await mockFonts(t, "bold");
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
