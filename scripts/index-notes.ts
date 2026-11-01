import fs from "node:fs/promises";
import path from "node:path";
import * as pagefind from "pagefind";
import { parseNote } from "../src/lib/github-notes.ts";
import { includeNote } from "../src/lib/note-schema.ts";
import { getNoteUrl, plaintextExcerpt } from "../src/lib/note-utils.ts";

export async function indexNotes(output: URL): Promise<void> {
  const { index, errors } = await pagefind.createIndex();
  if (!index || errors.length) throw new Error(errors.join("; "));
  try {
    const directory = await index.addDirectory({ path: output.pathname });
    if (directory.errors.length) throw new Error(directory.errors.join("; "));
    async function walk(dir: string): Promise<void> {
      for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const filename = path.join(dir, entry.name);
        if (entry.isDirectory()) await walk(filename);
        else if (!entry.name.startsWith("_") && entry.name.endsWith(".md")) {
          const note = parseNote(filename, await fs.readFile(filename, "utf8"));
          if (!includeNote(note.data)) continue;
          const record = await index.addCustomRecord({
            url: `${getNoteUrl(note)}/`,
            content: plaintextExcerpt(note.body ?? "", Number.MAX_SAFE_INTEGER),
            language: "en",
            meta: {
              title:
                note.data.title ??
                note.data.date.toLocaleDateString("en-US", {
                  timeZone: "America/Los_Angeles",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
            },
            filters: { tag: note.data.tags ?? [] },
          });
          if (record.errors.length) throw new Error(record.errors.join("; "));
        }
      }
    }
    await walk("src/content/notes");
    const written = await index.writeFiles({
      outputPath: path.join(output.pathname, "pagefind"),
    });
    if (written.errors.length) throw new Error(written.errors.join("; "));
  } finally {
    await pagefind.close();
  }
}
