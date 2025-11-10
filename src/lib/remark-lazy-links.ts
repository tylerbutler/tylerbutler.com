import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type { VFile } from 'vfile';
import { writeFileSync } from 'node:fs';

interface LazyLinksOptions {
  /**
   * Whether to persist the transformed links back to source files.
   *
   * When false (default): Transformation happens in-memory only during build.
   * Source files remain unchanged with [*] markers.
   *
   * When true: Source files are permanently modified, replacing [*] with
   * numbered links. Useful if you want the transformed format to be the
   * canonical version or need to use files outside of Astro.
   *
   * @default false
   */
  persist?: boolean;
}

/**
 * Remark plugin to transform lazy markdown links [*] into numbered references.
 *
 * Inspired by Brett Terpstra's lazy markdown reference links:
 * http://brettterpstra.com/2013/10/19/lazy-markdown-reference-links/
 *
 * Transforms:
 *   [link text][*]  and  [*]: http://url
 * Into:
 *   [link text][1]  and  [1]: http://url
 *
 * Features:
 * - Preserves existing numbered links
 * - Handles multiple overlapping lazy links
 * - Configurable persistence (in-memory or write back to source)
 *
 * @example
 * // In-memory transformation only (default)
 * remarkPlugins: [remarkLazyLinks]
 *
 * @example
 * // Persist changes back to source files
 * remarkPlugins: [[remarkLazyLinks, { persist: true }]]
 */
export const remarkLazyLinks: Plugin<[LazyLinksOptions?], Root> = (options = {}) => {
  const { persist = false } = options;

  return (tree: Root, file: VFile) => {
    // Get the raw markdown content
    const content = String(file.value || '');

    // Check if there are any lazy links to process
    if (!content.includes('[*]')) {
      return;
    }

    // Regular expression to find existing numbered references
    const counterRegex = /\[(\d+)\]:/g;

    // Find the maximum existing numbered link to avoid conflicts
    let maxCounter = 0;
    let match: RegExpExecArray | null;

    counterRegex.lastIndex = 0;
    while ((match = counterRegex.exec(content)) !== null) {
      const num = parseInt(match[1], 10);
      if (num > maxCounter) {
        maxCounter = num;
      }
    }

    // Counter for new lazy links
    let counter = maxCounter;

    // Regular expression to match lazy link references
    // Matches: [link text][*] ... [*]: url
    // Uses DOTALL (s) and MULTILINE (m) flags
    // The pattern needs to match from [text][*] to the corresponding [*]: url
    const linkRegex = /(\[[^\]]+\]\s*\[)\*(\](?:(?!\[[^\]]+\]\s*\[)[\s\S])*?\[)\*\]:/g;

    // Transform lazy links to numbered links
    // Use a while loop to handle overlapping matches
    let transformed = content;
    let hasChanges = false;

    while (linkRegex.test(transformed)) {
      linkRegex.lastIndex = 0;
      transformed = transformed.replace(linkRegex, (match, group1, group2) => {
        counter++;
        hasChanges = true;
        return `${group1}${counter}${group2}${counter}]:`;
      });
      linkRegex.lastIndex = 0;
    }

    // Update the file content for further processing (in-memory)
    file.value = transformed;

    // If persist is enabled and changes were made, write back to source file
    if (persist && hasChanges) {
      const filepath = file.history && file.history[0];
      if (filepath) {
        try {
          writeFileSync(filepath, transformed, 'utf-8');
          console.log(`✨ Lazy links persisted to: ${filepath}`);
        } catch (error) {
          console.warn(`⚠️  Failed to persist lazy links to ${filepath}:`, error);
        }
      }
    }
  };
};
