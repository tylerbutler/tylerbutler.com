import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import brokenLinksData from "../data/broken-links.json";

/**
 * Rehype plugin to mark broken links with custom attributes
 */
export const rehypeMarkBrokenLinks: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "a" && node.properties?.href) {
        const href = node.properties.href as string;
        if (brokenLinksData.some((broken) => href.includes(broken))) {
          node.properties = node.properties || {};

          // Store original URL and rewrite to custom page
          node.properties["data-broken-url"] = href;
          node.properties.href = `/link-not-available?url=${encodeURIComponent(href)}`;

          node.properties["data-broken"] = "true";
          node.properties.title = "This link is no longer available";
        }
      }
    });
  };
};
