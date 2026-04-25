# scripts/

Utility scripts for site maintenance and asset generation.

| Script | Purpose |
|--------|---------|
| `mp4-to-svg.py` | Convert MP4 animations to optimized animated SVGs |
| `download-fonts.ts` | Download web fonts for self-hosting |
| `optimize-fonts.ts` | Subset and optimize downloaded fonts |
| `get-all-urls.ts` | Crawl the site and collect all URLs |
| `extract-urls.sh` | Extract URLs from a sitemap or HTML file |
| `extract-broken-urls.ts` | Identify broken links from a URL list |
| `web-vitals-test.ts` | Run Lighthouse / Web Vitals checks |

---

## mp4-to-svg.py

Converts an MP4 animation into a single optimized animated SVG file. Useful for icons and decorative animations where you want a vector format that scales cleanly at any size.

### Pipeline

```
MP4  →  ffmpeg (frames)  →  vtracer (SVGs)  →  assemble  →  SVGO  →  animated SVG
```

1. **ffmpeg** extracts PNG frames at the target FPS
2. **vtracer** vectorizes each frame (flat-color tracing, no rasterized embeds)
3. A Python assembler wraps all frames in a single SVG with JavaScript frame cycling
4. **SVGO** compresses path data (~44% reduction)

The output SVG uses a small inline `<script>` that cycles frames with `setInterval`, and respects `prefers-reduced-motion` by freezing on the first frame.

### Requirements

```bash
# System
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian

# Rust
cargo install vtracer

# Node
npm install -g svgo
```

### Usage

```bash
# Basic — 24fps, speckle filter 8 (defaults)
python3 scripts/mp4-to-svg.py public/vids/astronaut.mp4 public/vids/astronaut-animated.svg

# Custom FPS and noise threshold
python3 scripts/mp4-to-svg.py input.mp4 out.svg --fps 12 --speckle 4

# Skip SVGO (faster, larger output)
python3 scripts/mp4-to-svg.py input.mp4 out.svg --no-optimize

# Keep temporary frame files in /tmp for inspection
python3 scripts/mp4-to-svg.py input.mp4 out.svg --keep-temp
```

### Examples

```
$ python3 scripts/mp4-to-svg.py public/vids/astronaut.mp4 public/vids/astronaut-animated.svg
[1/4] Extracting frames at 24fps...
      72 frames (3.0s)
[2/4] Vectorizing with vtracer (speckle=8, precision=6)...
      raw SVG frames: 1652k
[3/4] Assembling animated SVG...
      assembled: 1643k
[4/4] Optimizing with SVGO...
      optimized: 916k (saved ~44%)

Done: public/vids/astronaut-animated.svg (916k vs 127k MP4 = 7.2×)

$ python3 scripts/mp4-to-svg.py public/vids/rocket.mp4 public/vids/rocket-animated.svg
[1/4] Extracting frames at 24fps...
      72 frames (3.0s)
[2/4] Vectorizing with vtracer (speckle=8, precision=6)...
      raw SVG frames: 1265k
[3/4] Assembling animated SVG...
      assembled: 1256k
[4/4] Optimizing with SVGO...
      optimized: 834k (saved ~34%)

Done: public/vids/rocket-animated.svg (834k vs 92k MP4 = 9.1×)
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--fps` | `24` | Frames per second to extract from the MP4 |
| `--speckle` | `8` | vtracer `filter_speckle` — higher values remove more small noise paths |
| `--color-precision` | `6` | vtracer `color_precision` — lower values reduce unique colors and path count |
| `--no-optimize` | off | Skip the SVGO optimization step |
| `--keep-temp` | off | Write frame files to `/tmp/<name>-frames/` and `/tmp/<name>-svgs/` instead of a temp dir |

### Size tradeoffs

This pipeline works best on flat-color icon-style animations. Photorealistic or gradient-heavy content vectorizes poorly and produces very large files.

Typical results for a 3-second, 512×512 icon animation:

| Setting | Frames | SVG size | vs MP4 |
|---------|--------|----------|--------|
| 12fps, speckle=8 | 36 | ~455k | ~3.5× |
| 24fps, speckle=8 | 72 | ~917k | ~7× |
| 12fps, speckle=4 | 36 | ~712k | ~5.6× |

MP4 H.264 uses temporal compression (only encoding changes between frames) which SVG cannot match. The SVG advantage is infinite scalability and no codec dependency.

### Using the output in Astro

Use the `AnimatedSvgIcon` component (`src/components/AnimatedSvgIcon.astro`), which handles the `<object>` tag and light/dark mode blending automatically:

```astro
---
import AnimatedSvgIcon from "../components/AnimatedSvgIcon.astro";
---

<AnimatedSvgIcon name="astronaut-animated" alt="Astronaut" size={128} />
```

The `name` prop maps to `/public/vids/{name}.svg`. Size defaults to 128.

**Why `<object>` and not `<img>`:** CSS animations inside SVG files only execute when loaded via `<object>`, which gives the SVG its own document context with JS access. An `<img>` tag sandboxes the SVG and prevents scripts and CSS animations from running.

**Blend mode pattern:** The component applies `mix-blend-mode: multiply` in light mode (removes the white background) and `mix-blend-mode: screen` + `filter: invert(1)` in dark mode — the same approach as `AnimatedIcon.astro` for MP4 videos. The filter and blend mode must stay on separate elements, since `filter` creates a stacking context that breaks `mix-blend-mode` when both are on the same element.

### SVGO configuration

The script embeds this SVGO config at runtime (written to a temp file):

```js
module.exports = {
  plugins: [{
    name: 'preset-default',
    params: { overrides: { removeHiddenElems: false } },
  }],
};
```

`removeHiddenElems` must be disabled because all frame `<g>` elements start with `opacity:0` — SVGO's static analysis treats them as invisible dead nodes and removes them entirely, producing a broken 1k output.
