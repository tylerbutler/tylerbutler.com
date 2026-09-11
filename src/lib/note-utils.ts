import type { CollectionEntry } from "astro:content";

const PT_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface NotePathParts {
  year: string;
  month: string;
  day: string;
  slug: string;
}

export function getNotePathParts(
  note: CollectionEntry<"notes">,
): NotePathParts {
  const [year, month, day] = PT_DATE_FORMATTER.format(note.data.date).split(
    "-",
  );
  return { year, month, day, slug: noteSlug(note) };
}

// Derive slug from frontmatter when present; otherwise extract from the
// entry id (filename without extension), which has the form
// `YYYY-MM-DD-<slug>` for both migrated and Micropub-created notes. This
// fallback exists because @benjifs/micropub does not write a `slug`
// frontmatter field; the netlify store wrapper injects it on creation,
// but we keep this fallback for defense in depth.
export function noteSlug(note: CollectionEntry<"notes">): string {
  if (note.data.slug) return note.data.slug;
  const id = note.id;
  const match = id.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  return match ? match[1] : id;
}

export function getNoteUrl(note: CollectionEntry<"notes">): string {
  const { year, month, day, slug } = getNotePathParts(note);
  return `/notes/${year}/${month}/${day}/${slug}`;
}

export function getNoteYearUrl(year: string): string {
  return `/notes/${year}`;
}

export function getNoteMonthUrl(year: string, month: string): string {
  return `/notes/${year}/${month}`;
}

export function monthLabel(month: string): string {
  return MONTH_NAMES[Number.parseInt(month, 10) - 1] ?? month;
}

export function plaintextExcerpt(body: string, maxChars: number): string {
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, "")
    .replace(/<([^>]+)>/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, maxChars).trimEnd()}…`;
}
