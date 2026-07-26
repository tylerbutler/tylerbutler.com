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
 * Brand colors are hand-picked rather than taken from simple-icons' `hex`,
 * which is the monochrome logo color (Rust's, for example, is black).
 */
const languages: Record<string, { color: string; icon: SimpleIcon }> = {
  gleam: { color: "ffaff3", icon: siGleam },
  rust: { color: "CE422B", icon: siRust },
  go: { color: "00ADD8", icon: siGo },
  typescript: { color: "3178C6", icon: siTypescript },
  python: { color: "3776AB", icon: siPython },
  ocaml: { color: "EC6813", icon: siOcaml },
};

/**
 * Wrap a simple-icons path in an SVG and base64 it, the form badge-maker wants
 * for `logoBase64`. Logos are drawn in white to read against the badge color.
 */
function iconDataUri(icon: SimpleIcon): string {
  const svg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="${icon.path}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function languageBadge(language: string): {
  color: string;
  logoBase64?: string;
} {
  const entry = languages[language];
  if (!entry) return { color: "grey" };
  return { color: entry.color, logoBase64: iconDataUri(entry.icon) };
}
