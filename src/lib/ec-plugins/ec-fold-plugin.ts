import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { addClassName, definePlugin } from "@expressive-code/core";

/**
 * Threshold in characters — lines longer than this trigger the fold animation.
 * Only truly overflowing lines should trigger the effect.
 */
const LONG_LINE_THRESHOLD = 120;

/**
 * Read OriDomi source at build time so it can be inlined into the EC jsModule.
 * OriDomi is an IIFE that sets window.OriDomi when loaded as a script.
 */
function readOriDomiSource(): string {
  const require = createRequire(import.meta.url);
  const oriPath = require.resolve("oridomi");
  return readFileSync(oriPath, "utf-8");
}

export function pluginCodeFold() {
  const oriDomiSource = readOriDomiSource();

  return definePlugin({
    name: "CodeFold",

    baseStyles: () => `
      &.has-long-lines {
        position: relative;
      }
    `,

    jsModules: [
      // First module: inline OriDomi library (sets window.OriDomi)
      oriDomiSource,
      // Second module: accordion(20) fold animation on code blocks with long lines
      `
// ── OriDomi accordion(20) fold on code blocks ──────────────────────
(function initCodeFolds() {
  if (document.documentElement.dataset.codeFoldsInitialized) return;
  document.documentElement.dataset.codeFoldsInitialized = "true";

  if (typeof window.OriDomi === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;

  var targets = document.querySelectorAll(".expressive-code.has-long-lines");
  if (targets.length === 0) return;

  // Cap the fold at 70%, leaving at least 30% of the block visible.
  var MAX_FOLD_ANGLE = 70;

  // Inject a style tag to reset margins/padding on all OriDomi elements and
  // their descendants. The site's ".article-content * + *" owl selector adds
  // margin-top to adjacent siblings, which breaks OriDomi's panel alignment.
  // In Safari, the cascade between "all: revert" and the owl selector resolves
  // differently than Chromium, so we need an explicit !important override.
  var fixStyle = document.createElement("style");
  fixStyle.textContent = [
    "/* Reset all spacing inside OriDomi wrappers */",
    ".oridomi-active * + * {",
    "  margin-top: 0 !important;",
    "}",
    ".oridomi-active .oridomi-holder,",
    ".oridomi-active .oridomi-clone,",
    ".oridomi-active .oridomi-stage,",
    ".oridomi-active .oridomi-panel,",
    ".oridomi-active .oridomi-mask,",
    ".oridomi-active .oridomi-content,",
    ".oridomi-active [class*='oridomi-shader'] {",
    "  margin: 0 !important;",
    "  padding: 0 !important;",
    "}",
    "/* Fold-line visual cues: subtle border between panels */",
    ".oridomi-active .oridomi-panel-v {",
    "  border-left: 1px solid rgba(0, 0, 0, 0.12);",
    "  box-sizing: border-box;",
    "}",
    "/* Boost shader visibility for clearer fold depth */",
    ".oridomi-active [class*='oridomi-shader'] {",
    "  opacity: 0.18 !important;",
    "}",
    "/* Ensure 3D context in Safari (webkit prefix) */",
    ".oridomi-active,",
    ".oridomi-active .oridomi-holder,",
    ".oridomi-active .oridomi-stage,",
    ".oridomi-active .oridomi-panel {",
    "  -webkit-transform-style: preserve-3d !important;",
    "  transform-style: preserve-3d !important;",
    "}",
    ".ec-fold-shell {",
    "  position: relative;",
    "  cursor: pointer;",
    "}",
    ".ec-fold-hint {",
    "  position: absolute;",
    "  z-index: 10;",
    "  left: 1rem;",
    "  top: 1rem;",
    "  border: 1px solid rgba(255, 255, 255, 0.35);",
    "  border-radius: 999px;",
    "  padding: 0.4rem 0.7rem;",
    "  background: rgba(13, 17, 23, 0.88);",
    "  color: #fff;",
    "  font: 600 0.75rem/1 sans-serif;",
    "  letter-spacing: 0.02em;",
    "  cursor: pointer;",
    "  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);",
    "}",
    ".ec-fold-hint:focus-visible {",
    "  outline: 3px solid #f0b44d;",
    "  outline-offset: 3px;",
    "}",
  ].join("\\n");
  document.head.appendChild(fixStyle);

  // ── Code block fold animation (lazy via IntersectionObserver) ──────
  // Only initialize OriDomi when a block enters the viewport. This avoids
  // creating all 3D-cloned DOM at once, preventing Safari GPU memory crashes.

  function initFold(ec) {
    if (ec._oriDomi) return; // already initialized

    var rect = ec.getBoundingClientRect();
    var columnWidth = ec.parentElement ? ec.parentElement.clientWidth : rect.width;
    var availableWidth = window.innerWidth - rect.left - 16;
    var targetWidth = Math.min(columnWidth + 180, availableWidth);

    if (targetWidth <= columnWidth) return;

    if (rect.width < targetWidth) {
      ec.style.width = targetWidth + "px";
      ec.style.maxWidth = targetWidth + "px";
      ec.querySelectorAll("pre, code").forEach(function (element) {
        element.style.whiteSpace = "pre";
        element.style.overflowX = "visible";
        element.style.minWidth = "100%";
        element.style.width = "max-content";
      });
      rect = ec.getBoundingClientRect();
    }

    // Build a plain proxy wrapper that holds a full clone of the code block.
    // OriDomi transforms the wrapper, whose structural elements stay outside
    // the ".expressive-code" scope, while the clone inside keeps its class so
    // syntax highlighting still applies.
    var proxy = document.createElement("div");
    proxy.className = "ec-fold-proxy";
    proxy.style.cssText =
      "width:" + rect.width + "px;" +
      "height:" + rect.height + "px;" +
      "margin:0;padding:0;box-sizing:border-box;overflow:hidden";

    var clone = ec.cloneNode(true);
    clone.classList.remove("has-long-lines");
    clone.style.display = "";
    clone.style.margin = "0";
    clone.removeAttribute("id");
    clone.querySelectorAll("button, a").forEach(function (element) {
      element.remove();
    });
    proxy.setAttribute("aria-hidden", "true");
    proxy.appendChild(clone);

    var shell = document.createElement("div");
    shell.className = "ec-fold-shell";
    shell.style.cssText =
      "width:" + rect.width + "px;" +
      "height:" + rect.height + "px";
    shell.appendChild(proxy);

    var hint = document.createElement("button");
    hint.className = "ec-fold-hint";
    hint.type = "button";
    hint.setAttribute("aria-expanded", "false");
    hint.textContent = "Expand code →";
    shell.appendChild(hint);

    // Insert the folded clone before the real block, then reveal the real block
    // after the user expands it.
    ec.parentNode.insertBefore(shell, ec);
    ec.style.display = "none";

    var ori = new window.OriDomi(proxy, {
      vPanels:      3,
      hPanels:      1,
      ripple:       false,
      speed:        0,
      shading:      true,
      touchEnabled: false,
    });

    ec._oriDomi = ori;
    ori.accordion(MAX_FOLD_ANGLE);
    ori.setSpeed(700);

    var expanding = false;
    function expand() {
      if (expanding) return;
      expanding = true;
      hint.setAttribute("aria-expanded", "true");
      hint.style.display = "none";
      ori.accordion(0);
      setTimeout(function () {
        shell.style.display = "none";
        ec.style.display = "";
      }, 750);
    }

    shell.addEventListener("click", expand);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        initFold(entry.target);
        observer.unobserve(entry.target); // one-shot: init once, keep alive
      }
    });
  }, { rootMargin: "300px 0px" }); // initialize before the block enters the viewport

  targets.forEach(function (ec) {
    observer.observe(ec);
  });
})();
`,
    ],

    hooks: {
      postprocessRenderedBlockGroup: ({
        renderedGroupContents,
        renderData,
      }) => {
        const anyOverflow = renderedGroupContents.some(({ codeBlock }) =>
          codeBlock
            .getLines()
            .some((line) => line.text.length > LONG_LINE_THRESHOLD),
        );

        if (!anyOverflow) return;

        addClassName(renderData.groupAst, "has-long-lines");
      },
    },
  });
}
