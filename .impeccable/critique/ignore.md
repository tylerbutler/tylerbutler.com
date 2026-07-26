# Critique ignore list

Findings confirmed intentional by the user; do not re-report.

- **Homepage renders full articles when no `<!--more-->` marker is present** (`src/lib/markdown-utils.ts` / `src/pages/index.astro`): intentional classic-blog behavior, confirmed 2026-07-17. The `<!--more-->` marker is the author's opt-in truncation point; markerless posts are meant to appear in full. Do not flag homepage length, missing truncation, or "preview vs full article" inconsistency stemming from this.
- **Lato as a UI/label font** (`overused-font` detector hits, e.g. `src/pages/index.astro`): Lato is the documented wayfinding label font in DESIGN.md; not font drift.
- **Westgate on constellation labels** (`.constellation-label`, ConstellationIcon): intentional identity choice, confirmed 2026-07-17 — the constellation nameplates may use Westgate; treat as a sanctioned exception to the Masthead Rule (DESIGN.md amendment pending via /impeccable document). Do not flag as font-rule violation.
- **Expressive Code frames inside article previews** (`nested-cards` detector hits on `figure.frame` in `.article-preview`): intentional — functional code-block chrome from the documented syntax-highlighting system, not decorative card nesting. Confirmed 2026-07-17. Do not re-report.
- **Masthead taglines are wit-only, no positioning line** (`Header.astro` rotating tagline): intentional, confirmed 2026-07-18 — the unattributed rotating quotes ARE the brand voice; the "a programmer's home on the web" positioning line intentionally lives only in `<title>`/meta. Do not flag missing orientation/introduction copy in the masthead or above the stream.
