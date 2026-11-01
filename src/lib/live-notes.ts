import hashes from "../../.cache/notes-source-hashes.json";
import { githubTree, readNotes } from "./github-notes";
import { includeNote, type Note } from "./note-schema";

export async function currentNotes(): Promise<Note[]> {
  // The live config imports this module; defer the reverse import.
  const { getCollection } = await import("astro:content");
  const baseline = await getCollection("notes");
  if (import.meta.env.DEV)
    return baseline.sort(
      (a, b) => b.data.date.getTime() - a.data.date.getTime(),
    );
  return readNotes(baseline, hashes, await githubTree());
}

export async function publicNotes(): Promise<Note[]> {
  const { getLiveCollection } = await import("astro:content");
  const { entries, error } = await getLiveCollection("liveNotes");
  if (error || !entries)
    throw error ?? new Error("Notes collection is unavailable");
  return entries.map((entry) => ({
    id: entry.id,
    data: entry.data,
    body: entry.data.body,
  }));
}

export function visibleNotes(notes: readonly Note[]): Note[] {
  return notes.filter((note) => includeNote(note.data));
}
