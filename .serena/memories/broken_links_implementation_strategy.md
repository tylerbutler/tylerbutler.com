# Broken Links Display Strategy

## Current State
The site has broken links detected by astro-broken-links-checker:
- Internal broken links: `/tag/nanowrimo`, `/tag/novel`, `/articles/2012/05/xkcd-2`
- Missing SharePoint resources: `/SiteCollectionImages/...`, `/SiteCollectionDocuments/...`

## Recommended Implementation (Researched 2025-10-03)

### Approach: Semantic HTML with Remark Plugin
Best for accessibility and maintainability.

#### 1. Create Remark Plugin
```js
// src/lib/remark-mark-broken-links.mjs
import { visit } from 'unist-util-visit';

const brokenLinks = [
  '/tag/nanowrimo',
  '/tag/novel',
  '/tag/novel/',
  '/articles/2012/05/xkcd-2',
  '/2009/06/outlook-email-and-css/comment-page-1/#comment-137',
  // SharePoint paths
  '/SiteCollectionImages/',
  '/SiteCollectionDocuments/',
];

export function remarkMarkBrokenLinks() {
  return (tree) => {
    visit(tree, 'link', (node) => {
      if (brokenLinks.some(broken => node.url.includes(broken))) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties['data-broken'] = 'true';
        node.data.hProperties['aria-disabled'] = 'true';
        node.data.hProperties['title'] = 'This link is no longer available';
      }
    });
  };
}
```

#### 2. Add to astro.config.mjs
```js
import { remarkMarkBrokenLinks } from './src/lib/remark-mark-broken-links.mjs';

markdown: {
  remarkPlugins: [
    // existing plugins...
    remarkMarkBrokenLinks,
  ],
}
```

#### 3. CSS Styling Options

**Option A: Strikethrough + Muted (Visual)**
```css
a[data-broken="true"] {
  text-decoration: line-through;
  color: #6b7280;
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Option B: Semantic with <del> (Best Accessibility)**
Wrap in `<del>` tag for screen reader support:
```html
<del><a href="/broken" aria-disabled="true">Link</a></del>
```

**Option C: Icon Badge**
```css
a[data-broken="true"]::after {
  content: "⚠️";
  margin-left: 0.25em;
}
```

**Option D: Tombstone/Archive Indicator**
```css
a[data-broken="true"]::before {
  content: "🪦 ";
}
```

### Why This Approach?
- ✅ Automated during build (no manual link tagging)
- ✅ Screen reader accessible
- ✅ Visually clear indication
- ✅ Prevents clicking (`pointer-events: none`)
- ✅ Easy to maintain (update broken links array)
- ✅ Works with static output

### Alternative: Client-Side Solution
If you prefer JavaScript:
```js
// Check and mark broken links on page load
document.querySelectorAll('a').forEach(link => {
  if (brokenLinks.includes(link.pathname)) {
    link.setAttribute('data-broken', 'true');
    link.setAttribute('aria-disabled', 'true');
  }
});
```

## Research Findings
- CSS alone can't detect broken links (browser doesn't know until request)
- `<del>` tag provides semantic "deleted" announcement for screen readers
- `text-decoration: line-through` is visual only, not announced by screen readers
- `pointer-events: none` prevents link interaction
- Tombstone icons (🪦) are available but not standard for link rot
- Link rot is common in old blogs; visual indicators help users understand content age

## Files to Create/Modify
1. `src/lib/remark-mark-broken-links.mjs` (new)
2. `astro.config.mjs` (add plugin)
3. `src/lib/styles/global.css` (add broken link styles)

## Decision Needed
Choose styling approach based on:
- Accessibility priority → Option B (semantic <del>)
- Visual clarity → Option A (strikethrough)
- Creative/archival feel → Option D (tombstone)
