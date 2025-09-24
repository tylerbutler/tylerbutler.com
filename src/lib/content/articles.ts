import type { ArticleMeta } from '$lib/types.js';
import { processMarkdown } from './markdown.js';

// Load all articles from the content directory
export async function loadArticles(): Promise<ArticleMeta[]> {
  const modules = import.meta.glob('/content/articles/**/*.md', {
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
    // Get all article files
    const modules = import.meta.glob('/content/articles/**/*.md', {
      query: '?raw',
      import: 'default',
      eager: false
    });

    // Process all articles and find the one matching the frontmatter
    for (const [path, resolver] of Object.entries(modules)) {
      try {
        const content = await resolver() as string;
        const { metadata } = await processMarkdown(content, path);

        // Match based on frontmatter: year, month from date, and slug
        const articleDate = new Date(metadata.date);
        const articleYear = articleDate.getFullYear().toString();
        const articleMonth = (articleDate.getMonth() + 1).toString().padStart(2, '0');
        const articleSlug = metadata.slug;

        if (articleYear === year && articleMonth === month && articleSlug === slug) {
          // Re-process to get the HTML content
          const { metadata: finalMetadata, html } = await processMarkdown(content, path);
          return { metadata: finalMetadata, html };
        }
      } catch (fileError) {
        // Skip files that can't be processed, continue with next
        console.warn(`Error processing file ${path}:`, fileError);
        continue;
      }
    }

    return null;
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

// Get all unique tags from articles
export async function getAllTags(): Promise<string[]> {
  const articles = await loadArticles();
  const tagSet = new Set<string>();

  articles.forEach(article => {
    if (article.tags) {
      article.tags.forEach(tag => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort();
}

// Get articles by tag
export async function getArticlesByTag(tag: string): Promise<ArticleMeta[]> {
  const articles = await loadArticles();
  return articles.filter(article =>
    article.tags && article.tags.includes(tag)
  );
}

// Get tag counts for tag cloud/index
export async function getTagCounts(): Promise<Record<string, number>> {
  const articles = await loadArticles();
  const tagCounts: Record<string, number> = {};

  articles.forEach(article => {
    if (article.tags) {
      article.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return tagCounts;
}