import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const TEMPLATE_VERSION = 2;
const cacheDirectory = path.join(process.cwd(), ".cache", "og-images");
const backgroundPath = path.join(process.cwd(), "public", "bg-hq.webp");
const backgroundHash = createHash("sha256")
  .update(fs.readFileSync(backgroundPath))
  .digest("hex");
const TYPEKIT_CSS_URL = "https://use.typekit.net/zsx5vsn.css";
const latoFiles = path.join(
  process.cwd(),
  "node_modules",
  "@fontsource",
  "lato",
  "files",
);

interface TypekitFont {
  family: "adelle" | "westgate";
  weight: number;
  style: "normal" | "italic";
}

interface OgFonts {
  adelleBold: string;
  adelleItalic: string;
  latoBold: string;
  westgate: string;
}

let fontsPromise: Promise<OgFonts> | undefined;

function findTypekitFontUrl(css: string, font: TypekitFont): string {
  const block = (css.match(/@font-face\s*{[^}]+}/g) ?? []).find(
    (candidate) =>
      candidate.includes(`font-family:"${font.family}"`) &&
      candidate.includes(`font-weight:${font.weight}`) &&
      candidate.includes(`font-style:${font.style}`),
  );
  const url = block?.match(/url\("([^"]+)"\) format\("opentype"\)/)?.[1];
  if (!url) {
    throw new Error(
      `Adobe Fonts kit is missing ${font.family} ${font.weight} ${font.style}`,
    );
  }
  return url;
}

async function downloadTypekitFont(
  css: string,
  font: TypekitFont,
): Promise<string> {
  const url = findTypekitFontUrl(css, font);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Could not download ${font.family}: ${response.status} ${response.statusText}`,
    );
  }

  const directory = path.join(os.tmpdir(), "tylerbutler-og-fonts");
  const filename = path.join(
    directory,
    `${font.family}-${font.weight}-${font.style}.otf`,
  );
  await fs.promises.mkdir(directory, { recursive: true });
  await fs.promises.writeFile(
    filename,
    Buffer.from(await response.arrayBuffer()),
  );
  return filename;
}

function loadFonts(): Promise<OgFonts> {
  fontsPromise ??= (async () => {
    const response = await fetch(TYPEKIT_CSS_URL);
    if (!response.ok) {
      throw new Error(
        `Could not load Adobe Fonts kit: ${response.status} ${response.statusText}`,
      );
    }
    const css = await response.text();

    const [adelleBold, adelleItalic, westgate] = await Promise.all([
      downloadTypekitFont(css, {
        family: "adelle",
        weight: 700,
        style: "normal",
      }),
      downloadTypekitFont(css, {
        family: "adelle",
        weight: 400,
        style: "italic",
      }),
      downloadTypekitFont(css, {
        family: "westgate",
        weight: 100,
        style: "normal",
      }),
    ]);

    return {
      adelleBold,
      adelleItalic,
      latoBold: path.join(latoFiles, "lato-latin-700-normal.woff2"),
      westgate,
    };
  })();

  return fontsPromise;
}

interface OgImageOptions {
  title: string;
  subtitle?: string;
  date: Date;
  kind: "ARTICLE" | "GUIDE" | "LINK";
}

interface CachedOgImageOptions extends OgImageOptions {
  slug: string;
}

interface TitleLayout {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}

const background = sharp(backgroundPath)
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "center" })
  .modulate({ brightness: 0.62, saturation: 0.78 })
  .composite([
    {
      input: Buffer.from(`
        <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${WIDTH}" height="${HEIGHT}" fill="#1a2332" fill-opacity=".34"/>
          <path d="M0 0H790L690 630H0Z" fill="#0f1419" fill-opacity=".88"/>
          <path d="M790 0L690 630" stroke="#e6b35c" stroke-width="3"/>
          <path d="M28 28H1172V602H28Z" fill="none" stroke="#e6b35c" stroke-opacity=".72" stroke-width="2"/>
        </svg>
      `),
    },
  ])
  .png()
  .toBuffer();

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function wrapTitle(title: string, maxCharacters: number): string[] {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];

  for (const word of words) {
    const current = lines.at(-1);
    if (!current || `${current} ${word}`.length > maxCharacters) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${current} ${word}`;
    }
  }

  return lines;
}

function layoutTitle(title: string): TitleLayout {
  const layouts = [
    { fontSize: 72, lineHeight: 78, maxCharacters: 16, maxLines: 3 },
    { fontSize: 62, lineHeight: 68, maxCharacters: 19, maxLines: 4 },
    { fontSize: 52, lineHeight: 58, maxCharacters: 23, maxLines: 4 },
  ];

  for (const layout of layouts) {
    const lines = wrapTitle(title, layout.maxCharacters);
    if (lines.length <= layout.maxLines) {
      return {
        lines,
        fontSize: layout.fontSize,
        lineHeight: layout.lineHeight,
      };
    }
  }

  const lines = wrapTitle(title, 26).slice(0, 4);
  const lastLine = lines.at(-1);
  if (lastLine) lines[lines.length - 1] = `${lastLine.slice(0, 39)}...`;
  return { lines, fontSize: 46, lineHeight: 52 };
}

export async function createOgImage({
  title,
  subtitle,
  date,
  kind,
}: OgImageOptions): Promise<Buffer> {
  const fonts = await loadFonts();
  const { lines, fontSize, lineHeight } = layoutTitle(title);
  const subtitleLines = subtitle ? wrapTitle(subtitle, 31).slice(0, 3) : [];
  const titleHeight = lines.length * lineHeight;
  const subtitleHeight = subtitleLines.length * 43;
  const titleTop = Math.max(
    190,
    330 - (titleHeight + (subtitle ? 24 + subtitleHeight : 0)) / 2,
  );
  const formattedDate = date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return sharp(await background)
    .composite([
      {
        input: {
          text: {
            text: `<span foreground="#e6b35c" letter_spacing="5120">${escapeXml("TYLERBUTLER.COM")}</span>`,
            font: "westgate-100-normal 30",
            fontfile: fonts.westgate,
            rgba: true,
          },
        },
        left: 84,
        top: 68,
      },
      {
        input: {
          text: {
            text: `<span foreground="#b9bbc0" letter_spacing="4096">${kind}</span>`,
            font: "Lato Bold 18",
            fontfile: fonts.latoBold,
            rgba: true,
          },
        },
        left: 84,
        top: 116,
      },
      {
        input: {
          text: {
            text: `<span foreground="#f7f5f2">${escapeXml(lines.join("\n"))}</span>`,
            font: `adelle-700-normal ${fontSize}`,
            fontfile: fonts.adelleBold,
            spacing: lineHeight - fontSize,
            rgba: true,
          },
        },
        left: 84,
        top: titleTop,
      },
      ...(subtitle
        ? [
            {
              input: {
                text: {
                  text: `<span foreground="#f7f5f2">${escapeXml(subtitleLines.join("\n"))}</span>`,
                  font: "adelle-400-italic 34",
                  fontfile: fonts.adelleItalic,
                  spacing: 9,
                  rgba: true,
                },
              },
              left: 84,
              top: titleTop + titleHeight + 24,
            },
          ]
        : []),
      {
        input: {
          text: {
            text: `<span foreground="#e6b35c" letter_spacing="4096">${formattedDate}</span>`,
            font: "Lato Bold 18",
            fontfile: fonts.latoBold,
            rgba: true,
          },
        },
        left: 84,
        top: 528,
      },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

export async function createCachedOgImage({
  slug,
  ...options
}: CachedOgImageOptions): Promise<Buffer> {
  const key = createHash("sha256")
    .update(
      JSON.stringify({
        template: TEMPLATE_VERSION,
        background: backgroundHash,
        ...options,
      }),
    )
    .digest("hex")
    .slice(0, 16);
  const cachePath = path.join(cacheDirectory, `${slug}-${key}.png`);

  try {
    return await fs.promises.readFile(cachePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const image = await createOgImage(options);
  await fs.promises.mkdir(cacheDirectory, { recursive: true });
  await fs.promises.writeFile(cachePath, image);
  return image;
}
