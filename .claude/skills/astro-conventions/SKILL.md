---
name: astro-conventions
description: Project conventions and architecture for this Astro site (tylerbutler.com)
user-invocable: false
---

# Astro Project Conventions

## Stack

- **Framework**: Astro 5 with MDX
- **Hosting**: Netlify (static output)
- **Formatting/Linting**: Biome
- **Search**: Pagefind (built post-build)
- **Fonts**: Custom font pipeline (download + optimize)
- **Testing**: Playwright (visual), Lighthouse (perf), pa11y (a11y)

## Content Collections

Two collections defined in `src/content/config.ts`:

### Articles (`src/content/articles/`)
- Naming: `YYYY-MM-DD-<slug>.md` (recent) or `YYYY/YYYY-MM-DD-<slug>.md` (older, by year)
- Required frontmatter: `title`, `date`
- Optional: `tags`, `slug`, `excerpt`, `draft`, `link`, `via`, `vialink`, `headingStartLevel`, `type`
- `type: "guide"` shows a table of contents; default is "standard"
- Articles with a `link` field are auto-classified as link-type articles
- Use `<!--more-->` as excerpt separator

### Projects (`src/content/projects/`)
- Required: `title`
- Optional: `date`, `description`, `tags`, `url`, `github`, `draft`

## Layout

Single base layout: `src/layouts/BaseLayout.astro`

## Components (`src/components/`)

Astro components: ArticlePage, Header, Footer, Navigation, ThemeToggle, BrokenLinkTooltip, SocialIconsBelow, FootnotesScript, BrokenUrlDisplay

## Markdown Pipeline

Both `.md` and `.mdx` files go through remark/rehype plugins configured in `astro.config.ts`:

**Remark** (in order): remarkLazyLinks, remarkGfm, remarkSmartypants, remarkGithubBlockquoteAlert, remarkShiftHeadings

**Rehype** (in order): rehypeFootnotes, rehypeSlug, rehypeAutolinkHeadings, rehypeExpressiveCode, rehypeMarkBrokenLinks

## Pages (`src/pages/`)

- `index.astro` - Homepage
- `[...slug].astro` / `[slug].astro` - Dynamic article routes
- `articles/` - Article listing
- `projects.astro` / `projects/` - Project listing
- `about.astro`, `colophon.astro`, `search.astro`
- `feed.xml.ts` - RSS feed
- `tags/` - Tag pages

## Build

- `pnpm build` triggers Astro build with font download, Pagefind indexing, sitemap, broken link checking
- Bundle analysis available via `rollup-plugin-visualizer` in production
- Assets output to `dist/assets/`

## Style Conventions

- Biome formatter: 2-space indent, double quotes for JS/TS
- CSS: PostCSS nesting enabled
- Astro/Svelte/Vue files have relaxed lint rules (useConst, useImportType, noUnusedVariables off)
