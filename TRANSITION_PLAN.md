# Hugo to SvelteKit Transition Plan

## Overview
Complete migration from Hugo static site generator to SvelteKit while preserving all content and exactly matching the design mockup.

**Mockup Reference URL**: http://localhost:3000/Current%20Issue%20%E2%80%94%20Bastion
**Target Deployment**: Netlify
**Current Site**: https://tylerbutler.com/

## Project Analysis

### Current Hugo Structure
```
tylerbutler.com-hugo/
├── content/              # ✅ PRESERVE - All markdown content
│   ├── articles/         # Blog posts organized by year
│   ├── projects/         # Project pages
│   ├── about/           # About page
│   └── colophon/        # Site information
├── netlify.toml         # ✅ PRESERVE - Update for SvelteKit
├── .git/               # ✅ PRESERVE - Git repository
├── tests/              # ✅ PRESERVE - Testing infrastructure
├── package.json        # ✅ UPDATE - Replace with SvelteKit deps
└── README.md           # ✅ PRESERVE - Documentation

# DELETE - Hugo-specific files:
├── .forestry/          # Hugo CMS integration
├── archetypes/         # Hugo content templates
├── config/             # Hugo configuration
├── layouts/            # Hugo templates
├── resources/          # Hugo build resources
├── static/             # Hugo static assets
├── themes/             # Hugo themes
├── azure-hugo/         # Hugo deployment scripts
└── .hugo_build.lock   # Hugo build file
```

### Content Inventory
- **Articles**: 100+ blog posts from 2002-2024 organized by year
- **Projects**: Multiple project showcase pages
- **Static Pages**: About, Colophon
- **Site Config**: Menus, metadata, permalinks

## Design Specification (Based on Mockup Analysis)

### Visual Design System

**Mockup URL**: http://localhost:3000/Current%20Issue%20%E2%80%94%20Bastion

#### Layout Architecture
- **Viewport**: 1200px reference width
- **Main Container**: 636px wide, centered with `30px 282px` margins
- **Content Width**: ~534px (with inner margins of `0px 50.8828px`)
- **Two-Section Layout**:
  1. Header (Dark): `#0E0E0E` background, `35px 25px` padding
  2. Content (Light): `#F7F6F5` background, `50.875px 0px` padding

#### Typography System

**Font Stack Requirements**:
- **Advent Pro** (Google Fonts) - Headlines
- **adelle** (Adobe Fonts) - Body text
- **Lato** (Google Fonts) - Navigation

**Precise Typography Specifications**:

```css
/* Main Site Title */
h1 {
  font-family: "Advent Pro";
  font-size: 96px;
  font-weight: 100;
  line-height: 96px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #A2834E;
  margin: 5px 0;
  text-align: center;
}

/* Site Tagline */
.tagline {
  font-family: adelle;
  font-size: 13px;
  font-weight: 400;
  line-height: 18.2px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #A2834E;
  text-align: center;
  margin: 7px 0 17px;
}

/* Navigation Links */
nav a {
  font-family: Lato;
  font-size: 12px;
  font-weight: 400;
  line-height: 15px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #F7F6F5; /* default state */
  /* color: #A2834E; /* active/current page */
}

/* Section Headings */
h2 {
  font-family: adelle;
  font-size: 26px;
  font-weight: 300;
  line-height: 32.5px;
  letter-spacing: 1px;
  color: #262626;
  margin: 0 0 19.5px;
}

/* Body Text */
p {
  font-family: adelle;
  font-size: 14px;
  font-weight: 400;
  line-height: 23.8px;
  color: #262626;
  margin: 14px 0;
}
```

#### Color Palette

```css
:root {
  /* Backgrounds */
  --dark-bg: #0E0E0E;      /* Header section background */
  --light-bg: #F7F6F5;     /* Content section background */
  --overlay: rgba(0,0,0,0.2); /* Dark overlay for depth */

  /* Text Colors */
  --accent: #A2834E;       /* Titles, active nav, tagline (golden bronze) */
  --text: #262626;         /* Body text (dark gray) */
  --nav-links: #F7F6F5;    /* Navigation links (off-white) */
}
```

#### Spacing System

**Container Measurements**:
- Overall container: `636px` width
- Container margins: `30px 282px` (centers in 1200px viewport)
- Header padding: `35px 25px`
- Content padding: `50.875px 0px`
- Inner content margins: `0px 50.8828px`

**Navigation**:
- Hidden by default (`display: none`)
- When visible: `12px 0px` padding, center aligned

#### Component Hierarchy

1. **Site Header** (Dark section)
   - Main title (96px Advent Pro)
   - Tagline (13px adelle, uppercase, spaced)

2. **Navigation** (Hidden/overlay)
   - 6 navigation items
   - Lato font, uppercase, heavy letter-spacing

3. **Content Section** (Light section)
   - Section headings (26px adelle, light weight)
   - Body paragraphs (14px adelle)
   - Emphasis and strong text styling

## Implementation Plan

### Phase 1: Project Setup
1. **Initialize SvelteKit Project**
   ```bash
   npm create svelte@latest .
   # Choose: Skeleton project, TypeScript, ESLint, Prettier
   ```

2. **Install Dependencies**
   ```bash
   npm install -D @tailwindcss/typography
   npm install marked gray-matter
   npm install @fontsource/advent-pro @fontsource/lato
   # Note: adelle requires Adobe Fonts subscription
   ```

3. **Configure Adapter**
   ```bash
   npm install -D @sveltejs/adapter-static
   ```

### Phase 2: Content Migration Strategy

#### Hugo Front Matter → SvelteKit Metadata
**Hugo Format**:
```yaml
---
title: "Article Title"
date: 2024-01-15
tags: ["tag1", "tag2"]
---
```

**SvelteKit Format**:
```typescript
// src/lib/types.ts
export interface ArticleMeta {
  title: string;
  date: string;
  tags?: string[];
  slug: string;
  excerpt?: string;
}
```

#### URL Structure Preservation
```
Hugo:     /2024/01/article-title/
SvelteKit: /articles/2024/01/article-title/
```

#### Content Processing Pipeline
1. **Parse Markdown**: Use `gray-matter` for front matter
2. **Process Content**: Use `marked` for markdown rendering
3. **Generate Routes**: Dynamic routing for articles
4. **Preserve Permalinks**: Maintain SEO and bookmarks

### Phase 3: SvelteKit Architecture

#### Directory Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── Header.svelte      # Site header with title/tagline
│   │   ├── Navigation.svelte  # Main navigation
│   │   ├── ArticleCard.svelte # Article preview cards
│   │   └── Footer.svelte      # Site footer
│   ├── content/
│   │   ├── articles.ts        # Article loading utilities
│   │   └── markdown.ts        # Markdown processing
│   ├── styles/
│   │   ├── global.css         # Global styles and CSS variables
│   │   ├── typography.css     # Font loading and typography
│   │   └── layout.css         # Layout and spacing
│   └── types.ts               # TypeScript interfaces
├── routes/
│   ├── +layout.svelte         # Main layout template
│   ├── +page.svelte           # Homepage
│   ├── articles/
│   │   ├── +page.svelte       # Articles index
│   │   ├── [year]/
│   │   │   └── [month]/
│   │   │       └── [slug]/
│   │   │           └── +page.svelte  # Individual articles
│   ├── projects/
│   │   ├── +page.svelte       # Projects index
│   │   └── [slug]/
│   │       └── +page.svelte   # Individual projects
│   ├── about/
│   │   └── +page.svelte       # About page
│   └── colophon/
│       └── +page.svelte       # Colophon page
└── app.html                   # HTML template
```

#### Key Components

**Layout Component** (`src/routes/+layout.svelte`):
```svelte
<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '../lib/styles/global.css';
</script>

<div class="site-container">
  <Header />
  <Navigation />
  <main class="content-section">
    <div class="content-inner">
      <slot />
    </div>
  </main>
  <Footer />
</div>
```

**Header Component** (Matching mockup exactly):
```svelte
<header class="site-header">
  <h1><a href="/">Tyler Butler</a></h1>
  <p class="tagline">Personal Website</p>
</header>

<style>
  .site-header {
    background-color: var(--dark-bg);
    padding: 35px 25px;
    text-align: center;
  }

  h1 {
    font-family: "Advent Pro";
    font-size: 96px;
    font-weight: 100;
    line-height: 96px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent);
    margin: 5px 0;
  }

  .tagline {
    font-family: adelle;
    font-size: 13px;
    font-weight: 400;
    line-height: 18.2px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--accent);
    margin: 7px 0 17px;
  }
</style>
```

### Phase 4: Content Processing

#### Markdown Processing (`src/lib/content/markdown.ts`):
```typescript
import { marked } from 'marked';
import matter from 'gray-matter';

export function processMarkdown(content: string) {
  const { data, content: markdownContent } = matter(content);
  const html = marked(markdownContent);

  return {
    metadata: data,
    html,
    excerpt: generateExcerpt(markdownContent)
  };
}
```

#### Article Loading (`src/lib/content/articles.ts`):
```typescript
export async function loadArticles() {
  const modules = import.meta.glob('/content/articles/**/*.md', {
    as: 'raw'
  });

  const articles = await Promise.all(
    Object.entries(modules).map(async ([path, resolver]) => {
      const content = await resolver();
      const { metadata, html, excerpt } = processMarkdown(content);

      return {
        ...metadata,
        html,
        excerpt,
        slug: extractSlugFromPath(path)
      };
    })
  );

  return articles.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
```

### Phase 5: Deployment Configuration

#### Netlify Configuration (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/feed"
  to = "/rss.xml"
  status = 301

# Preserve Hugo URL structure
[[redirects]]
  from = "/:year/:month/:slug/"
  to = "/articles/:year/:month/:slug/"
  status = 301

[headers]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

#### SvelteKit Configuration (`svelte.config.js`):
```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null
    }),
    prerender: {
      default: true
    }
  }
};
```

## Migration Checklist

### Pre-Migration
- [ ] Backup current site and git repository
- [ ] Verify mockup design specifications
- [ ] Test content inventory completeness
- [ ] Confirm font licensing (Adobe Fonts for adelle)

### Development Phase
- [ ] Initialize SvelteKit project
- [ ] Implement base layout matching mockup exactly
- [ ] Create content processing pipeline
- [ ] Migrate all articles with front matter
- [ ] Implement navigation and routing
- [ ] Add RSS feed generation
- [ ] Create 404 and error pages

### Testing Phase
- [ ] Visual comparison with mockup
- [ ] Content migration verification
- [ ] URL structure preservation
- [ ] Performance testing
- [ ] Mobile responsiveness
- [ ] SEO metadata verification

### Deployment Phase
- [ ] Update netlify.toml configuration
- [ ] Deploy to staging environment
- [ ] DNS and domain verification
- [ ] Production deployment
- [ ] Monitoring and analytics setup

### Post-Migration Cleanup
- [ ] Delete Hugo-specific directories
- [ ] Update documentation
- [ ] Archive old deployment scripts
- [ ] Monitor for broken links or issues

## Files to Delete After Migration

```bash
# Hugo-specific directories and files
rm -rf .forestry/
rm -rf archetypes/
rm -rf config/
rm -rf layouts/
rm -rf resources/
rm -rf static/
rm -rf themes/
rm -rf azure-hugo/
rm .hugo_build.lock

# Hugo build artifacts
rm -rf public/
rm -rf resources/
```

## Risk Mitigation

### Content Preservation
- All content files backed up in git
- Gradual migration with verification steps
- URL redirect preservation for SEO

### Design Fidelity
- Pixel-perfect mockup analysis documented
- Typography specifications captured precisely
- Color values extracted and documented

### Performance
- Static site generation maintained
- Netlify CDN deployment preserved
- Minimal JavaScript footprint

### SEO Continuity
- URL structure preservation via redirects
- Meta tags and structured data migration
- RSS feed maintenance

## Success Criteria

1. **Visual Match**: Site matches mockup design pixel-perfectly
2. **Content Integrity**: All articles and pages migrate without loss
3. **Performance**: Load times equal or better than Hugo version
4. **SEO Preservation**: No loss in search rankings or broken links
5. **Functionality**: All features work as expected
6. **Maintainability**: Clean, well-structured SvelteKit codebase

## Timeline Estimate

- **Setup & Architecture**: 4-6 hours
- **Design Implementation**: 6-8 hours
- **Content Migration**: 4-6 hours
- **Testing & Refinement**: 3-4 hours
- **Deployment & Cleanup**: 2-3 hours

**Total Estimated Time**: 19-27 hours

## Notes

- The mockup appears to be from a science fiction magazine (Bastion), providing excellent typography and layout reference
- Pay special attention to the precise letter-spacing and font weights
- The two-tone background system (dark header, light content) is crucial to the aesthetic
- Navigation is currently hidden in mockup but structure is clear
- Adobe Fonts subscription may be required for authentic adelle font usage