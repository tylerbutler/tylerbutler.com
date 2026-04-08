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

### Using the output in HTML

CSS animations inside SVG files only work when loaded via `<object>` (not `<img>`). To also handle light/dark mode blending, wrap it the same way as `AnimatedIcon.astro`:

```html
<!-- Light mode: multiply blend removes white background -->
<!-- Dark mode: screen blend + invert(1) keeps icon visible -->
<span class="svg-wrapper">
  <object class="svg-icon" type="image/svg+xml"
    data="/vids/astronaut-animated.svg"
    width="128" height="128" aria-label="Astronaut animation">
  </object>
</span>

<style>
  .svg-wrapper {
    display: inline-block;
    mix-blend-mode: multiply;
  }
  .svg-icon { display: block; }

  :global(.dark) .svg-wrapper { mix-blend-mode: screen; }
  :global(.dark) .svg-icon { filter: invert(1); }
</style>
```

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
