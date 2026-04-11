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
// ── OriDomi drag-to-fold on code blocks ─────────────────────────────
(function initCodeFolds() {
  if (typeof window.OriDomi === "undefined") return;

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

    // OriDomi with touch/drag enabled — no programmatic animation
    var ori = new window.OriDomi(ec, {
      vPanels:      4,
      hPanels:      1,
      speed:        700,
      ripple:       true,
      shading:      true,
      touchEnabled: true,
    });

    // OriDomi creates a clone + holder that break layout.
    // Fix: hide clone, absolutely position holder at top.
    var clone = ec.querySelector(".oridomi-clone");
    var holder = ec.querySelector(".oridomi-holder");
    if (clone) clone.style.display = "none";
    if (holder) {
      holder.style.cssText = "position:absolute;top:0;left:0;width:100%";
    }
    ec.style.position = "relative";
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

