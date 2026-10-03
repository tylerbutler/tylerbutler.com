import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getArticleSlug } from "../../lib/article-utils";
import { createOgImage } from "../../lib/og-image";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const articles = await getCollection("articles", ({ data }) => !data.draft);
    const article = articles.find(
      (entry) => getArticleSlug(entry) === params.slug,
    );
    if (!article) {
      return new Response("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const image = await createOgImage({
      title: article.data.title,
      subtitle: article.data.subtitle,
      date: article.data.date,
      kind:
        article.data.articleType === "link"
          ? "LINK"
          : article.data.type === "guide"
            ? "GUIDE"
            : "ARTICLE",
    });
    return new Response(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, durable, max-age=31536000",
      },
    });
  } catch (error) {
    console.error(`OG image generation failed for ${params.slug}:`, error);
    return new Response("Image generation failed", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
};
