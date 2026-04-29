import { getCollection, render } from "astro:content";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { getArticleUrl } from "../lib/article-utils";
import { includeDraft } from "../lib/draft-utils";

export async function GET(context: APIContext) {
  const site = (context.site || new URL("https://tylerbutler.com")).toString();
  const siteUrl = site.endsWith("/") ? site.slice(0, -1) : site;

  const articles = await getCollection("articles", ({ data }) =>
    includeDraft(data),
  );

  const sortedArticles = articles.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  const container = await AstroContainer.create();

  const items = await Promise.all(
    sortedArticles.map(async (article) => {
      const { Content } = await render(article);
      const html = await container.renderToString(Content);
      const url = `${siteUrl}${getArticleUrl(article)}/`;

      return {
        id: url,
        url,
        title: article.data.title,
        content_html: sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        }),
        summary: article.data.excerpt,
        date_published: new Date(article.data.date).toISOString(),
        tags: article.data.tags,
      };
    }),
  );

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Tyler Butler",
    home_page_url: `${siteUrl}/`,
    feed_url: `${siteUrl}/feed.json`,
    description:
      "Personal website and blog of Tyler Butler, featuring articles on technology, programming, and more.",
    language: "en-us",
    authors: [{ name: "Tyler Butler", url: `${siteUrl}/` }],
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
