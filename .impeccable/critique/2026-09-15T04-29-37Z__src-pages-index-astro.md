---
target: website
total_score: 21
max_score: 32
na_heuristics: 5,10
p0_count: 0
p1_count: 3
timestamp: 2026-09-15T04-29-37Z
slug: src-pages-index-astro
---
Method: dual-agent (A: 065dc24d-112a-4c0c-9a56-906f2dda3bd5 · B: ca891f3a-358e-420f-b5d7-805ee5f4d242)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Active states and search counts are clear, but the very long homepage gives no progress or position cue. |
| 2 | Match System / Real World | 4/4 | The paperback-cover metaphor, dates, labels, and reading model are coherent and familiar. |
| 3 | User Control and Freedom | 2/4 | The archive exit is available only after the full homepage stream; search has no visible close control. |
| 4 | Consistency and Standards | 3/4 | The visual grammar is consistent, but `headerSize="small"` has no effect because the size is not applied to the header class. |
| 5 | Error Prevention | n/a | This reading surface has no consequential or destructive workflow. |
| 6 | Recognition Rather Than Recall | 2/4 | Search results repeatedly use “Tyler Butler” instead of the content title. |
| 7 | Flexibility and Efficiency | 3/4 | Search, keyboard access, feeds, anchors, and article navigation help repeat visitors; homepage browsing remains inefficient. |
| 8 | Aesthetic and Minimalist Design | 2/4 | The aesthetic is excellent, but the full masthead and extreme homepage length compete with content access. |
| 9 | Error Recovery | 2/4 | Search reports status, but misleading result names make poor results difficult to diagnose and recover from. |
| 10 | Help and Documentation | n/a | The core reading interface should not require documentation. |
| **Total** | | **21/32** | **Strong identity; substantial discoverability and accessibility friction** |

## Design Specificity Verdict

**High visual specificity; medium structural specificity.**

The site is unmistakably authored for Tyler Butler. The painted spacecraft scene, Westgate masthead, Adelle reading voice, golden-hour palette, constellation dividers, and rocket details form a coherent world that could not be transferred unchanged to a generic developer blog. It feels owned rather than themed.

The weaker layer is information architecture. Beneath the exceptional frame, the homepage is five articles concatenated into an enormous stream, the archive starts with 17 equal-weight year choices, and search results obscure the titles of the work. The visual system says “Golden Age paperback”; parts of the navigation still behave like an unrefined content dump.

**Deterministic scan:** The source scan of `src/pages/index.astro` returned zero findings. Browser scans returned 48 homepage findings, 24 article findings, 2 each on Notes and Projects, and 5 programmatic findings on Search. These were almost entirely false positives: syntax-token palette warnings, sanctioned Expressive Code frames, the intentional rotating uppercase tagline, sanctioned Lato labels, and a hidden Pagefind dialog. The detector did not expose an additional actionable design-system violation.

**Visual overlays:** Mutable browser injection succeeded and the overlays rendered during inspection on the homepage, an article, Notes, Projects, and Search. The live detector server was stopped after evidence collection.

## Overall Impression

This is a memorable, readable personal site with a real point of view. The largest opportunity is not a visual redesign; it is making the archive’s depth easier to navigate without weakening the paperback atmosphere.

## What’s Working

1. **The visual world is genuinely authored.** The painted scene, dark masthead, foil-like title, warm page, and wide-screen spine navigation directly fulfill “a programmer’s home on the web.”
2. **Long-form typography is disciplined.** The book-like measure, Adelle body text, generous line height, clear headline scale, and warm dark mode support sustained technical reading.
3. **Personality arrives through controlled detail.** Constellation dividers, kudos, feed affordances, project illustrations, and small pieces of microcopy add warmth without overwhelming the work.

## Priority Issues

### [P1] Article heading names are broken for assistive technology

**What:** Internal article headings are wrapped in links whose `aria-label` is always “Link to this heading,” replacing the heading text as the accessible name.

**Why it matters:** Screen-reader users navigate long articles by heading. The current outline becomes a series of identical labels and directly damages the primary reading experience.

**Fix:** Preserve the heading text as the accessible name. Add a separately labelled permalink affordance, or remove the wrapper’s overriding `aria-label` and hide only the decorative hash.

**Suggested command:** `/impeccable audit`

### [P1] Search results conceal the identity of the work

**What:** Representative searches returned result links named “Tyler Butler” instead of article or project titles, with aggregate pages duplicating child content.

**Why it matters:** Search is the recovery mechanism for a deep archive. Readers must infer each result from its excerpt and URL, making known-item retrieval slow and unreliable.

**Fix:** Use the masthead title as the page `<h1>` only on the homepage, provide explicit Pagefind title metadata for content pages, and exclude aggregate stream duplicates where appropriate.

**Suggested command:** `/impeccable harden`

### [P1] The intentionally full-length homepage has no usable map

**What:** Five full article bodies create a page about 19,700px tall on desktop and 33,400px on mobile. “View All Articles” appears only at the end.

**Why it matters:** The interface chooses the first article for the visitor instead of helping them choose what to read. The constellation pauses add atmosphere but not orientation.

**Fix:** Keep the classic full-post stream, but add a quiet “Current issue” contents strip near the beginning with the five article titles and an early “All articles” link. Preserve the linear reading experience.

**Suggested command:** `/impeccable layout`

### [P2] The intended compact masthead does not exist

**What:** Pages request `headerSize="small"`, but `Header.astro` reads the value without applying a size class. Every surface receives the full cover treatment.

**Why it matters:** Repeating the complete cover weakens its impact and delays local content, especially for direct article and search arrivals.

**Fix:** Wire the size prop to the header class and define a compact running-head variant that preserves the Westgate signature and essential controls.

**Suggested command:** `/impeccable distill`

### [P2] Archive chronology is comprehensive but poorly prioritized

**What:** The Articles page opens with 17 same-weight year links before a long chronological list.

**Why it matters:** Returning readers face a large undifferentiated choice set. Sparse and dense years receive equal prominence and weak information scent.

**Fix:** Add counts and group years into compact eras or decades while preserving direct year anchors.

**Suggested command:** `/impeccable clarify`

## Persona Red Flags

**Search-led technical reader:** A reader looking for a remembered Gleam article sees repeated “Tyler Butler” result names and aggregate duplicates. They must parse excerpts and URLs, then pass the full masthead before reaching the article.

**Screen-reader technical reader:** The page has the masthead `<h1>` plus the article `<h1>`, then repeated internal headings named “Link to this heading.” The article outline cannot support efficient heading navigation.

**Returning RSS/IndieWeb reader:** The main Subscribe chip is easy to find, but the visible control always points to the main feed even though Notes has dedicated feeds. Browsing recent work means traversing the long homepage or choosing among 17 years.

## Minor Observations

- The search modal fits the palette but has no visible close button; “esc clear” is desktop-centric and ambiguous.
- Wide-screen navigation CSS permits clipping and ellipsis, contrary to the design-system rule that labels should wrap rather than clip.
- About is warm in copy but visually skeletal and ends abruptly; one personal artifact could carry more humanity than more biography.
- Project badges and three equal-weight actions compete with project titles and one-sentence purpose.
- Notes are calm and readable, but raw imported URLs can dominate cards.
- Light and dark themes both retain strong warmth and contrast; dark mode successfully avoids generic terminal styling.

## Questions to Consider

- Is the homepage a front page to choose from, or a complete magazine issue to read linearly?
- What would article pages feel like if the full masthead were a cover seen once, then reduced to a running head?
- If every search result says “Tyler Butler,” is search indexing the author or the work?
- Could archive eras express Tyler’s development better than 17 equal year choices?
- Can constellation language become subtle wayfinding without turning into decorative navigation theater?
