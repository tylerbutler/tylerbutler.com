# CLAUDE.md

Personal website ([tylerbutler.com](https://tylerbutler.com)) built with Astro, deployed to Netlify.

## Commands

```bash
pnpm dev              # Start dev server (localhost:4321)
pnpm build            # Production build
pnpm check            # Astro type-check (minimumSeverity warning)
pnpm format           # Biome format (linter disabled)
pnpm serve            # Serve dist/ on port 4173
pnpm test:unit        # Node.js unit tests
pnpm test:visual      # Playwright visual regression tests
pnpm test:lighthouse  # Lighthouse CI performance tests
pnpm test:accessibility  # pa11y-ci accessibility tests
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

**Font pipeline**: `scripts/font-config.ts` defines PragmataPro Mono Liga 0.903 and Idlewild SSm 1.401 faces. `scripts/download-fonts.ts` fetches their full WOFF2 sources from `fonts.tylerbutler.com` at build start with an approved `Origin` header and no GitHub credentials; `scripts/publish-font-subsets.ts` scans generated HTML and publishes both families through the same service after the build. Sources under `public/fonts/` are ignored by Git. Idlewild SSm Light (300) supplies masthead titles. Self-hosted Lato from `@fontsource/lato` supplies the social-preview site label at weight 300, navigation, constellation labels, UI labels, and social-preview metadata at weight 400, and alert titles at weight 700; `--label-font` is the shared CSS stack. Article headings, body text, and the italic rotating tagline use Adelle. `PragmataPro` remains the code font's CSS family.

**Micropub**: IndieWeb publishing endpoint at `/micropub` → `/.netlify/functions/micropub`.

## Content Schemas

Articles support `link` + `via`/`vialink` fields for link-style posts (auto-infers `articleType: "link"`). Use `headingStartLevel` to override remark-shift-headings behavior. Use `type: "guide"` to show a ToC.

Notes are short-form posts (no `title` by convention). Schema accepts `date` (required), optional `lastmod`, `title`, `tags`, `summary`, `originalUrl`, and `draft`. `originalUrl` preserves the source path for content imported from other systems (e.g. the micro.blog archive). `lastmod` is only set when it differs from `date`.

## Linting

Biome handles formatting and linting. `pnpm format` runs Biome with linter disabled (format-only). `pnpm check` runs `astro check` for TypeScript.

## Deployment

Netlify. `pnpm build` is the build command; `dist/` is the publish directory. Pagefind search index is built post-build automatically.

## Design Context

`PRODUCT.md` (project root) captures the strategic design context: brand register, audience, positioning ("a programmer's home on the web"), personality, anti-references, and design principles. `DESIGN.md` captures the visual system — palette, typography, elevation, and components — under the north star "The Golden Age Paperback". Read both before any design or UI work; the retro-sci-fi identity (Idlewild SSm masthead, golden-hour palette, constellation dividers) is committed brand and should be preserved and deepened, not replaced.
