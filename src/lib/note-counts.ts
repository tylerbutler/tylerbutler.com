import type { Note } from "./note-schema.ts";
import { getNotePathParts } from "./note-utils.ts";

export interface NoteCounts {
  yearCounts: Map<string, number>;
  monthCounts: Map<string, number>;
}

export function getNoteCounts(notes: readonly Note[]): NoteCounts {
  const yearCounts = new Map<string, number>();
  const monthCounts = new Map<string, number>();
  for (const note of notes) {
    const { year, month } = getNotePathParts(note);
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
    const key = `${year}-${month}`;
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  return { yearCounts, monthCounts };
}
