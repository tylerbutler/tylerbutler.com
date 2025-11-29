import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkSmartypants from "remark-smartypants";
import remarkStringify from "remark-stringify";

/**
 * Shared remark typography pipeline configuration
 * Used for both markdown content and standalone title formatting
 */
export const typographyProcessor = unified()
  .use(remarkParse)
  .use(remarkSmartypants)
  .use(remarkStringify);

/**
 * Apply typography transformations to a title string
 * Uses the same remark pipeline as markdown content for consistency
 */
export async function formatTitle(title: string): Promise<string> {
  const result = await typographyProcessor.process(title);
  return result.toString().trim();
}
