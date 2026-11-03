import { defineLiveCollection } from "astro:content";
import type { LiveLoader } from "astro/loaders";
import { synchronizedNotes } from "./lib/live-notes";
import type { NoteData } from "./lib/note-schema";

const loader: LiveLoader<
  NoteData & { body: string; html?: string; sourceUrl?: string },
  { id: string }
> = {
  name: "synchronized-live-notes",
  async loadCollection() {
    try {
      return {
        entries: (await synchronizedNotes()).map((note) => ({
          id: note.id,
          data: {
            ...note.data,
            body: note.body ?? "",
            html: note.html,
            sourceUrl: note.sourceUrl,
          },
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
      const note = (await synchronizedNotes()).find(
        (entry) => entry.id === filter.id,
      );
      return note
        ? {
            id: note.id,
            data: {
              ...note.data,
              body: note.body ?? "",
              html: note.html,
              sourceUrl: note.sourceUrl,
            },
          }
        : undefined;
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Cannot load note"),
      };
    }
  },
};

export const collections = { liveNotes: defineLiveCollection({ loader }) };
