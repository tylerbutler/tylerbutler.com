import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type TestContext, test } from "node:test";
import { pathToFileURL } from "node:url";
import { downloadFonts } from "./download-fonts.ts";
import {
  FONT_FAMILIES,
  FONT_SERVICE_ORIGIN,
  FONT_SITE,
} from "./font-config.ts";
import { publishFontSubsets } from "./publish-font-subsets.ts";

const sourceFont = await fs.readFile(
  new URL(
    "../node_modules/@fontsource/lato/files/lato-latin-400-normal.woff2",
    import.meta.url,
  ),
);
const html = "<html><body>Tyler Butler <code>AAB</code></body></html>";

interface SubsetRequest {
  site: string;
  font: string;
  version: string;
  codepoints: number[];
  faces?: Array<{ id: string; data: string }>;
}

type FetchInput = Parameters<typeof globalThis.fetch>[0];

async function prepare(t: TestContext): Promise<URL> {
  const cwd = process.cwd();
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "site-fonts-"));
  const keys = [
    "GITHUB_TOKEN",
    "FONT_SUBSET_API_URL",
    "SKIP_FONT_SUBSET_PUBLISH",
  ] as const;
  const environment = keys.map((key) => [key, process.env[key]] as const);
  for (const key of keys) delete process.env[key];
  t.after(async () => {
    process.chdir(cwd);
    for (const [key, value] of environment) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await fs.rm(root, { recursive: true, force: true });
  });
  process.chdir(root);
  await fs.mkdir("dist");
  await fs.writeFile("dist/index.html", html);
  return pathToFileURL(path.join(root, "dist/"));
}

async function seedFonts(ids = FONT_FAMILIES.map((family) => family.id)) {
  for (const family of FONT_FAMILIES) {
    if (!ids.includes(family.id)) continue;
    for (const face of family.faces) {
      const output = path.join("public/fonts", face.fileName);
      await fs.mkdir(path.dirname(output), { recursive: true });
      await fs.writeFile(output, sourceFont);
    }
  }
}

test("downloads all Idlewild sources without sending GitHub credentials", async (t) => {
  await prepare(t);
  await seedFonts(["pragmata-pro"]);
  process.env.GITHUB_TOKEN = "test-token";
  const downloaded: string[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (input: FetchInput, init?: RequestInit) => {
      const url = String(input);
      downloaded.push(url);
      assert.ok(url.startsWith(`${FONT_SERVICE_ORIGIN}/fonts/idlewild/1.401/`));
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("Origin"), `https://${FONT_SITE}`);
      assert.equal(headers.get("Authorization"), null);
      return new Response(new Uint8Array(sourceFont));
    },
  );

  await downloadFonts();

  const idlewild = FONT_FAMILIES[1];
  assert.deepEqual(
    downloaded,
    idlewild.faces.map(
      (face) => `${FONT_SERVICE_ORIGIN}/fonts/${face.fileName}`,
    ),
  );
  for (const face of idlewild.faces) {
    assert.deepEqual(
      await fs.readFile(path.join("public/fonts", face.fileName)),
      sourceFont,
    );
  }
});

test("skips downloads when both families are already cached", async (t) => {
  await prepare(t);
  await seedFonts();
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });

  await downloadFonts();

  assert.equal(fetch.mock.callCount(), 0);
});

test("fails explicitly when an Idlewild source cannot be downloaded", async (t) => {
  await prepare(t);
  await seedFonts(["pragmata-pro"]);
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("Forbidden", { status: 403 }),
  );

  await assert.rejects(
    downloadFonts(),
    /Failed to download font: idlewild\/1\.401\/light\.woff2 - HTTP 403/,
  );
});

test("downloads PragmataPro 0.903 from the font service without GitHub credentials", async (t) => {
  await prepare(t);
  await seedFonts(["idlewild"]);
  const downloaded: string[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (input: FetchInput, init?: RequestInit) => {
      downloaded.push(String(input));
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("Origin"), `https://${FONT_SITE}`);
      assert.equal(headers.get("Authorization"), null);
      return new Response(new Uint8Array(sourceFont));
    },
  );

  await downloadFonts();

  assert.equal(FONT_FAMILIES[0].version, "0.903");
  assert.deepEqual(
    downloaded,
    ["regular", "bold", "italic", "bold-italic"].map(
      (face) => `${FONT_SERVICE_ORIGIN}/fonts/pragmata-pro/0.903/${face}.woff2`,
    ),
  );
  for (const face of FONT_FAMILIES[0].faces) {
    assert.deepEqual(
      await fs.readFile(path.join("public/fonts", face.fileName)),
      sourceFont,
    );
  }
});

test("fails explicitly when a PragmataPro source cannot be downloaded", async (t) => {
  await prepare(t);
  await seedFonts(["idlewild"]);
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("Not Found", { status: 404 }),
  );

  await assert.rejects(
    downloadFonts(),
    /Failed to download font: pragmata-pro\/0\.903\/regular\.woff2 - HTTP 404/,
  );
});

test("checks independent caches for PragmataPro and Idlewild", async (t) => {
  const outputDir = await prepare(t);
  const requests: SubsetRequest[] = [];
  process.env.FONT_SUBSET_API_URL = "http://localhost:18787/v1/subsets";
  t.mock.method(
    globalThis,
    "fetch",
    async (input: FetchInput, init?: RequestInit) => {
      assert.equal(String(input), process.env.FONT_SUBSET_API_URL);
      const request = JSON.parse(String(init?.body)) as SubsetRequest;
      requests.push(request);
      return Response.json({
        cached: true,
        codepointCount: request.codepoints.length,
        cssUrl: `${FONT_SERVICE_ORIGIN}/css/sites/${FONT_SITE}/${request.font}.css`,
      });
    },
  );

  await publishFontSubsets(outputDir);

  assert.deepEqual(
    requests.map(({ site, font, version, faces }) => ({
      site,
      font,
      version,
      faces,
    })),
    FONT_FAMILIES.map((family) => ({
      site: FONT_SITE,
      font: family.id,
      version: family.version,
      faces: undefined,
    })),
  );
  const expected = [
    ...new Set(
      [...html]
        .map((character) => character.codePointAt(0))
        .filter((codepoint) => codepoint !== undefined),
    ),
  ].sort((left, right) => left - right);
  assert.deepEqual(requests[0].codepoints, expected);
  assert.deepEqual(requests[1].codepoints, expected);
});

test("generates and uploads all faces for both uncached families", async (t) => {
  const outputDir = await prepare(t);
  await seedFonts();
  const requests: SubsetRequest[] = [];
  t.mock.method(
    globalThis,
    "fetch",
    async (_input: FetchInput, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body)) as SubsetRequest;
      requests.push(request);
      const family = FONT_FAMILIES.find(
        (candidate) => candidate.id === request.font,
      );
      assert.ok(family);
      if (!request.faces) {
        return Response.json(
          { requiredFaces: family.faces.map((face) => face.id) },
          { status: 409 },
        );
      }
      assert.deepEqual(
        request.faces.map((face) => face.id),
        family.faces.map((face) => face.id),
      );
      for (const face of request.faces) {
        const generated = Buffer.from(face.data, "base64");
        assert.equal(generated.subarray(0, 4).toString("ascii"), "wOF2");
        assert.ok(generated.length < sourceFont.length);
      }
      return Response.json({
        cached: false,
        codepointCount: request.codepoints.length,
        cssUrl: `${FONT_SERVICE_ORIGIN}/css/sites/${FONT_SITE}/${request.font}.css`,
      });
    },
  );

  await publishFontSubsets(outputDir);

  assert.deepEqual(
    requests.map((request) => request.font),
    ["pragmata-pro", "pragmata-pro", "idlewild", "idlewild"],
  );
});

test("fails the build when Idlewild publication is rejected", async (t) => {
  const outputDir = await prepare(t);
  t.mock.method(
    globalThis,
    "fetch",
    async (_input: FetchInput, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body)) as SubsetRequest;
      if (request.font === "idlewild") {
        return Response.json({ error: "Unknown font" }, { status: 404 });
      }
      return Response.json({
        cached: true,
        codepointCount: request.codepoints.length,
        cssUrl:
          "https://fonts.tylerbutler.com/css/sites/tylerbutler.com/pragmata-pro.css",
      });
    },
  );

  await assert.rejects(
    publishFontSubsets(outputDir),
    /Font subset publication failed for idlewild \(404\)/,
  );
});

test("skips both families for an offline build", async (t) => {
  const outputDir = await prepare(t);
  process.env.SKIP_FONT_SUBSET_PUBLISH = "1";
  const fetch = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });

  await publishFontSubsets(outputDir);

  assert.equal(fetch.mock.callCount(), 0);
});
