import path from "node:path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;

interface OgImageOptions {
  title: string;
  subtitle?: string;
  date: Date;
  kind: "ARTICLE" | "GUIDE" | "LINK";
}

interface TitleLayout {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}

const background = sharp(path.join(process.cwd(), "public", "bg-hq.webp"))
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
          <circle cx="1010" cy="150" r="72" fill="#d4842a" fill-opacity=".82"/>
          <circle cx="1010" cy="150" r="92" fill="none" stroke="#e6b35c" stroke-opacity=".55" stroke-width="2"/>
          <path d="M870 430L940 365L1015 415L1090 315L1160 350" fill="none" stroke="#f7f5f2" stroke-opacity=".56" stroke-width="2"/>
          <g fill="#e6b35c">
            <circle cx="870" cy="430" r="5"/><circle cx="940" cy="365" r="4"/>
            <circle cx="1015" cy="415" r="6"/><circle cx="1090" cy="315" r="4"/>
            <circle cx="1160" cy="350" r="5"/>
          </g>
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
    { fontSize: 72, lineHeight: 82, maxCharacters: 16, maxLines: 3 },
    { fontSize: 62, lineHeight: 72, maxCharacters: 19, maxLines: 4 },
    { fontSize: 52, lineHeight: 62, maxCharacters: 23, maxLines: 4 },
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
  return { lines, fontSize: 46, lineHeight: 56 };
}

export async function createOgImage({
  title,
  subtitle,
  date,
  kind,
}: OgImageOptions): Promise<Buffer> {
  const { lines, fontSize, lineHeight } = layoutTitle(title);
  const subtitleLines = subtitle ? wrapTitle(subtitle, 31).slice(0, 3) : [];
  const titleHeight = lines.length * lineHeight;
  const subtitleHeight = subtitleLines.length * 43;
  const titleY = Math.max(
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

  const titleLines = lines
    .map(
      (line, index) =>
        `<text x="84" y="${titleY + index * lineHeight}" class="title" fill="#f7f5f2">${escapeXml(line)}</text>`,
    )
    .join("");
  const subtitleY = titleY + titleHeight + 24;
  const subtitleText = subtitleLines
    .map(
      (line, index) =>
        `<text x="84" y="${subtitleY + index * 43}" class="subtitle" fill="#f7f5f2">${escapeXml(line)}</text>`,
    )
    .join("");

  const textLayer = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .label { font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 4px; }
        .title { font-family: Georgia, serif; font-size: ${fontSize}px; font-weight: 700; letter-spacing: .5px; }
        .subtitle { font-family: Georgia, serif; font-size: 34px; font-style: italic; font-weight: 400; letter-spacing: .3px; }
      </style>
      <text x="84" y="92" class="label" fill="#e6b35c">TYLERBUTLER.COM</text>
      <text x="84" y="132" class="label" fill="#f7f5f2" opacity=".72">${kind}</text>
      ${titleLines}
      ${subtitleText}
      <text x="84" y="548" class="label" fill="#e6b35c">${formattedDate}</text>
      <text x="1116" y="556" text-anchor="end" class="label" fill="#f7f5f2" opacity=".72">A PROGRAMMER'S HOME ON THE WEB</text>
    </svg>
  `);

  return sharp(await background)
    .composite([{ input: textLayer }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}
