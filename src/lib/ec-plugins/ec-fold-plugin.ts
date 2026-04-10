import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { definePlugin, addClassName } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";

/**
 * Threshold in characters — lines longer than this trigger the fold animation.
 * Tuned to roughly match when code overflows a 693px-wide column at typical font size.
 */
const LONG_LINE_THRESHOLD = 80;

/**
 * Width in pixels of the fold panel that sits at the column edge.
 * Must stay in sync with the CSS and the JS animation.
 */
const FOLD_PANEL_WIDTH = 180;

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
      /* Fold-capable blocks get relative positioning for the fold panel */
      &.has-long-lines {
        position: relative;
        overflow: visible;
      }

      /* Fold panel: hidden by default, shown on wide screens */
      .ec-fold-panel {
        display: none;
      }

      @media (min-width: 1200px) {
        &.has-long-lines .ec-fold-panel {
          display: block;
          position: absolute;
          top: 0;
          left: 100%;
          width: ${FOLD_PANEL_WIDTH}px;
          height: 100%;
          background-color: #0d1117;
          pointer-events: none;
          z-index: 1;
        }

        /* OriDomi creates child elements inside .ec-fold-panel — let them inherit */
        &.has-long-lines .ec-fold-panel * {
          all: revert;
        }
      }
    `,

    jsModules: [
      // First module: inline OriDomi library (sets window.OriDomi)
      oriDomiSource,
      // Second module: scroll-driven fold animation using OriDomi
      `
// ── OriDomi scroll-driven fold animation ────────────────────────────
(function initCodeFolds() {
  if (typeof window.OriDomi === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(min-width: 1200px)").matches) return;

  var FOLD_PX = ${FOLD_PANEL_WIDTH};

  function lerp(a, b, t) { return a + (b - a) * t; }

  function calcProgress(bottom, vh) {
    var start = vh * 0.65;
    var end   = vh * 0.5;
    return Math.max(0, Math.min(1, (start - bottom) / (start - end)));
  }

  document.querySelectorAll(".expressive-code.has-long-lines").forEach(function (ec) {
    var foldPanel = ec.querySelector(".ec-fold-panel");
    if (!foldPanel) return;

    // Runtime check: skip blocks that actually fit within parent column
    var parent = ec.parentElement;
    if (parent && ec.getBoundingClientRect().width <= parent.clientWidth) {
      foldPanel.style.display = "none";
      return;
    }

    // Initialize OriDomi on the fold panel for paper-fold effect
    var ori = new window.OriDomi(foldPanel, {
      vPanels: 2,
      shading: true,
      speed: 0
    });

    // Initial state: folded closed, code clipped
    ori.accordion(-90);
    ec.style.clipPath = "inset(0 " + FOLD_PX + "px 0 0)";

    var ticking = false;
    function update() {
      var rect = ec.getBoundingClientRect();
      var p = calcProgress(rect.bottom, window.innerHeight);
      var foldAngle = lerp(-90, 0, p);
      var clipRight = Math.round(lerp(FOLD_PX, 0, p));

      ori.accordion(foldAngle);
      ec.style.clipPath = clipRight > 0
        ? "inset(0 " + clipRight + "px 0 0)"
        : "none";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    update();
  });
})();
`,
    ],

    hooks: {
      postprocessRenderedBlockGroup: ({ renderedGroupContents, renderData }) => {
        const anyOverflow = renderedGroupContents.some(({ codeBlock }) =>
          codeBlock.getLines().some((line) => line.text.length > LONG_LINE_THRESHOLD),
        );

        if (!anyOverflow) return;

        const groupAst = renderData.groupAst;
        addClassName(groupAst, "has-long-lines");

        // Append fold panel as a child of .expressive-code
        const foldPanel = h("div", { class: "ec-fold-panel", "aria-hidden": "true" });
        groupAst.children.push(foldPanel);
      },
    },
  });
}

