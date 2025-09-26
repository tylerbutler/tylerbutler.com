import { fromMarkdown } from 'mdast-util-from-markdown';
import { toHast } from 'mdast-util-to-hast';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import type { Root, Heading } from 'mdast';
import type { Element } from 'hast';

/**
 * Shifts all heading levels in HTML content by the specified amount
 * @param htmlContent - HTML content to transform
 * @param shiftBy - Number of levels to shift headings (default: 2)
 * @returns HTML with shifted heading levels
 */
export function shiftHeadingsInHtml(htmlContent: string, shiftBy = 2): string {
  // Use regex to find and replace heading tags
  return htmlContent.replace(/<h([1-6])((?:\s[^>]*)?)>/gi, (match, level, attributes) => {
    const currentLevel = parseInt(level, 10);
    const newLevel = Math.min(currentLevel + shiftBy, 6);
    return `<h${newLevel}${attributes}>`;
  }).replace(/<\/h[1-6]>/gi, (match) => {
    const level = match.match(/<\/h([1-6])>/)?.[1];
    if (!level) return match;
    const currentLevel = parseInt(level, 10);
    const newLevel = Math.min(currentLevel + shiftBy, 6);
    return `</h${newLevel}>`;
  });
}

/**
 * Transforms markdown content to HTML with shifted headings for proper hierarchy
 * @param markdownContent - Raw markdown content to transform
 * @param shiftBy - Number of levels to shift headings (default: 2)
 * @returns HTML with shifted headings
 */
export function transformMarkdownWithShiftedHeadings(markdownContent: string, shiftBy = 2): string {
  // Parse markdown to AST
  const mdast: Root = fromMarkdown(markdownContent);

  // Visit all heading nodes and increase depth
  visit(mdast, 'heading', (node: Heading) => {
    // Shift heading depth while capping at h6 (max HTML heading level)
    node.depth = Math.min(node.depth + shiftBy, 6);
  });

  // Convert to HAST (HTML AST)
  const hast = toHast(mdast);

  // Convert to HTML string
  return toHtml(hast);
}

/**
 * Analyzes markdown content to find the minimum heading level
 * @param markdownContent - Raw markdown content to analyze
 * @returns The minimum heading level found (1-6), or null if no headings
 */
function getMinimumHeadingLevel(markdownContent: string): number | null {
  const mdast: Root = fromMarkdown(markdownContent);
  let minLevel: number | null = null;

  visit(mdast, 'heading', (node: Heading) => {
    if (minLevel === null || node.depth < minLevel) {
      minLevel = node.depth;
    }
  });

  return minLevel;
}

/**
 * Normalizes heading levels in markdown content based on context
 * @param markdownContent - Raw markdown content to transform
 * @param targetStartLevel - Desired level for the highest heading (1-6)
 * @param maxLevel - Maximum heading level allowed (default: 6)
 * @returns HTML with normalized heading levels
 */
export function normalizeMarkdownHeadings(
  markdownContent: string,
  targetStartLevel: number = 2,
  maxLevel: number = 6
): string {
  const minCurrentLevel = getMinimumHeadingLevel(markdownContent);

  // If no headings found, return content as-is
  if (minCurrentLevel === null) {
    const mdast: Root = fromMarkdown(markdownContent);
    const hast = toHast(mdast);
    return toHtml(hast);
  }

  // Calculate the shift needed to normalize to target start level
  const shiftBy = targetStartLevel - minCurrentLevel;

  // Parse markdown to AST
  const mdast: Root = fromMarkdown(markdownContent);

  // Visit all heading nodes and normalize depth
  visit(mdast, 'heading', (node: Heading) => {
    const newLevel = node.depth + shiftBy;
    // Ensure level stays within valid range (1-maxLevel)
    node.depth = Math.max(1, Math.min(newLevel, maxLevel));
  });

  // Convert to HAST (HTML AST)
  const hast = toHast(mdast);

  // Convert to HTML string
  return toHtml(hast);
}

/**
 * Creates a preview version of article content with shifted headings for homepage display
 * This ensures proper heading hierarchy when article content appears under h2 article titles
 * @param markdownContent - Raw article markdown content
 * @returns HTML with properly shifted headings suitable for homepage previews
 */
export function createHomepagePreview(markdownContent: string): string {
  // Normalize headings to start at h3 (since article titles are h2 on homepage)
  return normalizeMarkdownHeadings(markdownContent, 3);
}