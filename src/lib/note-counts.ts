import { getCollection } from "astro:content";
import { includeDraft } from "./draft-utils";
import { getNotePathParts } from "./note-utils";

export interface NoteCounts {
  yearCounts: Map<string, number>;
  monthCounts: Map<string, number>;
}

let cache: Promise<NoteCounts> | null = null;

export function getNoteCounts(): Promise<NoteCounts> {
  if (!cache) cache = compute();
  return cache;
}

async function compute(): Promise<NoteCounts> {
  const notes = await getCollection("notes", ({ data }) => includeDraft(data));
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
