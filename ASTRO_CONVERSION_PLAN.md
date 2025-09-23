# Astro Conversion Plan

## Overview
Convert tylerbutler.com from SvelteKit to Astro for simplified content management and better performance for a content-focused site.

## Phase 1: Setup & Dependencies

### 1.1 Initialize Astro Project
- [ ] Install Astro: `npm create astro@latest`
- [ ] Choose minimal template
- [ ] Add Svelte integration: `@astrojs/svelte`
- [ ] Configure TypeScript support

### 1.2 Essential Integrations
- [ ] `@astrojs/sitemap` - for SEO
- [ ] `@astrojs/rss` - for RSS feed
- [ ] `@astrojs/mdx` - for enhanced markdown
- [ ] `@astrojs/tailwind` - for styling (if needed)

## Phase 2: Content Migration

### 2.1 Content Collections Setup
Replace custom content loading with Astro Content Collections:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
```

### 2.2 Move Content Files
- [ ] Move `/content/articles/**/*.md` to `/src/content/articles/`
- [ ] Update frontmatter to match schema
- [ ] Validate all articles load correctly

### 2.3 Remove Custom Content Logic
Files to delete/replace:
- [ ] `src/lib/content/articles.ts` (100+ lines → Content Collections API)
- [ ] `src/lib/content/markdown.ts` (150+ lines → Astro's built-in processing)
- [ ] Custom slug extraction logic
- [ ] Manual frontmatter parsing

## Phase 3: Page Structure

### 3.1 Layout Conversion
- [ ] Convert `src/routes/+layout.svelte` to `src/layouts/BaseLayout.astro`
- [ ] Migrate global styles to Astro
- [ ] Convert Header/Navigation components

### 3.2 Page Routing
Replace SvelteKit routing with Astro file-based routing:

```
Current SvelteKit:                 New Astro:
src/routes/+page.svelte           src/pages/index.astro
src/routes/about/+page.svelte     src/pages/about.astro
src/routes/articles/+page.svelte  src/pages/articles/index.astro
src/routes/articles/[year]/[month]/[slug]/+page.svelte
                                  src/pages/articles/[...slug].astro
```

### 3.3 Dynamic Routes
- [ ] Implement `[...slug].astro` for article pages
- [ ] Use `getStaticPaths()` to generate routes from content collections
- [ ] Handle year/month/slug URL patterns

## Phase 4: Component Migration

### 4.1 Convert Svelte Components
Components to migrate:
- [ ] `Header.svelte` → `Header.astro` (or keep as `.svelte` with Astro/Svelte integration)
- [ ] `Navigation.svelte` → `Navigation.astro`
- [ ] `Footer.svelte` → `Footer.astro`

### 4.2 Interactive Components
- [ ] Identify which components need client-side reactivity
- [ ] Use `client:load` directive for interactive Svelte components
- [ ] Convert static components to Astro for better performance

## Phase 5: Content Processing

### 5.1 Replace Custom Logic with Astro APIs
Current custom code → Astro equivalent:

```typescript
// Current: Manual article loading
const articles = await loadArticles();

// New: Content Collections API
const articles = await getCollection('articles', ({ data }) => {
  return !data.draft;
});
```

### 5.2 Utility Functions
- [ ] Replace `getArticlesByYear()` with Collection API filtering
- [ ] Replace `getRecentArticles()` with Collection API sorting
- [ ] Remove manual excerpt generation (use Astro's built-in)

## Phase 6: Build & Deployment

### 6.1 Configuration
- [ ] Configure `astro.config.mjs`
- [ ] Set up proper output mode (static/hybrid)
- [ ] Configure site URL for sitemap/RSS

### 6.2 Build Process
- [ ] Update `package.json` scripts
- [ ] Test build process
- [ ] Verify static generation works correctly

### 6.3 Deployment Updates
- [ ] Update Netlify configuration
- [ ] Test deployment pipeline
- [ ] Verify performance improvements

## Phase 7: Optimization

### 7.1 Performance
- [ ] Enable image optimization
- [ ] Implement proper caching headers
- [ ] Optimize CSS delivery

### 7.2 SEO
- [ ] Generate sitemap
- [ ] Create RSS feed
- [ ] Implement proper meta tags

## Code Reduction Summary

| Current SvelteKit | Lines | Astro Equivalent | Lines |
|------------------|-------|------------------|-------|
| `articles.ts` | 88 | Content Collections API | ~10 |
| `markdown.ts` | 104 | Built-in processing | ~5 |
| Server routes | 30 | `getStaticPaths()` | ~15 |
| Custom routing | 50 | File-based routing | 0 |
| **Total** | **272** | **Total** | **30** |

**~90% code reduction for content management**

## Migration Strategy

### Option A: Incremental Migration
1. Set up Astro alongside SvelteKit
2. Migrate pages one by one
3. Switch domains when complete

### Option B: Full Migration
1. Complete conversion in branch
2. Test thoroughly
3. Deploy all at once

**Recommendation: Option B** - Clean break, simpler to maintain

## Timeline Estimate

- **Phase 1-2: Setup & Content** - 1-2 days
- **Phase 3-4: Pages & Components** - 2-3 days
- **Phase 5-6: Logic & Build** - 1-2 days
- **Phase 7: Optimization** - 1 day

**Total: 5-8 days** for complete migration

## Success Metrics

- [ ] All articles load correctly
- [ ] URLs remain unchanged (SEO preservation)
- [ ] Build time improvement
- [ ] Bundle size reduction
- [ ] Lighthouse score improvement
- [ ] Developer experience improvement (less code to maintain)

## Rollback Plan

- Keep SvelteKit branch as backup
- Use feature flags for gradual rollout
- Monitor analytics for any issues
- Quick revert capability via git branches

---

**Next Steps:**
1. Review and approve this plan
2. Begin Phase 1: Astro setup
3. Create proof-of-concept with 1-2 articles
4. Proceed with full migration if POC successful