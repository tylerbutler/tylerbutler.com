import fs from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";

const distDir = path.join(process.cwd(), "dist");
const fontsDir = path.join(distDir, "fonts");

async function walk(dir: string, ext: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full, ext)));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      files.push(full);
    }
  }
  return files;
}

async function collectGlyphs(): Promise<string> {
  const htmlFiles = await walk(distDir, ".html");
  const codepoints = new Set<number>();
  for (const file of htmlFiles) {
    const content = await fs.readFile(file, "utf8");
    for (const codepoint of content) {
      codepoints.add(codepoint.codePointAt(0) ?? 0);
    }
  }
  return Array.from(codepoints)
    .map((cp) => String.fromCodePoint(cp))
    .join("");
}

export async function optimizeFonts(): Promise<void> {
  try {
    await fs.access(fontsDir);
  } catch {
    console.warn(`⚠️  ${fontsDir} not found, skipping font subsetting`);
    return;
  }

  const fontFiles = (await fs.readdir(fontsDir)).filter((f) =>
    f.endsWith(".woff2"),
  );
  if (fontFiles.length === 0) {
    console.warn("⚠️  No .woff2 fonts found, skipping optimization");
    return;
  }

  console.log(`Collecting glyphs from HTML in ${distDir}...`);
  const text = await collectGlyphs();
  console.log(
    `Found ${[...new Set(text)].length} unique codepoints across the site`,
  );

  for (const fontFile of fontFiles) {
    const fontPath = path.join(fontsDir, fontFile);
    const original = await fs.readFile(fontPath);
    const subset = await subsetFont(original, text, { targetFormat: "woff2" });
    await fs.writeFile(fontPath, subset);
    const pct = ((1 - subset.length / original.length) * 100).toFixed(1);
    console.log(
      `  ✓ ${fontFile}: ${(original.length / 1024).toFixed(1)} KB → ${(subset.length / 1024).toFixed(1)} KB (-${pct}%)`,
    );
  }

  console.log("Font subsetting complete");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeFonts().catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Font optimization failed:", errorMessage);
    process.exit(1);
  });
}
