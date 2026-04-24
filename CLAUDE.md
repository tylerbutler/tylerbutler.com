# CLAUDE.md

Personal website ([tylerbutler.com](https://tylerbutler.com)) built with Astro, deployed to Netlify.

## Commands

```bash
pnpm dev              # Start dev server (localhost:4321)
pnpm build            # Production build (requires env vars below)
pnpm check            # Astro type-check (minimumSeverity warning)
pnpm format           # Biome format (linter disabled)
pnpm serve            # Serve dist/ on port 4173
pnpm test:unit        # Vitest unit tests
pnpm test:visual      # Playwright visual regression tests
pnpm test:lighthouse  # Lighthouse CI performance tests
pnpm test:accessibility  # pa11y-ci accessibility tests
```

**Build env vars** (required for production):

```bash
GITHUB_REPO_OWNER=tylerbutler
GITHUB_REPO_NAME=private-resources
```

**Optional env vars**:

- `SHOW_DRAFTS=1` — include `draft: true` content in collection queries, listing pages, and the feed. Off by default in dev and prod. Centralized in `src/lib/draft-utils.ts` (`includeDraft(data)`). Use `SHOW_DRAFTS=1 pnpm dev` (or `pnpm build`) to preview drafts.

## Architecture

```
src/
  content/          # Astro content collections
    articles/       # Blog posts (MDX, organized by year)
    notes/          # Short-form posts
    projects/       # Project showcases
    config.ts       # Collection schemas
  components/       # Astro components
  layouts/          # BaseLayout.astro (sole layout)
  lib/
    markdown-utils.ts        # Expressive Code config + unified pipelines
    rehype/
      rehype-code-fold.ts    # Wraps code blocks for oriDomi fold animation
    scripts/
      code-fold.ts           # Client-side fold animation logic
    themes/                  # Ayu Light, Ayu Mirage, OneDark themes
  pages/            # File-based routing
scripts/            # Build utilities (font download, URL extraction)
docs/superpowers/   # Implementation plans and specs
```

## Key Patterns

**Syntax highlighting**: Uses Expressive Code (`rehype-expressive-code`), NOT Astro's built-in highlighter. `syntaxHighlight: false` in markdown config is intentional.

**Expressive Code themes**: Ayu Light (`.light`) and Ayu Mirage (`.dark`) — toggled via CSS class on `<html>`, not `prefers-color-scheme`.

**Custom CCL language**: `src/lib/ccl.tmLanguage.json` registered as a Shiki grammar for code blocks with `lang="ccl"`.

**rehype plugin order matters**: `rehypeExpressiveCode` must run before `rehypeCodeFold`. Both are registered in `astro.config.ts` for MDX and in `markdown-utils.ts` for standalone unified pipelines.

**Font pipeline**: `scripts/download-fonts.ts` fetches fonts at build start; `scripts/optimize-fonts.ts` runs post-build (currently disabled — requires Chrome/Puppeteer for glyphhanger).

**Micropub**: IndieWeb publishing endpoint at `/micropub` → `/.netlify/functions/micropub`.

## Content Schemas

Articles support `link` + `via`/`vialink` fields for link-style posts (auto-infers `articleType: "link"`). Use `headingStartLevel` to override remark-shift-headings behavior. Use `type: "guide"` to show a ToC.

Notes are short-form posts (no `title` by convention). Schema accepts `date` (required), optional `lastmod`, `title`, `tags`, `summary`, `originalUrl`, and `draft`. `originalUrl` preserves the source path for content imported from other systems (e.g. the micro.blog archive). `lastmod` is only set when it differs from `date`.

## Linting

Biome handles formatting and linting. `pnpm format` runs Biome with linter disabled (format-only). `pnpm check` runs `astro check` for TypeScript.

## Deployment

Netlify. `pnpm build` is the build command; `dist/` is the publish directory. Pagefind search index is built post-build automatically.
