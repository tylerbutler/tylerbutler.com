import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const SITE_HOST = "tylerbutler.com";

/**
 * Rehype plugin that tags outbound `<a>` links with Tinylytics event
 * attributes so click-tracking works without any runtime DOM walking.
 *
 * - External `http(s)://` links to a different host get `link.external` +
 *   the destination URL as the event value.
 * - `mailto:` and `tel:` links get `link.mailto` / `link.tel`.
 * - Links that already carry a `data-tinylytics-event` attribute are left
 *   alone so explicit categorized events (set by `rehypeMarkBrokenLinks`
 *   or by hand in `.astro` components) win.
 *
 * Must be registered AFTER `rehypeMarkBrokenLinks` so broken links are
 * already rewritten to internal URLs and don't get tagged as external.
 */
export const rehypeTagExternalLinks: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a" || !node.properties?.href) return;
      if (node.properties["data-tinylytics-event"]) return;

      const href = String(node.properties.href);

      if (href.startsWith("mailto:")) {
        node.properties["data-tinylytics-event"] = "link.mailto";
        node.properties["data-tinylytics-event-value"] = href.slice(7);
        return;
      }
      if (href.startsWith("tel:")) {
        node.properties["data-tinylytics-event"] = "link.tel";
        node.properties["data-tinylytics-event-value"] = href.slice(4);
        return;
      }
      if (!/^https?:\/\//i.test(href)) return;

      try {
        const u = new URL(href);
        if (u.host && u.host !== SITE_HOST && !u.host.endsWith(`.${SITE_HOST}`)) {
          node.properties["data-tinylytics-event"] = "link.external";
          node.properties["data-tinylytics-event-value"] = u.href;
        }
      } catch {
        // malformed URL — leave alone
      }
    });
  };
};
