import type { CollectionEntry } from "astro:content";
import { includeDraft } from "./draft-utils.ts";

export const RESERVED_SLUGS = new Set([
  "about",
  "articles",
  "projects",
  "colophon",
  "search",
  "tags",
  "link-not-available",
  "index",
]);

export function getArticleUrl(article: CollectionEntry<"articles">): string {
  return `/${getArticleSlug(article)}`;
}

export function getArticleDisplayTitle(
  article: CollectionEntry<"articles">,
): string {
  return article.data.subtitle
    ? `${article.data.title}: ${article.data.subtitle}`
    : article.data.title;
}

export function getArticleSlug(article: CollectionEntry<"articles">): string {
  return article.id;
}

export function getRelatedArticles(
  articles: CollectionEntry<"articles">[],
  tags: string[] = [],
): CollectionEntry<"articles">[] {
  const projectTags = new Set(tags);
  return articles
    .filter(
      ({ data }) =>
        includeDraft(data) && data.tags?.some((tag) => projectTags.has(tag)),
    )
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function validateArticleSlugs(
  articles: CollectionEntry<"articles">[],
): void {
  const conflicts = articles.filter((a) =>
    RESERVED_SLUGS.has(getArticleSlug(a)),
  );
  if (conflicts.length > 0) {
    const list = conflicts
      .map((a) => `"${getArticleSlug(a)}" (${a.id})`)
      .join(", ");
    throw new Error(`Article slugs conflict with reserved pages: ${list}`);
  }
}
