import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { definePlugin, addClassName } from "@expressive-code/core";

/**
 * Threshold in characters — lines longer than this trigger the fold animation.
 * Tuned to roughly match when code overflows a 693px-wide column at typical font size.
 */
const LONG_LINE_THRESHOLD = 80;

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
      /* The wrapper div we inject from JS clips OriDomi's 3D overflow */
      &.has-long-lines {
        /* No special styles needed here — the JS wrapper handles clipping */
      }
    `,

    jsModules: [
      // First module: inline OriDomi library (sets window.OriDomi)
      oriDomiSource,
      // Second module: IntersectionObserver-triggered fold animation on entire code block
      `
// ── OriDomi fold animation ──────────────────────────────────────────
(function initCodeFolds() {
  if (typeof window.OriDomi === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var FOLD_ANGLE = -8;   // gentle fold angle per panel
  var PANELS     = 6;    // number of vertical panels
  var UNFOLD_MS  = 1200; // animation duration in ms

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  document.querySelectorAll(".expressive-code.has-long-lines").forEach(function (ec) {
    // Capture original height BEFORE OriDomi modifies the DOM
    var origHeight = ec.offsetHeight;

    // Double-wrapper: outer clips 3D overflow, inner absorbs OriDomi's preserve-3d
    var outerClip = document.createElement("div");
    outerClip.className = "ec-fold-clip";
    outerClip.style.cssText = "clip-path:inset(0);overflow:hidden;position:relative;height:" + origHeight + "px";

    var innerWrap = document.createElement("div");
    innerWrap.className = "ec-fold-inner";

    ec.parentNode.insertBefore(outerClip, ec);
    outerClip.appendChild(innerWrap);
    innerWrap.appendChild(ec);

    var ori = new window.OriDomi(ec, {
      vPanels: PANELS, hPanels: 1, speed: 0, shading: false,
    });

    // OriDomi creates a clone (hidden original) + holder (visible panels).
    // The clone takes layout space, pushing the holder below the clip region.
    // Fix: hide clone, absolutely position holder at top.
    var clone = ec.querySelector(".oridomi-clone");
    var holder = ec.querySelector(".oridomi-holder");
    if (clone) clone.style.display = "none";
    if (holder) {
      holder.style.cssText = "position:absolute;top:0;left:0;width:100%";
    }
    ec.style.position = "relative";

    // Start fully folded
    ori.accordion(FOLD_ANGLE);

    var unfolded = false;

    function animateUnfold() {
      var start = performance.now();
      function tick(now) {
        var t = Math.min(1, (now - start) / UNFOLD_MS);
        ori.accordion(FOLD_ANGLE * (1 - easeOutCubic(t)));
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          ori.accordion(0);
        }
      }
      requestAnimationFrame(tick);
    }

    // Trigger unfold once when 10% of the block enters the viewport
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !unfolded) {
          unfolded = true;
          observer.disconnect();
          animateUnfold();
        }
      });
    }, { threshold: 0.1 });

    observer.observe(outerClip);
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

        addClassName(renderData.groupAst, "has-long-lines");
      },
    },
  });
}

