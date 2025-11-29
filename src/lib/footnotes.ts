/**
 * Footnotes processing utilities for integrating with Littlefoot.js
 * Transforms GFM footnotes to be compatible with Littlefoot's expected format
 */

import type { Element } from "hast";
import { visit } from "unist-util-visit";
import type { Root } from "hast";

/**
 * Configuration options for footnote processing
 */
export interface FootnoteOptions {
  /** CSS selector for footnote references (default: 'sup[id^="user-content-fnref-"]') */
  referenceSelector?: string;
  /** CSS selector for footnote definitions (default: 'section[data-footnotes]') */
  definitionSelector?: string;
  /** Whether to activate littlefoot automatically (default: true) */
  activateOnLoad?: boolean;
  /** Littlefoot.js options to pass through */
  littlefootOptions?: {
    allowDuplicates?: boolean;
    allowMultiple?: boolean;
    anchorParentSelector?: string;
    anchorPattern?: RegExp;
    dismissDelay?: number;
    dismissOnUnhover?: boolean;
    footnoteSelector?: string;
    hoverDelay?: number;
    numberResetSelector?: string;
    scope?: string;
    [key: string]: any;
  };
}

/**
 * Default options for footnote processing
 */
const defaultOptions: Required<FootnoteOptions> = {
  referenceSelector: 'sup[id^="user-content-fnref-"]',
  definitionSelector: "section[data-footnotes]",
  activateOnLoad: true,
  littlefootOptions: {
    allowDuplicates: false,
    allowMultiple: false,
    dismissDelay: 100,
    dismissOnUnhover: true,
    hoverDelay: 250,
    scope: "body",
  },
};

/**
 * Transforms GFM footnotes in HAST to be compatible with Littlefoot.js
 * This function modifies the HTML AST to ensure footnotes work with Littlefoot
 *
 * @param tree - HAST tree to transform
 * @param options - Configuration options
 */
export function transformFootnotesForLittlefoot(
  tree: Root,
  options: FootnoteOptions = {},
): void {
  const opts = { ...defaultOptions, ...options };

  // Track footnote references and definitions
  const footnoteMap = new Map<string, { ref: Element; def: Element }>();

  // First pass: find all footnote references
  visit(tree, "element", (node: Element) => {
    if (
      node.tagName === "sup" &&
      node.properties?.id &&
      typeof node.properties.id === "string" &&
      node.properties.id.startsWith("user-content-fnref-")
    ) {
      const footnoteId = node.properties.id.replace("user-content-fnref-", "");

      // Transform the reference for Littlefoot compatibility
      if (
        node.children[0] &&
        node.children[0].type === "element" &&
        node.children[0].tagName === "a"
      ) {
        const linkElement = node.children[0] as Element;

        // Add rel="footnote" for Littlefoot recognition
        linkElement.properties = {
          ...linkElement.properties,
          rel: "footnote",
          "data-footnote-id": footnoteId,
        };

        // Store for mapping with definition
        if (!footnoteMap.has(footnoteId)) {
          footnoteMap.set(footnoteId, { ref: node, def: null as any });
        } else {
          footnoteMap.get(footnoteId)!.ref = node;
        }
      }
    }
  });

  // Second pass: find footnote definitions and transform them
  visit(tree, "element", (node: Element) => {
    if (
      node.tagName === "section" &&
      node.properties?.["data-footnotes"] !== undefined
    ) {
      // Remove the "Footnotes" heading if it exists
      node.children = node.children.filter((child: any) => {
        if (child.type !== "element") return true;
        if (child.tagName !== "h2") return true;
        if (child.properties?.id !== "footnote-label") return true;
        return false; // Remove this h2 with id="footnote-label"
      });

      // Find all footnote list items within this section
      visit(node, "element", (listItem: Element) => {
        if (
          listItem.tagName === "li" &&
          listItem.properties?.id &&
          typeof listItem.properties.id === "string" &&
          listItem.properties.id.startsWith("user-content-fn-")
        ) {
          const footnoteId = listItem.properties.id.replace(
            "user-content-fn-",
            "",
          );

          // Transform for Littlefoot compatibility
          listItem.properties = {
            ...listItem.properties,
            id: `fn:${footnoteId}`,
            "data-footnote-id": footnoteId,
          };

          // Remove the back-reference link (↩) as Littlefoot handles this
          visit(listItem, "element", (backRef: Element, index, parent) => {
            if (
              backRef.tagName === "a" &&
              backRef.properties?.["data-footnote-backref"] !== undefined
            ) {
              if (parent && typeof index === "number") {
                parent.children.splice(index, 1);
              }
            }
          });

          // Store for mapping
          if (!footnoteMap.has(footnoteId)) {
            footnoteMap.set(footnoteId, { ref: null as any, def: listItem });
          } else {
            footnoteMap.get(footnoteId)!.def = listItem;
          }
        }
      });
    }
  });
}

/**
 * Generates the Littlefoot.js initialization script
 *
 * @param options - Configuration options
 * @returns JavaScript code as a string
 */
export function generateLittlefootScript(
  options: FootnoteOptions = {},
): string {
  const opts = { ...defaultOptions, ...options };

  const littlefootConfig = JSON.stringify(opts.littlefootOptions, null, 2);

  return `
// Initialize Littlefoot.js for interactive footnotes
import { littlefoot } from 'littlefoot';

function initializeLittlefoot() {
  littlefoot(${littlefootConfig});
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLittlefoot);
} else {
  initializeLittlefoot();
}
`.trim();
}

/**
 * Generates the CSS imports needed for Littlefoot.js
 *
 * @returns CSS import statements
 */
export function generateLittlefootCSS(): string {
  return `
/* Littlefoot.js CSS for interactive footnotes */
import 'littlefoot/dist/littlefoot.css';

/* Optional: Custom footnote styling */
.littlefoot-footnote__wrapper {
  max-width: 400px;
}

.littlefoot-footnote__content {
  font-size: 0.9em;
  line-height: 1.4;
}

/* Style footnote references */
a[rel="footnote"] {
  text-decoration: none;
  color: #0066cc;
  font-weight: 500;
}

a[rel="footnote"]:hover {
  text-decoration: underline;
}
`.trim();
}

/**
 * Creates a rehype plugin for processing footnotes with Littlefoot.js
 *
 * @param options - Configuration options
 * @returns Rehype plugin function
 */
export function rehypeFootnotes(options: FootnoteOptions = {}) {
  return function (tree: Root) {
    transformFootnotesForLittlefoot(tree, options);
  };
}
