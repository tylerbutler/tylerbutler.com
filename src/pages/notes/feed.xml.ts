import { getCollection, render } from "astro:content";
import rss, { type RSSFeedItem } from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { getNoteUrl } from "../../lib/note-utils";

function plaintextExcerpt(body: string, maxChars: number): string {
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, "")
    .replace(/<([^>]+)>/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, maxChars).trimEnd()}…`;
}

export async function GET(context: APIContext) {
  const notes = await getCollection("notes", ({ data }) => !data.draft);

  const sortedNotes = notes.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );

  const container = await AstroContainer.create();

  return rss({
    title: "Tyler Butler — Notes",
    description: "Short-form notes by Tyler Butler.",
    site: context.site || "https://tylerbutler.com",
    items: await Promise.all(
      sortedNotes.map(async (note) => {
        const { Content } = await render(note);
        const html = await container.renderToString(Content);

        // RSS items must carry a title or description. Notes are usually
        // title-less by design, so we leave title unset and synthesize a
        // description from the body when no summary is available.
        const description =
          note.data.summary ?? plaintextExcerpt(note.body ?? "", 200);

        const item: RSSFeedItem = {
          pubDate: note.data.date,
          description,
          content: sanitizeHtml(html, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          }),
          link: `${getNoteUrl(note)}/`,
        };
        if (note.data.title) item.title = note.data.title;
        return item;
      }),
    ),
    customData: `<language>en-us</language>`,
  });
}
