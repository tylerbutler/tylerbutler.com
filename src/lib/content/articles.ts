import type { ArticleMeta } from '$lib/types.js';
import { processMarkdown } from './markdown.js';

// Load all articles from the content directory
export async function loadArticles(): Promise<ArticleMeta[]> {
  const modules = import.meta.glob('../../../content/articles/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: false
  });

  const articles = await Promise.all(
    Object.entries(modules).map(async ([path, resolver]) => {
      const content = await resolver() as string;
      const { metadata } = await processMarkdown(content, path);

      return metadata;
    })
  );

  // Filter out drafts and sort by date (newest first)
  return articles
    .filter(article => !article.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Load a specific article by year, month, and slug
export async function loadArticle(year: string, month: string, slug: string): Promise<{ metadata: ArticleMeta; html: string } | null> {
  try {
    // Try different possible file paths that Hugo might use
    const possiblePaths = [
      `/content/articles/${year}/${year}-${month.padStart(2, '0')}-*-${slug}.md`,
      `/content/articles/${year}/${slug}.md`,
      `/content/articles/${slug}.md`
    ];

    // Get all article files and find matching one
    const modules = import.meta.glob('../../../content/articles/**/*.md', {
      query: '?raw',
      import: 'default',
      eager: false
    });

    // Find the matching article file
    let matchedPath: string | null = null;
    let matchedResolver: (() => Promise<unknown>) | null = null;

    for (const [path, resolver] of Object.entries(modules)) {
      // Check if this path matches our criteria
      if (
        path.includes(`/${year}/`) &&
        (path.includes(`-${slug}.md`) || path.endsWith(`/${slug}.md`))
      ) {
        matchedPath = path;
        matchedResolver = resolver;
        break;
      }
    }

    if (!matchedPath || !matchedResolver) {
      return null;
    }

    const content = await matchedResolver() as string;
    const { metadata, html } = await processMarkdown(content, matchedPath);

    return { metadata, html };
  } catch (error) {
    console.error(`Error loading article ${year}/${month}/${slug}:`, error);
    return null;
  }
}

// Get articles grouped by year
export async function getArticlesByYear(): Promise<Record<string, ArticleMeta[]>> {
  const articles = await loadArticles();
  const grouped: Record<string, ArticleMeta[]> = {};

  articles.forEach(article => {
    const year = article.year;
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(article);
  });

  return grouped;
}

// Get recent articles (limit specified)
export async function getRecentArticles(limit: number = 5): Promise<ArticleMeta[]> {
  const articles = await loadArticles();
  return articles.slice(0, limit);
}