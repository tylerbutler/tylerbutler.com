import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getArticleSlug } from "../../lib/article-utils";
import { includeDraft } from "../../lib/draft-utils";
import { createOgImage } from "../../lib/og-image";

interface OgImageProps {
  title: string;
  subtitle?: string;
  date: Date;
  kind: "ARTICLE" | "GUIDE" | "LINK";
}

export async function getStaticPaths() {
  const articles = await getCollection("articles", ({ data }) =>
    includeDraft(data),
  );

  return articles.map((article) => ({
    params: { slug: getArticleSlug(article) },
    props: {
      title: article.data.title,
      subtitle: article.data.subtitle,
      date: article.data.date,
      kind:
        article.data.articleType === "link"
          ? "LINK"
          : article.data.type === "guide"
            ? "GUIDE"
            : "ARTICLE",
    } satisfies OgImageProps,
  }));
}

export const GET: APIRoute<OgImageProps> = async ({ props }) => {
  const image = await createOgImage(props);

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
