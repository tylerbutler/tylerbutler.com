import { renderMarkdownWithPipeline } from "./markdown-utils";
import type { Note } from "./note-schema";

const rendered = new Map<string, Promise<string>>();
export function renderNote(note: Note): Promise<string> {
  if (note.html !== undefined) return Promise.resolve(note.html);
  if (note.sourceUrl)
    return Promise.reject(new Error("Source note content has not been loaded"));
  const key = `${note.id}\0${note.body ?? ""}`;
  let html = rendered.get(key);
  if (!html) {
    html = renderMarkdownWithPipeline(note.body ?? "").catch((error) => {
      rendered.delete(key);
      throw error;
    });
    rendered.set(key, html);
    const oldest = rendered.keys().next().value;
    if (rendered.size > 128 && oldest !== undefined) rendered.delete(oldest);
  }
  return html;
}

export function noteModified(note: Note): Date {
  return new Date(
    Math.max(
      ...[note.data.date, note.data.lastmod, note.data.updated]
        .filter((date): date is Date => !!date)
        .map((date) => date.getTime()),
    ),
  );
}
