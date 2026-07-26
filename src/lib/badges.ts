import {
  siGleam,
  siGo,
  siOcaml,
  siPython,
  siRust,
  siTypescript,
} from "simple-icons";

/**
 * Build-time badge data. Badges whose content is fixed (status, language,
 * license) render to inline SVG at build via ShieldsBadge.astro, so they cost
 * no third-party request. Version badges stay on img.shields.io — baking a
 * version in at build would freeze it until the next deploy.
 */

interface SimpleIcon {
  title: string;
  hex: string;
  path: string;
}

/**
 * `color` is the message-side background, hand-picked rather than taken from
 * simple-icons' `hex`, which is the monochrome logo color (Rust's, for example,
 * is black). The logo itself is drawn in that brand `hex`.
 *
 * The label background is derived from that brand color — see labelFor().
 */
const languages: Record<string, { color: string; icon: SimpleIcon }> = {
  gleam: { color: "ffaff3", icon: siGleam },
  rust: { color: "CE422B", icon: siRust },
  go: { color: "00ADD8", icon: siGo },
  typescript: { color: "3178C6", icon: siTypescript },
  python: { color: "3776AB", icon: siPython },
  ocaml: { color: "EC6813", icon: siOcaml },
};

// Six-digit hex on both — relativeLuminance() parses fixed-width pairs, and a
// shorthand like "555" would silently yield NaN.
const LIGHT_LABEL = "f5f5f5";
const DARK_LABEL = "555555";

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const s = Number.parseInt(h.slice(i, i + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Brand colors are never altered, so the label adapts to them instead: whichever
 * of the two label treatments the logo reads better against wins. Gleam's pale
 * #FFAFF3 and Go's cyan land on the dark label; Rust's black, TypeScript's and
 * Python's blues, and OCaml's orange land on the light one.
 */
function labelFor(brandHex: string): string {
  return contrastRatio(brandHex, LIGHT_LABEL) >=
    contrastRatio(brandHex, DARK_LABEL)
    ? LIGHT_LABEL
    : DARK_LABEL;
}

/**
 * Wrap a simple-icons path in an SVG and base64 it, the form badge-maker wants
 * for `logoBase64`.
 */
function iconDataUri(icon: SimpleIcon, fill: string): string {
  const svg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="${fill}" d="${icon.path}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function languageBadge(language: string): {
  color: string;
  labelColor?: string;
  logoBase64?: string;
} {
  const entry = languages[language];
  if (!entry) return { color: "grey" };

  return {
    color: entry.color,
    labelColor: labelFor(entry.icon.hex),
    logoBase64: iconDataUri(entry.icon, `#${entry.icon.hex}`),
  };
}
