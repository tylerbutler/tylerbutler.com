---
name: tylerbutler.com
description: A programmer's home on the web — retro-sci-fi warmth around long-form reading
colors:
  deep-space-hull: "#1a2332"
  cloud-light-white: "#faf8f6"
  burnt-atmosphere: "#96591c"
  atmosphere-bright: "#b8722a"
  atmosphere-ember: "#7d4b17"
  atmosphere-deep: "#a3621f"
  horizon-flare: "#d4842a"
  golden-horizon: "#e6b35c"
  nebula-teal: "#2a4a47"
  nebula-teal-light: "#4a6662"
  starfield-gold: "#d4af37"
  cabin-light: "#f7f5f2"
  cloud-shadow: "#f0ede8"
  deep-space-void: "#0f1419"
  cabin-paper: "#e8e4de"
  cabin-paper-dim: "#c9c4bc"
  instrument-green: "#4a7c59"
  instrument-blue: "#4a6b8a"
  instrument-red: "#b85a4a"
  instrument-violet: "#8b5a9d"
typography:
  display:
    fontFamily: "Idlewild SSm, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(17px, 4.4vw, 36px)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "0.05em"
  running-head:
    fontFamily: "Idlewild SSm, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(16px, 3.5vw, 24px)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "0.05em"
  tagline:
    fontFamily: "adelle, Baskerville, Georgia, serif"
    fontSize: "clamp(13px, 2.2vw, 16px)"
    fontWeight: 400
    fontStyle: "italic"
    lineHeight: 1.4
    letterSpacing: "0.02em"
  headline:
    fontFamily: "adelle, Baskerville, Georgia, serif"
    fontSize: "clamp(32px, 5vw, 42px)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "1.2px"
  title:
    fontFamily: "adelle, Baskerville, Georgia, serif"
    fontSize: "clamp(28px, 4.5vw, 36px)"
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: "1px"
  body:
    fontFamily: "adelle, Baskerville, Georgia, serif"
    fontSize: "clamp(15px, 2.5vw, 16px)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Lato, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
  code:
    fontFamily: "PragmataPro, JetBrains Mono, mono"
    fontSize: "16px"
    fontWeight: 400
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "8px"
spacing:
  flow: "1em"
  para: "1.25em"
  block: "1.5em"
components:
  button-kudos:
    backgroundColor: "{colors.cloud-shadow}"
    textColor: "{colors.nebula-teal}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  button-kudos-hover:
    backgroundColor: "{colors.burnt-atmosphere}"
    textColor: "#ffffff"
  nav-link:
    textColor: "{colors.cabin-light}"
    typography: "{typography.label}"
    padding: "8px 4px"
  nav-link-hover:
    textColor: "{colors.horizon-flare}"
  code-inline:
    backgroundColor: "{colors.cloud-shadow}"
    textColor: "{colors.burnt-atmosphere}"
    rounded: "{rounded.sm}"
    padding: "0.2em 0.4em"
---

# Design System: tylerbutler.com

## 1. Overview

**Creative North Star: "The Golden Age Paperback"**

The site is a 1970s science-fiction paperback cover you can read: a painted sky fixed behind everything, golden titling set in Idlewild SSm across a deep blue-gray masthead, and a warm white page of serif type floating in front of it. The scene is literal — a full-viewport spacecraft-sunset backdrop sits behind the site container, and on mobile it becomes a painted sunset gradient. Wonder is carried by the frame (masthead, constellations, gold accents); the page itself stays calm and bookish so long-form reading always comes first.

The register is brand, but the surface is a reading surface. Density is low: one centered column clamped to a book-like measure, generous flow spacing, article dividers drawn as animated constellations instead of rules. Personality arrives in small, deliberate delights — a kudos button whose 🚀 actually launches, a webring, footnotes — never in loud gestures. Per PRODUCT.md, this explicitly rejects SaaS landing-page grammar and the interchangeable Inter-on-white dev-blog template.

**Key Characteristics:**
- A literal painted-sky scene: fixed backdrop → glowing site container → dark masthead → light page
- Serif-first typography (Adelle for reading and the submast) with Idlewild SSm Light for the masthead, constellation nameplates, and social-preview site label, and Lato for navigation and UI labels
- Golden-hour palette: burnt orange and golden yellow warmth against deep space blue
- Class-toggled light/dark themes; dark mode swaps burnt orange for starfield gold
- Small delights over big motion: link underlines that fade on hover, launching rockets, constellation dividers

## 2. Colors

A golden-hour cover palette: warm metallic accents burning against deep blue-gray, over a quiet warm white page.

### Primary
- **Burnt Atmosphere** (#96591c): the working accent — links, inline code text, focus outlines, table header rules. Deepened to hold WCAG AA at body size: 5.3:1 on the page, 4.8:1 on Cloud Shadow. In dark mode its role passes to **Starfield Gold** (#d4af37). **Atmosphere Ember** (#7d4b17) is the hover state — links darken on hover on light surfaces. **Atmosphere Bright** (#b8722a) is the original brighter shade, kept for warning alerts and decorative borders where only 3:1 applies. **Horizon Flare** (#d4842a) is the bright hover reserved for dark masthead surfaces (nav links, social icons).
- **Golden Horizon** (#e6b35c): the masthead color — site title, tagline, and wayfinding state within the masthead (active nav link, focus rings on masthead controls, 8.2:1 on the hull). It never appears inside the reading column.

### Neutral
- **Deep Space Hull** (#1a2332): masthead background and dark-mode container; the structural dark of the scene.
- **Cloud-Light White** (#faf8f6): the page. A softly warmed white; in dark mode the page becomes **Deep Space Void** (#0f1419).
- **Nebula Teal** (#2a4a47): body text — a deep teal-gray, not black. **Nebula Teal Light** (#4a6662) for secondary text and metadata.
- **Cabin Paper** (#e8e4de): dark-mode body text — a warmed light gray (14.6:1 on Deep Space Void), so the dark cabin reads as the same paperback, never a cold gray terminal. **Cabin Paper Dim** (#c9c4bc) for dark-mode secondary text (10.7:1 on the void, 9.1:1 on the hull).
- **Cabin Light** (#f7f5f2): navigation links on the dark masthead.
- **Cloud Shadow** (#f0ede8): raised paper — inline code, blockquotes, alert and button fills.

### Tertiary
- Instrument colors for alerts and statuses, always muted to sit with the palette: **Instrument Green** (#4a7c59, tip/success), **Instrument Blue** (#4a6b8a, note/info), **Horizon Flare** (#d4842a, warning), **Instrument Red** (#b85a4a, caution/error), **Instrument Violet** (#8b5a9d, important). Alert fills are `color-mix` tints of the instrument color into the page background (10% light, 15% dark).

### Named Rules
**The Titling Foil Rule.** Golden Horizon belongs to the masthead alone — titling, and the masthead's own wayfinding states (active nav, focus rings on its controls). If gold is appearing inside the reading column in light mode, it's the wrong accent — use Burnt Atmosphere.

**The Two Suns Rule.** Light mode's sun is deep burnt orange (#96591c); dark mode's is starfield gold (#d4af37). Every accent role swaps with the theme; both themes must independently hold WCAG AA contrast — 4.5:1 at body size, verified against the surface the text actually sits on (page, Cloud Shadow, or hull).

## 3. Typography

**Display Font:** Idlewild SSm Light (with Helvetica Neue, Arial fallback), loaded from the dynamic font subset service at weight 300 with `font-display: swap`
**Body Font:** adelle (with Baskerville, Georgia fallback) — Typekit-loaded
**Label Font:** Lato Regular, weight 400 (with Helvetica Neue, Arial fallback); shared through `--label-font`. Lato Bold (700) supplies alert titles.
**Code Font:** PragmataPro (with JetBrains Mono fallback)

**Character:** Adelle supplies the article headings, body text, and italic sentence-case tagline. Idlewild SSm Light provides uppercase masthead titling with normal pair kerning and 0.05em tracking. Constellation nameplates use uppercase Idlewild SSm Light at a fixed 9px on a transparent background. Social previews use Idlewild SSm Light for the site label, Lato Bold for metadata, and Adelle Bold and Italic for titles and subtitles. Lato Regular supplies navigation and UI labels, with 0.04em tracking for short uppercase labels. Long search excerpts remain Adelle.

### Hierarchy
- **Display** (300, clamp(17px, 4.4vw, 36px), lh 1.2, uppercase, normal kerning, tracking 0.05em): the homepage site title.
- **Running head** (300, clamp(16px, 3.5vw, 24px), lh 1.2, uppercase, normal kerning, tracking 0.05em): the site title on interior pages.
- **Tagline** (Adelle 400 italic, clamp(13px, 2.2vw, 16px), lh 1.4, sentence case, tracking 0.02em): the rotating line beneath the homepage site title.
- **Headline / h1** (300, clamp(32px, 5vw, 42px), lh 1.2, +1.2px tracking): page and article titles.
- **Title / h2–h3** (300, clamp(28px, 4.5vw, 36px) and clamp(24px, 4vw, 28px), lh 1.2): section headings; h4–h6 step down 24/20/18px at weight 400.
- **Body** (400, clamp(15px, 2.5vw, 16px), lh 1.6): article prose; the page container is clamped to `clamp(636px, 90vw, 763px)`, while homepage stream prose is capped at `70ch`. Tables and code frames may use the wider container when their content requires it.
- **Label** (Lato Regular 400, 12–14px, tracking 0.04em, uppercase): navigation and metadata. Alert titles use Bold (700).
- **Code** (PragmataPro, 16px block / 14px inline, ligatures on): inline code is tinted Burnt Atmosphere on Cloud Shadow.

### Named Rules
**The Masthead Rule.** Use Idlewild SSm Light for the masthead wordmark, constellation nameplates, and social-preview site label. Use Lato Regular for navigation and UI labels. Keep article prose, headings, and the rotating tagline in Adelle.

**The One Voice Rule.** Everything readable is Adelle. Contrast comes from size and weight (100→300→400→600), never from introducing another text face.

## 4. Elevation

Depth is primarily scenography, not shadow: the fixed painted backdrop sits behind everything, the site container floats in front of it with a soft ambient glow (`box-shadow: 0 0 20px rgba(26, 35, 50, 0.15)`), and the dark masthead caps the light page. Within the page, surfaces are mostly flat, with raised-paper tints (Cloud Shadow) marking blocks like code and quotes. Structural shadows are permitted on interactive and elevated elements — wide-screen code blocks lift with `0 4px 12px rgba(0,0,0,0.15)`, tags rise 1px on hover with a soft `0 2px 4px` shadow — and this is a sanctioned direction to extend: interactive elements may earn lift as a state response.

### Shadow Vocabulary
- **Ambient container glow** (`box-shadow: 0 0 20px var(--overlay)`): the site container against the backdrop. One per page.
- **Structural lift** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`): elevated functional blocks (wide-screen code frames) and, going forward, interactive elements that need affordance.
- **Hover lift** (`translateY(-1px)` + `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)`): small controls like tags responding to the cursor.

### Named Rules
**The Painted Depth Rule.** The scene provides the depth (backdrop → container → masthead → page); shadows respond to state and function, never decorate at rest.

## 5. Components

Quiet instruments, small delights: controls are understated and bookish, then occasionally reward attention with a playful moment.

### Buttons (Kudos)
- **Shape:** gently rounded (4px)
- **Default:** italic Adelle on Cloud Shadow (#f0ede8), 1px Nebula Teal Light border, 4px 10px padding, led by a 🚀 glyph
- **Hover / Focus:** fills Burnt Atmosphere with white text; focus gets the global 2px accent outline, offset 2px
- **Delight:** on click the rocket launches — a 750ms ease-in-out flight off the corner and back; suppressed under `prefers-reduced-motion`

### Links
- **Style:** Burnt Atmosphere with a native underline (0.08em thickness, 0.2em offset) that follows wrapped lines
- **Hover:** the underline fades out (text-decoration-color → transparent over 0.3s) while the color deepens to Atmosphere Ember
- **Focus:** 2px solid accent outline, 2px offset, 2px radius — the universal focus treatment
- **Broken links:** dimmed to Nebula Teal Light at 60% opacity with a help cursor
- **Stream title links** (homepage article titles): body-ink text with no resting underline; hover moves the title to the accent. The heading scale and pointer/focus states provide the affordance without adding rules beneath wrapped titles.
- **Heading self-anchors:** never underlined. The underline is spent only on links that go somewhere; heading anchors reveal a `#` glyph in the accent on hover/focus instead, and the `:target` heading gets a 10% accent wash (15% in dark)

### Cards / Containers (Blockquotes & Alerts)
- **Corner Style:** flat left edge, 4px rounded right corners (0 4px 4px 0)
- **Background:** Cloud Shadow for quotes; alerts tint 10% of their instrument color into the page background (15% into Deep Space Hull in dark mode)
- **Border:** 4px solid left border in the instrument color (the one sanctioned thick left-border pattern — a GitHub-alert convention, kept for reader familiarity)
- **Alert titles:** Lato Bold uppercase labels (14–15px, +0.5px tracking) in the instrument color, with octicon

### Inputs
No styled input system exists yet (search is delegated to Pagefind UI). When one is needed, follow the instrument philosophy: Cloud Shadow fills, 1px quiet borders, the universal 2px accent focus outline.

### Navigation
- **Style:** Lato Regular uppercase labels (12px, tracking 0.04em) in Cabin Light on the Deep Space Hull masthead; centered row with 20px gaps
- **Hover / Active:** color shifts to Horizon Flare over 0.2s
- **Wide screens (≥1200px):** the nav detaches into a left sidebar column extending the masthead's dark block
- **Mobile:** 12px labels wrap across centered rows when narrow. Desktop sidebar labels use 10–11px with less horizontal padding to keep each word intact. Preserve touch padding rather than forcing one row.
- **Subscribe chip:** the feed link in the masthead's social row is the one conversion among identity icons, so it alone carries a visible word — a quiet chip (icon + "Subscribe" in Lato Regular caps) edged in 55% Golden Horizon. This is masthead wayfinding, inside the Titling Foil Rule
- **Interior running head:** the homepage alone uses the full cover masthead. Interior pages keep the Idlewild SSm wordmark, navigation, utilities, and Subscribe chip in a shorter masthead; the rotating tagline and identity-icon row remain cover-only. The homepage title sits below the corner controls; compact titles do likewise on narrow screens so touch targets do not overlap the lettering.

### Editorial Indexes
- **Homepage current issue:** a quiet Cloud Shadow contents strip appears before the full-post stream, with unadorned article-title links in a numbered list and an archive link outside the numbered group. Article titles move to the accent on hover or when active. At ≥1200px it becomes a sticky rail with one role at a time: it starts as the issue picker, switches to the active article's section links after the reader enters the article, and provides a visible control to switch modes. It is editorial wayfinding, not a card grid.
- **Archive navigation:** years remain directly addressable but are grouped by decade with visible article counts, reducing the choice burden without hiding publishing history.

### Action Chips (Read More / Permalink)
- **Style:** italic Adelle at label size on Cloud Shadow with a 1px Nebula Teal Light border, 4px 10px padding, 4px radius — the kudos-button register, minus the rocket
- **Hover:** fills the accent with page-white text
- **Every stream preview ends with one:** "Read More →" when truncated, "Permalink →" when the article runs in full — the reader always gets a link at the point of maximum engagement
- **Homepage stream coda:** the stream ends with paired "Browse the Archive →" and "Subscribe via RSS" chips, giving the reader both a next read and a way to return.
- **Touch (coarse pointers):** chip padding grows to a ≥40px hit area (12px 16px; kudos 10px 14px) and the action-row gap widens to 1.25em

### Tables
- **Default:** tables use the full available reading container, with compact Adelle text, quiet cell borders, and an accent rule beneath the header.
- **Mobile (≤768px):** a table becomes its own horizontal scroll region with `max-width: 100%`; wide columns may scroll, but the table must never widen the document viewport.

### Code Frames (Expressive Code)
- **Always dark:** code frames keep their instrument-panel chrome in both themes (frame chrome #1f2328, borders #30363d, titles #e6e8eb, inactive tabs #7d8590, active tab wells #0d1117) — a lit terminal in the spacecraft cabin, deliberately unswayed by the page theme. These hexes are sanctioned utility values, not palette drift
- **Touch overflow:** on coarse pointers, horizontally scrollable code gets edge scroll-shadows (16px black-fade, hidden at the reached edge via local-attachment covers) so clipped code never masquerades as complete

### Constellation Dividers (Signature)
Between homepage article previews, a 64px animated Lottie constellation replaces the horizontal rule — each article is deterministically assigned a constellation by content hash, no duplicates on screen. Nameplates use Idlewild SSm Light at weight 300 and a fixed 9px, with a transparent background; on mobile they center over the icon and wrap when needed to stay within the viewport. Prose `<hr>` renders as a centered `###` in serif — a typewriter-manuscript wink. These are the site's fingerprint; protect them.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page container at `clamp(636px, 90vw, 763px)` and prose within 45–75 characters per line; the homepage stream uses `70ch`.
- **Do** route all light-mode accents through Burnt Atmosphere (#96591c) and all dark-mode accents through Starfield Gold (#d4af37); verify AA contrast in both themes independently (the CI runs pa11y WCAG2AA).
- **Do** spend underlines only on links that navigate; heading self-anchors stay bare and earn a `#` glyph on hover/focus instead.
- **Do** give touch controls a ≥40px hit area on coarse pointers — grow padding, not font size, and never shrink a label to dodge a wrap.
- **Do** use Idlewild SSm Light for the masthead wordmark, constellation nameplates, and social-preview site label. Use Lato Regular for navigation and UI labels; use italic Adelle for the rotating tagline. Reserve Golden Horizon for masthead titling and wayfinding.
- **Do** add small delights in the kudos-rocket register: brief (≤750ms), physical, suppressed under `prefers-reduced-motion`.
- **Do** let depth come from the painted scene; shadows respond to hover, focus, or elevation state.
- **Do** use `color-mix` tints of instrument colors for any new status surface, matching the alert formula.

### Don't:
- **Don't** import SaaS landing-page grammar — hero metrics, identical card grids, gradient CTAs (PRODUCT.md anti-reference, verbatim).
- **Don't** drift toward the minimal dev-blog template — Inter-on-white, personality-free (PRODUCT.md anti-reference, verbatim).
- **Don't** introduce a second text face; if a passage needs emphasis, use Adelle's weight and size range.
- **Don't** use gradient text, glassmorphism, or decorative blurs — the backdrop is the only atmospheric layer.
- **Don't** spend Golden Horizon inside the reading column in light mode; it fails contrast on Cloud-Light White and dilutes the masthead.
- **Don't** add new thick colored left-borders beyond the established blockquote/alert convention; that pattern is grandfathered, not generative.
- **Don't** replace the constellation dividers or the `###` hr with plain rules — they are the site's fingerprint.
- **Don't** use cold neutral grays anywhere — dark mode's text is warmed Cabin Paper (#e8e4de / #c9c4bc); if a gray has no warmth, it isn't in the palette.
