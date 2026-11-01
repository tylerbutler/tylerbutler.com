import sanitizeHtml from "sanitize-html";
import { addFeedTrackingPixel } from "./feed-utils";
import { renderMarkdownWithPipeline } from "./markdown-utils";
import type { Note } from "./note-schema";
import { escapeHtml, getNotePhotos, getNoteUrl } from "./note-utils";

const rendered = new Map<string, Promise<string>>();
export function renderNote(note: Note): Promise<string> {
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

export async function noteFeedHtml(note: Note): Promise<string> {
  const html = await renderNote(note);
  const photos = getNotePhotos(note, html)
    .map(
      ({ src, alt }) =>
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`,
    )
    .join("");
  const relationships: [string, string[] | undefined][] = [
    ["In reply to", note.data.replyTo],
    ["Liked", note.data.likeOf],
    ["Reposted", note.data.repostOf],
    ["Bookmarked", note.data.bookmarkOf],
  ];
  const context = relationships
    .flatMap(([label, urls]) =>
      (urls ?? []).map(
        (url) =>
          `<p>${label}: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`,
      ),
    )
    .join("");
  return addFeedTrackingPixel(
    sanitizeHtml(context + html + photos, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    }),
    `${getNoteUrl(note)}/`,
  );
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
