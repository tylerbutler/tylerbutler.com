import { defineLiveCollection } from "astro:content";
import type { LiveLoader } from "astro/loaders";
import { currentNotes, visibleNotes } from "./lib/live-notes";
import type { NoteData } from "./lib/note-schema";

const loader: LiveLoader<NoteData & { body: string }, { id: string }> = {
  name: "github-live-notes",
  async loadCollection() {
    try {
      return {
        entries: visibleNotes(await currentNotes()).map((note) => ({
          id: note.id,
          data: { ...note.data, body: note.body ?? "" },
        })),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Cannot load notes"),
      };
    }
  },
  async loadEntry({ filter }) {
    try {
      const note = visibleNotes(await currentNotes()).find(
        (entry) => entry.id === filter.id,
      );
      return note
        ? { id: note.id, data: { ...note.data, body: note.body ?? "" } }
        : undefined;
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Cannot load note"),
      };
    }
  },
};

export const collections = { liveNotes: defineLiveCollection({ loader }) };
