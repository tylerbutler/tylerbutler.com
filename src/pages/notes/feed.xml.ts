import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { publicNotes } from "../../lib/live-notes";
import { getNoteUrl, plaintextExcerpt } from "../../lib/note-utils";
import { cacheNotes } from "../../lib/notes-cache";
import { noteFeedHtml } from "../../lib/render-note";

export const prerender = false;
export async function GET(context: APIContext) {
  try {
    const notes = await publicNotes();
    const response = await rss({
      title: "Tyler Butler — Notes",
      description: "Short-form notes by Tyler Butler.",
      site: context.site || "https://tylerbutler.com",
      items: await Promise.all(
        notes.map(async (note) => ({
          pubDate: note.data.date,
          description:
            note.data.summary ?? plaintextExcerpt(note.body ?? "", 200),
          content: await noteFeedHtml(note),
          link: `${getNoteUrl(note)}/`,
          ...(note.data.title ? { title: note.data.title } : {}),
        })),
      ),
      customData: "<language>en-us</language>",
    });
    cacheNotes(context);
    return response;
  } catch {
    context.cache.set(false);
    return new Response("Notes feed unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
