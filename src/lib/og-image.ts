import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// CoreText ignores the custom font files registered by libvips.
if (process.platform === "darwin") {
  process.env.PANGOCAIRO_BACKEND = "fontconfig";
}

const WIDTH = 1200;
const HEIGHT = 630;
const SITE_LABEL = "TYLERBUTLER.COM";
const backgroundPath = path.join(process.cwd(), "public", "bg-hq.webp");
const fontDirectory = path.join(process.cwd(), ".cache", "og-assets");
const fonts = {
  adelleBold: path.join(fontDirectory, "adelle-700-normal.otf"),
  adelleItalic: path.join(fontDirectory, "adelle-400-italic.otf"),
  latoBold: path.join(fontDirectory, "lato-700.ttf"),
  idlewildLight: path.join(fontDirectory, "idlewild-light.ttf"),
};

type OgImageOptions = {
  title: string;
  subtitle?: string;
} & (
  | { date: Date; kind: "ARTICLE" | "GUIDE" | "LINK" }
  | { date?: never; kind: "WEBSITE" }
);

interface TitleLayout {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}

let backgroundPromise: Promise<Buffer> | undefined;

function getBackground(): Promise<Buffer> {
  backgroundPromise ??= sharp(backgroundPath)
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
    .toBuffer()
    .catch((error: unknown) => {
      backgroundPromise = undefined;
      throw error;
    });
  return backgroundPromise;
}

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
  // Pango can silently fall back when a custom font file is unavailable.
  await Promise.all(
    Object.values(fonts).map((font) =>
      fs.promises.access(font, fs.constants.R_OK),
    ),
  );
  const { lines, fontSize, lineHeight } = layoutTitle(title);
  const subtitleLines = subtitle ? wrapTitle(subtitle, 31).slice(0, 3) : [];
  const titleHeight = lines.length * lineHeight;
  const subtitleHeight = subtitleLines.length * 43;
  const titleTop = Math.round(
    Math.max(
      190,
      330 - (titleHeight + (subtitle ? 24 + subtitleHeight : 0)) / 2,
    ),
  );
  const formattedDate = date
    ?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return sharp(await getBackground())
    .composite([
      {
        input: {
          text: {
            text: `<span foreground="#e6b35c" letter_spacing="5120">${escapeXml(SITE_LABEL)}</span>`,
            // Keep "Light" in the family name rather than Pango's weight.
            font: "Idlewild SSm Light, 30",
            fontfile: fonts.idlewildLight,
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
      ...(formattedDate
        ? [
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
          ]
        : []),
    ])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}
