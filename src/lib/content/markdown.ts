import { marked } from 'marked';
import matter from 'gray-matter';
import type { ArticleMeta, ProcessedContent } from '$lib/types.js';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: false
});

export async function processMarkdown(content: string, filepath?: string): Promise<ProcessedContent> {
  const { data, content: markdownContent } = matter(content);

  // Process the markdown content
  const html = await marked(markdownContent);

  // Generate excerpt from content (first paragraph or 150 chars)
  const excerpt = generateExcerpt(markdownContent);

  // Extract slug from filepath if available
  let slug = data.slug || '';
  if (filepath && !slug) {
    slug = extractSlugFromPath(filepath);
  }

  // Extract year and month from date or filepath
  const { year, month } = extractDateInfo(data.date, filepath);

  const metadata: ArticleMeta = {
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    slug,
    excerpt: data.excerpt || excerpt,
    draft: data.draft || false,
    year,
    month
  };

  return {
    metadata,
    html,
    excerpt
  };
}

function generateExcerpt(content: string, maxLength: number = 150): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .trim();

  // Get first paragraph or truncate to maxLength
  const firstParagraph = plainText.split('\n\n')[0];
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }

  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function extractSlugFromPath(filepath: string): string {
  // Extract slug from filepath like "content/articles/2024/01/article-name.md"
  const parts = filepath.split('/');
  const filename = parts[parts.length - 1];

  // Handle date-prefixed filenames like "2024-01-15-article-title.md"
  let slug = filename.replace(/\.md$/, '');

  // Remove date prefix if present (YYYY-MM-DD-title -> title)
  slug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');

  return slug;
}

function extractDateInfo(date: string | Date, filepath?: string): { year: string; month: string } {
  let dateObj: Date;

  if (date) {
    dateObj = new Date(date);
  } else if (filepath) {
    // Try to extract date from filepath
    const match = filepath.match(/(\d{4})\/(\d{2})|(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = match[1] || match[3];
      const month = match[2] || match[4];
      dateObj = new Date(`${year}-${month}-01`);
    } else {
      dateObj = new Date();
    }
  } else {
    dateObj = new Date();
  }

  return {
    year: dateObj.getFullYear().toString(),
    month: (dateObj.getMonth() + 1).toString().padStart(2, '0')
  };
}