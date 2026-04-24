import type { CollectionEntry } from "astro:content";

const PT_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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
  return { year, month, day, slug: note.data.slug };
}

export function getNoteUrl(note: CollectionEntry<"notes">): string {
  const { year, month, day, slug } = getNotePathParts(note);
  return `/notes/${year}/${month}/${day}/${slug}`;
}
