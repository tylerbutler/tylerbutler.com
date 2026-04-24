import { getCollection, render } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { getNoteUrl } from "../../lib/note-utils";

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
        const formattedDate = note.data.date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/Los_Angeles",
        });
        const title = note.data.title || `Note — ${formattedDate}`;

        return {
          title,
          pubDate: note.data.date,
          description: note.data.summary || title,
          content: sanitizeHtml(html, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          }),
          link: `${getNoteUrl(note)}/`,
        };
      }),
    ),
    customData: `<language>en-us</language>`,
  });
}
