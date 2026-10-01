import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

const DEFAULT_API_URL = "https://fonts.tylerbutler.com/v1/subsets";
const FONT_FACES = [
  { id: "regular", fileName: "PragmataPro_Mono_R_liga_0902.woff2" },
  { id: "bold", fileName: "PragmataPro_Mono_B_liga_0902.woff2" },
  { id: "italic", fileName: "PragmataPro_Mono_I_liga_0902.woff2" },
  { id: "bold-italic", fileName: "PragmataPro_Mono_Z_liga_0902.woff2" },
] as const;

async function walk(dir: string, extension: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function collectCodepoints(distDir: string): Promise<number[]> {
  const htmlFiles = await walk(distDir, ".html");
  const codepoints = new Set<number>();

  for (const file of htmlFiles) {
    const content = await fs.readFile(file, "utf8");
    for (const character of content) {
      const codepoint = character.codePointAt(0);
      if (codepoint !== undefined) {
        codepoints.add(codepoint);
      }
    }
  }

  return [...codepoints].sort((left, right) => left - right);
}

export async function publishFontSubsets(outputDir: URL): Promise<void> {
  if (process.env.SKIP_FONT_SUBSET_PUBLISH === "1") {
    console.log("Skipping font subset publication");
    return;
  }

  const distDir = path.resolve(outputDir.pathname);
  const codepoints = await collectCodepoints(distDir);
  if (codepoints.length === 0) {
    throw new Error(`No characters found in generated HTML under ${distDir}`);
  }

  const apiUrl = process.env.FONT_SUBSET_API_URL ?? DEFAULT_API_URL;
  console.log(`Publishing ${codepoints.length} codepoints to ${apiUrl}`);

  const request = {
    site: "tylerbutler.com",
    font: "pragmata-pro",
    version: "0.902",
    codepoints,
  };
  let response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (response.status === 409) {
    const text = String.fromCodePoint(...codepoints);
    const faces = [];

    for (const face of FONT_FACES) {
      const sourcePath = path.join(
        process.cwd(),
        "public",
        "fonts",
        face.fileName,
      );
      const source = await fs.readFile(sourcePath);
      const generated = await subsetFont(source, text, {
        targetFormat: "woff2",
      });
      faces.push({
        id: face.id,
        data: Buffer.from(generated).toString("base64"),
      });
    }

    response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, faces }),
    });
  }

  if (!response.ok) {
    throw new Error(
      `Font subset publication failed (${response.status}): ${await response.text()}`,
    );
  }

  const result = (await response.json()) as {
    cached: boolean;
    codepointCount: number;
    cssUrl: string;
  };
  console.log(
    `Published ${result.codepointCount} codepoints to ${result.cssUrl} (${result.cached ? "cached" : "generated"})`,
  );
}
