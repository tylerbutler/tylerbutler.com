#!/usr/bin/env python3
"""
Convert an MP4 animation to an optimized animated SVG.

Pipeline:
  1. Extract frames from MP4 at target FPS (ffmpeg)
  2. Vectorize each frame against white background (vtracer)
  3. Strip white-fill paths from each SVG frame (transparent background)
  4. Assemble into a single SVG with CSS frame cycling
  5. Optimize with SVGO (removeHiddenElems disabled)

Requirements:
  ffmpeg, vtracer, svgo (npm -g), python3

Usage:
  python3 scripts/mp4-to-svg.py public/vids/astronaut.mp4 public/vids/astronaut-animated.svg
  python3 scripts/mp4-to-svg.py input.mp4 out.svg --fps 24 --speckle 8
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


# SVGO config lives alongside this script; fall back to a temp file if missing.
SVGO_CONFIG_PATH = Path(__file__).parent / "svgo-animated.config.cjs"


def check_deps():
    missing = [cmd for cmd in ("ffmpeg", "vtracer", "svgo") if not shutil.which(cmd)]
    if missing:
        sys.exit(f"Missing required tools: {', '.join(missing)}\n"
                 "Install: ffmpeg (system), vtracer (cargo install vtracer), svgo (npm -g svgo)")


def extract_frames(mp4: Path, frames_dir: Path, fps: int) -> int:
    frames_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-i", str(mp4), "-vf", f"fps={fps}",
         str(frames_dir / "frame_%04d.png"), "-y"],
        check=True,
        capture_output=True,
    )
    return len(list(frames_dir.glob("frame_*.png")))



def vectorize_frames(frames_dir: Path, svgs_dir: Path, speckle: int, color_precision: int):
    svgs_dir.mkdir(parents=True, exist_ok=True)
    pngs = sorted(frames_dir.glob("frame_*.png"))
    for i, png in enumerate(pngs):
        svg_out = svgs_dir / png.with_suffix(".svg").name
        subprocess.run(
            ["vtracer",
             "--input", str(png),
             "--output", str(svg_out),
             "--colormode", "color",
             "--filter_speckle", str(speckle),
             "--color_precision", str(color_precision)],
            check=True,
            capture_output=True,
        )
        print(f"  vectorized {i+1}/{len(pngs)}: {png.name}", end="\r", flush=True)
    print()


def extract_inner(svg_path: Path) -> str:
    content = svg_path.read_text()
    content = re.sub(r"<\?xml[^?]*\?>", "", content)
    content = re.sub(r"<!DOCTYPE[^>]*>", "", content)
    m = re.search(r"<svg[^>]*>(.*)</svg>", content, re.DOTALL)
    return m.group(1).strip() if m else content


def strip_white_paths(content: str) -> str:
    """Remove near-white filled paths (background rectangles from vtracer)."""
    return re.sub(r'<path\s+fill="#(?:fff(?:fff)?|fefefe|fdfdfd)"[^/]*/>', "", content)


def assemble_svg(svgs_dir: Path, fps: int, out_path: Path):
    frames = sorted(svgs_dir.glob("frame_*.svg"))
    n = len(frames)
    duration = n / fps
    pct = 100.0 / n  # % of total duration each frame is visible

    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">')

    # Only @keyframes lives in <style> — all other animation props are inlined
    # on each element so SVGO's inlineStyles plugin can't strip them.
    # prefers-reduced-motion handled here instead of via JS.
    lines.append(f"""<style>
@keyframes sf {{
  0% {{ opacity: 1; animation-timing-function: step-end; }}
  {pct:.4f}% {{ opacity: 0; }}
  100% {{ opacity: 0; }}
}}
@media (prefers-reduced-motion: reduce) {{
  [data-frame] {{ animation: none !important; }}
  [data-frame="0"] {{ opacity: 1 !important; }}
}}
</style>""")

    for i, frame in enumerate(frames):
        inner = strip_white_paths(extract_inner(frame))
        delay = -(duration - i * duration / n)
        # All animation props inlined: SVGO cannot strip them.
        # opacity:0 initial state keeps frames hidden until the animation
        # takes over; removeHiddenElems is disabled in svgo config so
        # SVGO won't remove these elements.
        style = (
            f"opacity:0;"
            f"animation:sf {duration:.4f}s linear infinite;"
            f"animation-delay:{delay:.4f}s"
        )
        lines.append(f'<g data-frame="{i}" style="{style}">{inner}</g>')

    lines.append("</svg>")

    out_path.write_text("\n".join(lines))


def optimize_svg(svg_path: Path) -> int:
    result = subprocess.run(
        ["svgo", str(svg_path), "-o", str(svg_path), "--config", str(SVGO_CONFIG_PATH)],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        print(f"  SVGO warning: {result.stderr.strip()}")
    return svg_path.stat().st_size


def main():
    parser = argparse.ArgumentParser(
        description="Convert MP4 animation to optimized animated SVG",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("input", type=Path, help="Input MP4 file")
    parser.add_argument("output", type=Path, help="Output SVG file")
    parser.add_argument("--fps", type=int, default=24,
                        help="Frames per second to extract (default: 24)")
    parser.add_argument("--speckle", type=int, default=8,
                        help="vtracer filter_speckle — higher removes more noise (default: 8)")
    parser.add_argument("--color-precision", type=int, default=6,
                        help="vtracer color_precision (default: 6)")
    parser.add_argument("--no-optimize", action="store_true",
                        help="Skip SVGO optimization step")
    parser.add_argument("--keep-temp", action="store_true",
                        help="Keep temporary frame files for inspection")
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"Input file not found: {args.input}")

    check_deps()

    with tempfile.TemporaryDirectory(prefix="mp4-to-svg-") as tmp:
        tmp_path = Path(tmp)
        frames_dir = tmp_path / "frames"
        svgs_dir = tmp_path / "svgs"

        if args.keep_temp:
            stem = args.input.stem
            frames_dir = Path(f"/tmp/{stem}-frames")
            svgs_dir = Path(f"/tmp/{stem}-svgs")

        print(f"[1/4] Extracting frames at {args.fps}fps...")
        n_frames = extract_frames(args.input, frames_dir, args.fps)
        duration = n_frames / args.fps
        print(f"      {n_frames} frames ({duration:.1f}s)")

        print(f"[2/4] Vectorizing with vtracer (speckle={args.speckle}, precision={args.color_precision})...")
        vectorize_frames(frames_dir, svgs_dir, args.speckle, args.color_precision)
        raw_kb = sum(f.stat().st_size for f in svgs_dir.glob("*.svg")) // 1024
        print(f"      raw SVG frames: {raw_kb}k")

        print("[3/4] Assembling animated SVG...")
        assemble_svg(svgs_dir, args.fps, args.output)
        assembled_kb = args.output.stat().st_size // 1024
        print(f"      assembled: {assembled_kb}k")

        if not args.no_optimize:
            print("[4/4] Optimizing with SVGO...")
            if not SVGO_CONFIG_PATH.exists():
                sys.exit(f"SVGO config not found: {SVGO_CONFIG_PATH}")
            final_bytes = optimize_svg(args.output)
            final_kb = final_bytes // 1024
            saved_pct = round((1 - final_bytes / (assembled_kb * 1024)) * 100)
            print(f"      optimized: {final_kb}k (saved ~{saved_pct}%)")
        else:
            final_kb = assembled_kb
            print("[4/4] Skipping SVGO (--no-optimize)")

        # MP4 size for comparison
        mp4_kb = args.input.stat().st_size // 1024
        ratio = round(final_kb / mp4_kb, 1)
        print(f"\nDone: {args.output} ({final_kb}k vs {mp4_kb}k MP4 = {ratio}×)")


if __name__ == "__main__":
    main()
