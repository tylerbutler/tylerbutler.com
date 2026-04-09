# Constellation Labels Design

**Date:** 2026-04-09  
**Branch:** feat/svg-animation-experiment  
**Status:** Approved

## Summary

Add Latin constellation name labels to the article-divider constellation icons on the home page. Labels use the `westgate` font at small size, float in the upper-right corner of the icon, and animate subtly while the Lottie animation is playing.

## Architecture

### New Files

**`src/lib/constellation-names.ts`**  
Exports a `Record<string, string>` mapping constellation slugs to Latin names. Covers all 27 constellation JSON files currently in `src/lottie/constellations/`.

Notable mappings:
- `crow` → `"Corvus"`
- `harp` → `"Lyra"`
- `little-bear` → `"Ursa Minor"`
- `ursa-minor` → `"Ursa Minor"` (two animations, same name — intentional)
- `berenices-hair` → `"Coma Berenices"`
- `queen-cassiopeia` → `"Cassiopeia"`
- `southern-fish` → `"Piscis Austrinus"`
- `triangulum-australe` → `"Triangulum Australe"`
- All zodiac/common names map to their Latin equivalents

**`src/components/ConstellationIcon.astro`**  
New component wrapping `LottieIcon` + the label. Accepts:
```ts
interface Props {
  src: string;    // lottie URL, passed through to LottieIcon
  slug: string;   // constellation slug, used for Latin name lookup
  size?: number;  // defaults to 64
}
```

Renders:
```html
<div class="constellation-icon">
  <LottieIcon src={src} alt={latinName} size={size} />
  <span class="constellation-label">{latinName}</span>
</div>
```

The wrapper is `position: relative`. The label is `position: absolute; top: -0.5em; right: -0.5em`.

Label styling:
- `font-family: "westgate"`
- `font-size: 10px`
- `text-transform: uppercase`
- `letter-spacing: 2px`
- `color: var(--header-accent)`

Label movement (CSS only):
- `@keyframes constellation-float`: subtle 3px vertical oscillation + slight horizontal drift, 3s infinite ease-in-out
- Applied only when `.constellation-icon:has(.lottie-icon-wrapper[data-playing="true"]) .constellation-label`

### Modified Files

**`src/components/LottieIcon.astro`**  
Add `data-playing` attribute management to the existing script. In `attachPlayOnceObserver` callbacks:
- Set `el.dataset.playing = "true"` when animation resumes/starts
- Set `el.dataset.playing = "false"` when animation pauses or stops

The `resume` callback in the observer options is the right place since it's called each time the animation starts playing.

**`src/pages/index.astro`**  
- Import `ConstellationIcon` instead of (or alongside) `LottieIcon`
- In the article divider, replace `<LottieIcon src={...} alt="" size={64} />` with `<ConstellationIcon src={...} slug={slug} size={64} />`
- Derive slug from the lottie URL: `url.split("/").pop().replace(/-[A-Za-z0-9]+\.json$/, "")` → e.g. `"aries"`

`assignIcons` is **unchanged** — it still returns `Map<string, string>` (article ID → URL). Slug derivation happens at the call site in the template.

## Data Flow

```
index.astro
  assignIcons() → Map<articleId, lottieUrl>
  lottieUrl → slug (string strip)
  slug → ConstellationIcon(src, slug)
    → LottieIcon(src, alt=latinName)   [plays animation, sets data-playing]
    → <span.constellation-label>       [floats when data-playing="true"]
    constellation-names.ts[slug]       [Latin name lookup]
```

## CSS Animation Detail

```css
@keyframes constellation-float {
  0%, 100% { transform: translate(0, 0); }
  33%       { transform: translate(1px, -3px); }
  66%       { transform: translate(-1px, -2px); }
}

.constellation-icon:has(.lottie-icon-wrapper[data-playing="true"]) .constellation-label {
  animation: constellation-float 3s ease-in-out infinite;
}
```

`prefers-reduced-motion`: the animation is skipped entirely (no label movement, label still visible).

## Accessibility

- `LottieIcon`'s `aria-label` is set to the Latin name (via the `alt` prop passed from `ConstellationIcon`)
- The `<span>` label is `aria-hidden="true"` since the name is already in the wrapper's `aria-label`
- Label movement respects `prefers-reduced-motion`

## Constraints & Non-Goals

- Labels only appear on the home page (where `ConstellationIcon` is used); `LottieIcon` remains general-purpose and unchanged in interface
- No tooltip or interactive behavior on the label
- No font loading changes — `westgate` is already declared in `src/lib/styles/base.css`
