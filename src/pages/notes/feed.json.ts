import type { APIContext } from "astro";
import { publicNotes } from "../../lib/live-notes";
import { getNoteUrl, plaintextExcerpt } from "../../lib/note-utils";
import { cacheNotes } from "../../lib/notes-cache";
import { noteFeedHtml, noteModified } from "../../lib/render-note";

export const prerender = false;
export async function GET(context: APIContext) {
  try {
    const site = (context.site || new URL("https://tylerbutler.com")).origin;
    const notes = await publicNotes();
    const items = await Promise.all(
      notes.map(async (note) => {
        const url = `${site}${getNoteUrl(note)}/`;
        return {
          id: url,
          url,
          content_html: await noteFeedHtml(note),
          content_text: plaintextExcerpt(note.body ?? "", 1000),
          date_published: note.data.date.toISOString(),
          ...(note.data.lastmod || note.data.updated
            ? { date_modified: noteModified(note).toISOString() }
            : {}),
          ...(note.data.title ? { title: note.data.title } : {}),
          ...(note.data.summary ? { summary: note.data.summary } : {}),
          ...(note.data.tags?.length ? { tags: note.data.tags } : {}),
        };
      }),
    );
    cacheNotes(context);
    return new Response(
      JSON.stringify(
        {
          version: "https://jsonfeed.org/version/1.1",
          title: "Tyler Butler — Notes",
          home_page_url: `${site}/notes/`,
          feed_url: `${site}/notes/feed.json`,
          description: "Short-form notes by Tyler Butler.",
          language: "en-us",
          authors: [{ name: "Tyler Butler", url: `${site}/` }],
          items,
        },
        null,
        2,
      ),
      { headers: { "Content-Type": "application/feed+json; charset=utf-8" } },
    );
  } catch {
    context.cache.set(false);
    return new Response("Notes feed unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
