# Constellation Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Latin constellation name labels in the `westgate` font that float upper-right of each constellation Lottie icon on the home page, with a subtle CSS animation while the icon is playing.

**Architecture:** A new `ConstellationIcon.astro` component wraps `LottieIcon` and an absolutely-positioned label. `LottieIcon` sets `data-playing="true/false"` on its wrapper, which a `:has()` CSS selector in `ConstellationIcon` uses to activate the float animation. A slug-to-Latin-name lookup table lives in `src/lib/constellation-names.ts`.

**Tech Stack:** Astro, TypeScript, CSS `@keyframes`, `lottie-web`, westgate font (already loaded)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/constellation-names.ts` | Slug → Latin name lookup |
| Modify | `src/components/LottieIcon.astro` | Set `data-playing` on wrapper during play/pause/stop |
| Create | `src/components/ConstellationIcon.astro` | Renders icon + label with float animation |
| Modify | `src/pages/index.astro` | Use `ConstellationIcon` in article dividers |

---

## Task 1: Create constellation name lookup

**Files:**
- Create: `src/lib/constellation-names.ts`

- [ ] **Step 1: Create the lookup file**

Create `src/lib/constellation-names.ts` with this exact content:

```ts
const NAMES: Record<string, string> = {
  aquarius: "Aquarius",
  aries: "Aries",
  "berenices-hair": "Coma Berenices",
  camelopardus: "Camelopardalis",
  cancer: "Cancer",
  cepheus: "Cepheus",
  crater: "Crater",
  crow: "Corvus",
  crux: "Crux",
  dolphin: "Delphinus",
  gemini: "Gemini",
  harp: "Lyra",
  leo: "Leo",
  libra: "Libra",
  "little-bear": "Ursa Minor",
  pavo: "Pavo",
  pisces: "Pisces",
  "queen-cassiopeia": "Cassiopeia",
  sagittarius: "Sagittarius",
  scorpio: "Scorpius",
  "southern-fish": "Piscis Austrinus",
  taurus: "Taurus",
  telescopium: "Telescopium",
  "triangulum-australe": "Triangulum Australe",
  "ursa-minor": "Ursa Minor",
  virgo: "Virgo",
  volans: "Volans",
};

/**
 * Returns the Latin constellation name for a slug (e.g. "berenices-hair" → "Coma Berenices").
 * Falls back to the slug itself if not found.
 */
export function getConstellationName(slug: string): string {
  return NAMES[slug] ?? slug;
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm check
```

Expected: no errors related to `constellation-names.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/constellation-names.ts
git commit -m "feat: add constellation slug-to-Latin-name lookup"
```

---

## Task 2: Add `data-playing` to LottieIcon

**Files:**
- Modify: `src/components/LottieIcon.astro`

The `attachPlayOnceObserver` call currently looks like this (around line 69):

```js
attachPlayOnceObserver(el, {
  resume: () => anim.play(),
  play: () => {}, // lottie loops automatically between passes
  pause: () => anim.pause(),
  stop: () => anim.stop(),
  get isPaused() { return anim.isPaused; },
  onPassComplete: (cb) => anim.addEventListener("loopComplete", cb),
}, playCount);
```

- [ ] **Step 1: Update the player callbacks to set `data-playing`**

Replace that block with:

```js
attachPlayOnceObserver(el, {
  resume: () => { el.dataset.playing = "true"; anim.play(); },
  play: () => {},
  pause: () => { el.dataset.playing = "false"; anim.pause(); },
  stop: () => { el.dataset.playing = "false"; anim.stop(); },
  get isPaused() { return anim.isPaused; },
  onPassComplete: (cb) => anim.addEventListener("loopComplete", cb),
}, playCount);
```

- [ ] **Step 2: Type-check and build**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/LottieIcon.astro
git commit -m "feat: set data-playing attribute on LottieIcon wrapper during playback"
```

---

## Task 3: Create ConstellationIcon component

**Files:**
- Create: `src/components/ConstellationIcon.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ConstellationIcon.astro` with this exact content:

```astro
---
import LottieIcon from "./LottieIcon.astro";
import { getConstellationName } from "../lib/constellation-names";

interface Props {
  src: string;
  slug: string;
  size?: number;
}

const { src, slug, size = 64 } = Astro.props;
const name = getConstellationName(slug);
---

<div class="constellation-icon">
  <LottieIcon src={src} alt={name} size={size} />
  <span class="constellation-label" aria-hidden="true">{name}</span>
</div>

<style>
  .constellation-icon {
    position: relative;
    display: inline-block;
  }

  .constellation-label {
    position: absolute;
    top: -0.5em;
    right: -0.5em;
    font-family: "westgate", "Trajan Pro", "Copperplate", serif;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--header-accent);
    white-space: nowrap;
    pointer-events: none;
  }

  @keyframes constellation-float {
    0%, 100% { transform: translate(0, 0); }
    33%       { transform: translate(1px, -3px); }
    66%       { transform: translate(-1px, -2px); }
  }

  .constellation-icon:has(.lottie-icon-wrapper[data-playing="true"]) .constellation-label {
    animation: constellation-float 3s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .constellation-icon:has(.lottie-icon-wrapper[data-playing="true"]) .constellation-label {
      animation: none;
    }
  }
</style>
```

- [ ] **Step 2: Type-check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ConstellationIcon.astro
git commit -m "feat: add ConstellationIcon component with westgate label and float animation"
```

---

## Task 4: Wire ConstellationIcon into the home page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the LottieIcon import with ConstellationIcon**

At the top of `src/pages/index.astro`, find:

```ts
import LottieIcon from "../components/LottieIcon.astro";
```

Replace with:

```ts
import ConstellationIcon from "../components/ConstellationIcon.astro";
```

- [ ] **Step 2: Swap the divider usage**

Find the article divider block (around line 90):

```astro
{index > 0 && (
  <li class="article-divider" aria-hidden="true">
    <LottieIcon src={iconAssignments.get(article.id)!} alt="" size={64} />
  </li>
)}
```

Replace with:

```astro
{index > 0 && (() => {
  const src = iconAssignments.get(article.id)!;
  const slug = src.split("/").pop()!.replace(/-[A-Za-z0-9]+\.json$/, "");
  return (
    <li class="article-divider" aria-hidden="true">
      <ConstellationIcon src={src} slug={slug} size={64} />
    </li>
  );
})()}
```

- [ ] **Step 3: Type-check**

```bash
pnpm check
```

Expected: no errors.

- [ ] **Step 4: Start dev server and visually verify**

```bash
pnpm dev
```

Open `http://localhost:4321` and verify:
- Each article divider shows the constellation icon with a small label in the upper-right corner
- The label uses the westgate font, is uppercase, small, and colored with `--header-accent`
- Scrolling the page into view starts the Lottie animation; the label should subtly float while it plays
- After the animation completes and idles, the label stops floating

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: use ConstellationIcon with Latin labels in home page article dividers"
```

---

## Self-Review Notes

- All 27 constellation slugs from `src/lottie/constellations/` are covered in the lookup map
- `little-bear` and `ursa-minor` both map to `"Ursa Minor"` — intentional, two animations same constellation
- `aria-hidden="true"` on the label span is correct since `LottieIcon`'s `aria-label` carries the name
- `prefers-reduced-motion` disables label animation; LottieIcon already handles reduced motion for the Lottie itself
- The IIFE pattern in the Astro template avoids declaring a `const` inside a JSX expression (which Astro's TS mode does not allow at block scope in templates)
