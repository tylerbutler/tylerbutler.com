import { getCollection, render } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { getArticleUrl } from "../lib/article-utils";
import { getNoteUrl } from "../lib/note-utils";

export async function GET(context: APIContext) {
  const [articles, notes] = await Promise.all([
    getCollection("articles", ({ data }) => !data.draft),
    getCollection("notes", ({ data }) => !data.draft),
  ]);

  const container = await AstroContainer.create();
  const sanitize = (html: string) =>
    sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    });

  const articleItems = await Promise.all(
    articles.map(async (article) => {
      const { Content } = await render(article);
      const html = await container.renderToString(Content);
      return {
        title: article.data.title,
        pubDate: article.data.date,
        description: article.data.excerpt || article.data.title,
        content: sanitize(html),
        link: `${getArticleUrl(article)}/`,
      };
    }),
  );

  const noteItems = await Promise.all(
    notes.map(async (note) => {
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
        content: sanitize(html),
        link: `${getNoteUrl(note)}/`,
      };
    }),
  );

  const items = [...articleItems, ...noteItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  return rss({
    title: "Tyler Butler",
    description:
      "Personal website and blog of Tyler Butler, featuring articles on technology, programming, and more.",
    site: context.site || "https://tylerbutler.com",
    items,
    customData: `<language>en-us</language>`,
  });
}
