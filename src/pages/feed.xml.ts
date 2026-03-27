import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import sanitizeHtml from "sanitize-html";
import { getArticleUrl } from "../lib/article-utils";

export async function GET(context: APIContext) {
  const articles = await getCollection("articles", ({ data }) => {
    return !data.draft;
  });

  const sortedArticles = articles.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );

  // Create container for rendering components
  const container = await AstroContainer.create();

  return rss({
    title: "Tyler Butler",
    description:
      "Personal website and blog of Tyler Butler, featuring articles on technology, programming, and more.",
    site: context.site || "https://tylerbutler.com",
    items: await Promise.all(
      sortedArticles.map(async (article) => {
        // Render the article content using Astro's unified markdown pipeline
        const { Content } = await article.render();
        const html = await container.renderToString(Content);

        return {
          title: article.data.title,
          pubDate: article.data.date,
          description: article.data.excerpt || article.data.title,
          content: sanitizeHtml(html, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          }),
          link: `${getArticleUrl(article)}/`,
        };
      }),
    ),
    customData: `<language>en-us</language>`,
  });
}
