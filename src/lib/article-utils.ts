import type { CollectionEntry } from "astro:content";

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

export function getArticleSlug(article: CollectionEntry<"articles">): string {
  return article.data.slug || article.slug;
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
