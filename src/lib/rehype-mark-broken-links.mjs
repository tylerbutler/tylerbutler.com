import { visit } from 'unist-util-visit';
import brokenLinksData from '../data/broken-links.json' assert { type: 'json' };

export function rehypeMarkBrokenLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = node.properties.href;
        if (brokenLinksData.some(broken => href.includes(broken))) {
          node.properties = node.properties || {};

          // Store original URL and rewrite to custom page
          node.properties['data-broken-url'] = href;
          node.properties.href = `/link-not-available?url=${encodeURIComponent(href)}`;

          node.properties['data-broken'] = 'true';
          node.properties.title = 'This link is no longer available';
        }
      }
    });
  };
}
