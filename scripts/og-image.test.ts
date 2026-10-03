import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, type TestContext, test } from "node:test";
import sharp from "sharp";
import subsetFont from "subset-font";
import { prepareOgAssets } from "./prepare-og-assets.ts";

const sourceFont = await fs.readFile(
  new URL(
    "../node_modules/@fontsource/lato/files/lato-latin-400-normal.woff2",
    import.meta.url,
  ),
);
const boldFont = await fs.readFile(
  new URL(
    "../node_modules/@fontsource/lato/files/lato-latin-700-normal.woff2",
    import.meta.url,
  ),
);
const background = await fs.readFile(
  new URL("../public/bg-hq.webp", import.meta.url),
);
const kit = [
  '@font-face {font-family:"adelle";font-weight:700;font-style:normal;src:url("https://example.com/bold.otf") format("opentype");}',
  '@font-face {font-family:"adelle";font-weight:400;font-style:italic;src:url("https://example.com/italic.otf") format("opentype");}',
].join("\n");
let rendererImports = 0;
const directories: string[] = [];
after(async () => {
  // Fontconfig can retain font paths until the test process exits.
  await Promise.all(
    directories.map((directory) =>
      fs.rm(directory, { recursive: true, force: true }),
    ),
  );
});

async function prepare(
  t: TestContext,
  failedFont?: "kit" | "bold" | "missing-face",
): Promise<string[]> {
  const cwd = process.cwd();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "og-image-test-"));
  directories.push(root);
  t.after(() => {
    process.chdir(cwd);
  });
  const sources = [
    ["public/fonts/idlewild/1.401/light.woff2", sourceFont],
    [
      "node_modules/@fontsource/lato/files/lato-latin-700-normal.woff2",
      boldFont,
    ],
    ["public/bg-hq.webp", background],
  ] as const;
  for (const [filename, data] of sources) {
    await fs.mkdir(path.dirname(path.join(root, filename)), {
      recursive: true,
    });
    await fs.writeFile(path.join(root, filename), data);
  }
  process.chdir(root);
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
        return new Response(failedFont === "missing-face" ? "" : kit, {
          status: failedFont === "kit" ? 403 : 200,
        });
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
  return requests;
}

async function importRenderer() {
  return import(
    new URL(`../src/lib/og-image.ts?test=${rendererImports++}`, import.meta.url)
      .href
  ) as Promise<typeof import("../src/lib/og-image.ts")>;
}

test("prepares private fonts and renders PNGs without runtime downloads or writes", async (t) => {
  const requests = await prepare(t);
  await prepareOgAssets();
  assert.deepEqual(requests, [
    "https://use.typekit.net/zsx5vsn.css",
    "https://example.com/bold.otf",
    "https://example.com/italic.otf",
  ]);
  for (const filename of ["idlewild-light.ttf", "lato-700.ttf"]) {
    const converted = await fs.readFile(
      path.join(".cache/og-assets", filename),
    );
    assert.equal(converted.readUInt32BE(0), 0x00010000);
  }
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected runtime network request");
  });
  t.mock.method(fs, "writeFile", async () => {
    throw new Error("Unexpected runtime write");
  });
  t.mock.method(fs, "mkdir", async () => {
    throw new Error("Unexpected runtime directory");
  });
  const composite = t.mock.method<sharp.Sharp, "composite">(
    sharp.prototype,
    "composite",
  );
  const { createOgImage } = await importRenderer();
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
  assert.equal(
    composite.mock.calls.filter((call) =>
      call.arguments[0].some(({ input }) => Buffer.isBuffer(input)),
    ).length,
    1,
    "Background processing is reused across requests",
  );
  const render = (font: string) =>
    sharp({
      text: {
        text: "ARTICLE",
        font,
        fontfile: path.resolve(".cache/og-assets/lato-700.ttf"),
        rgba: true,
      },
    })
      .raw()
      .toBuffer();
  assert.notDeepEqual(
    await render("Lato Bold 18"),
    await render("nonexistent-og-font Bold 18"),
    "The custom font must not render as the system fallback",
  );
});

for (const [failure, message] of [
  ["kit", /Could not load Adobe Fonts kit: 403/],
  ["bold", /Could not download adelle: 403/],
  ["missing-face", /Adobe Fonts kit is missing adelle/],
] as const) {
  test(`asset preparation fails explicitly for ${failure}`, async (t) => {
    await prepare(t, failure);
    await assert.rejects(prepareOgAssets(), message);
  });
}

test("asset preparation fails for missing local font sources", async (t) => {
  await prepare(t);
  await fs.unlink("public/fonts/idlewild/1.401/light.woff2");
  await assert.rejects(prepareOgAssets(), { code: "ENOENT" });
});

test("missing prepared fonts fail instead of silently using fallback fonts", async (t) => {
  await prepare(t);
  const { createOgImage } = await importRenderer();
  await assert.rejects(createOgImage({ title: "Article", kind: "WEBSITE" }), {
    code: "ENOENT",
  });
});

test("missing background fails on request and can recover on the next request", async (t) => {
  await prepare(t);
  await prepareOgAssets();
  await fs.unlink("public/bg-hq.webp");
  const { createOgImage } = await importRenderer();
  await assert.rejects(
    createOgImage({ title: "Article", kind: "WEBSITE" }),
    /Input file is missing/,
  );
  await fs.writeFile("public/bg-hq.webp", background);
  const image = await createOgImage({ title: "Article", kind: "WEBSITE" });
  assert.equal((await sharp(image).metadata()).width, 1200);
});
