import path from "pathe";
import remarkMermaid from "remark-mermaid";
import type { Plugin } from "unified";

export interface RemarkMermaidOptions {
  /**
   * Whether to use simple mode (wrap in div instead of generating SVG)
   */
  simple?: boolean;
  /**
   * Subdirectory name for SVG output, relative to the markdown file
   * @default undefined (outputs to same directory as markdown file)
   */
  destinationSubdir?: string;
}

/**
 * Wrapper around remark-mermaid that allows configuring SVG output directory
 * via a subdirectory name, since remark-mermaid doesn't expose this as a plugin option.
 *
 * @example
 * // Output SVGs to diagrams/ subdirectory
 * [remarkMermaidConfigured, { destinationSubdir: 'diagrams' }]
 *
 * // Output SVGs next to markdown files (default)
 * remarkMermaidConfigured
 */
export const remarkMermaidConfigured: Plugin<[RemarkMermaidOptions?]> =
  function (options = {}) {
    const { simple = false, destinationSubdir } = options;

    return (tree, file) => {
      // Set destination directory if subdirectory is specified
      if (destinationSubdir && file.dirname) {
        file.data.destinationDir = path.join(file.dirname, destinationSubdir);
      }

      // Call the original remark-mermaid plugin with simple option
      return remarkMermaid.call(this, { simple })(tree, file);
    };
  };
