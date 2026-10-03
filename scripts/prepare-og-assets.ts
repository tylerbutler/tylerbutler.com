import fs from "node:fs/promises";
import path from "node:path";
import subsetFont from "subset-font";
import { downloadFonts } from "./download-fonts.ts";
import { FONT_FAMILIES } from "./font-config.ts";

const TYPEKIT_CSS_URL = "https://use.typekit.net/zsx5vsn.css";

interface TypekitFont {
  weight: number;
  style: "normal" | "italic";
}

function findTypekitFontUrl(css: string, font: TypekitFont): string {
  const block = (css.match(/@font-face\s*{[^}]+}/g) ?? []).find(
    (candidate) =>
      candidate.includes('font-family:"adelle"') &&
      candidate.includes(`font-weight:${font.weight}`) &&
      candidate.includes(`font-style:${font.style}`),
  );
  const url = block?.match(/url\("([^"]+)"\) format\("opentype"\)/)?.[1];
  if (!url) {
    throw new Error(
      `Adobe Fonts kit is missing adelle ${font.weight} ${font.style}`,
    );
  }
  return url;
}

export async function prepareOgAssets(): Promise<void> {
  const directory = path.join(process.cwd(), ".cache", "og-assets");
  const response = await fetch(TYPEKIT_CSS_URL);
  if (!response.ok) {
    throw new Error(
      `Could not load Adobe Fonts kit: ${response.status} ${response.statusText}`,
    );
  }
  const css = await response.text();
  const idlewild = FONT_FAMILIES.find(
    (family) => family.id === "idlewild",
  )?.faces.find((face) => face.id === "light");
  if (!idlewild) {
    throw new Error("Idlewild Light is missing from the font configuration");
  }

  const assets = await Promise.all([
    ...[
      { weight: 700, style: "normal" as const },
      { weight: 400, style: "italic" as const },
    ].map(async (font) => {
      const response = await fetch(findTypekitFontUrl(css, font));
      if (!response.ok) {
        throw new Error(
          `Could not download adelle: ${response.status} ${response.statusText}`,
        );
      }
      return {
        filename: `adelle-${font.weight}-${font.style}.otf`,
        data: Buffer.from(await response.arrayBuffer()),
      };
    }),
    ...[
      {
        source: path.join("public", "fonts", idlewild.fileName),
        text: "TYLERBUTLER.COM",
        filename: "idlewild-light.ttf",
      },
      {
        source: path.join(
          "node_modules",
          "@fontsource",
          "lato",
          "files",
          "lato-latin-700-normal.woff2",
        ),
        text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789, ",
        filename: "lato-700.ttf",
      },
    ].map(async ({ source, text, filename }) => {
      // Pango needs SFNT files, not the browser's WOFF2 sources.
      const font = await subsetFont(await fs.readFile(source), text, {
        targetFormat: "sfnt",
      });
      return { filename, data: font };
    }),
  ]);
  await fs.mkdir(directory, { recursive: true });
  await Promise.all(
    assets.map(({ filename, data }) =>
      fs.writeFile(path.join(directory, filename), data),
    ),
  );
}

if (import.meta.main) {
  await downloadFonts();
  await prepareOgAssets();
}
