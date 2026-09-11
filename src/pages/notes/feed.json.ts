import { getCollection, render } from "astro:content";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { includeDraft } from "../../lib/draft-utils";
import { getNoteUrl, plaintextExcerpt } from "../../lib/note-utils";

export async function GET(context: APIContext) {
  const site = (context.site || new URL("https://tylerbutler.com")).toString();
  const siteUrl = site.endsWith("/") ? site.slice(0, -1) : site;

  const notes = await getCollection("notes", ({ data }) => includeDraft(data));

  const sortedNotes = notes.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const container = await AstroContainer.create();

  const items = await Promise.all(
    sortedNotes.map(async (note) => {
      const { Content } = await render(note);
      const html = await container.renderToString(Content);
      const url = `${siteUrl}${getNoteUrl(note)}/`;
      const body = note.body ?? "";

      const item: Record<string, unknown> = {
        id: url,
        url,
        content_html: sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        }),
        content_text: plaintextExcerpt(body, 1000),
        date_published: note.data.date.toISOString(),
      };
      if (note.data.lastmod) {
        item.date_modified = note.data.lastmod.toISOString();
      }
      if (note.data.title) item.title = note.data.title;
      if (note.data.summary) item.summary = note.data.summary;
      if (note.data.tags && note.data.tags.length > 0) {
        item.tags = note.data.tags;
      }
      return item;
    }),
  );

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Tyler Butler — Notes",
    home_page_url: `${siteUrl}/notes/`,
    feed_url: `${siteUrl}/notes/feed.json`,
    description: "Short-form notes by Tyler Butler.",
    language: "en-us",
    authors: [{ name: "Tyler Butler", url: `${siteUrl}/` }],
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
