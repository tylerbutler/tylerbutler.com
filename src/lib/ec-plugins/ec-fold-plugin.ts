import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { definePlugin, addClassName } from "@expressive-code/core";

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
        cursor: pointer;
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
  if (typeof window.OriDomi === "undefined") return;

  var targets = document.querySelectorAll(".expressive-code.has-long-lines");
  if (targets.length === 0) return;

  // ── Manual test element ───────────────────────────────────────────
  // Inject a known-good OriDomi reference element before the first fold-enabled block.
  // This helps verify OriDomi works independently of the EC block structure.
  var firstTarget = targets[0];
  var testEl = document.createElement("div");
  testEl.id = "oridomi-test";
  testEl.style.cssText = "width:100%;height:200px;background:#1e293b;color:#e2e8f0;font-family:monospace;font-size:14px;padding:1.5rem;border-radius:8px;line-height:1.6;overflow:hidden;margin:1rem 0 2rem;box-sizing:border-box;cursor:pointer";
  testEl.innerHTML = '<h3 style="margin:0 0 .5rem;color:#38bdf8;font-size:1.2rem">OriDomi Test Element</h3>'
    + '<p style="margin:0">This element uses <code>accordion(20)</code> with 5 vertical panels and ripple — matching the first demo on oxism.com/oriDomi. Click to toggle fold/unfold.</p>'
    + '<p style="margin:.5rem 0 0;color:#94a3b8">If you see this folded in 3D, OriDomi is working correctly.</p>';

  var testLabel = document.createElement("p");
  testLabel.style.cssText = "font-style:italic;color:#888;font-size:0.9em;margin:0 0 1rem";
  testLabel.textContent = "▼ Manual OriDomi test element (accordion(20), 5 vPanels, ripple):";

  firstTarget.parentNode.insertBefore(testLabel, firstTarget);
  firstTarget.parentNode.insertBefore(testEl, firstTarget);

  var testOri = new window.OriDomi(testEl, {
    vPanels: 5,
    ripple: true,
    speed: 700,
    shading: true,
    touchEnabled: true,
  });

  var testFolded = false;
  setTimeout(function () {
    testOri.accordion(20);
    testFolded = true;
  }, 800);

  testEl.addEventListener("click", function (e) {
    e.preventDefault();
    if (testFolded) {
      testOri.unfold();
      testFolded = false;
    } else {
      testOri.accordion(20);
      testFolded = true;
    }
  });

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
  ].join("\\n");
  document.head.appendChild(fixStyle);

  // ── Code block fold animation (lazy via IntersectionObserver) ──────
  // Only initialize OriDomi when a block enters the viewport. This avoids
  // creating all 3D-cloned DOM at once, preventing Safari GPU memory crashes.

  function initFold(ec) {
    if (ec._oriDomi) return; // already initialized

    var rect = ec.getBoundingClientRect();
    ec.style.height = rect.height + "px";
    ec.style.width = rect.width + "px";
    ec.style.overflow = "hidden";

    var ori = new window.OriDomi(ec, {
      vPanels:      3,
      hPanels:      1,
      ripple:       true,
      speed:        700,
      shading:      true,
      touchEnabled: false,
    });

    // Remove .expressive-code so OriDomi structural elements escape
    // EC's destructive ".expressive-code * { all: revert }" rule.
    // Content clones keep the class via OriDomi's class copying.
    ec.classList.remove("expressive-code");

    var isFolded = false;
    setTimeout(function () {
      ori.accordion(20);
      isFolded = true;
    }, 300);

    ec.addEventListener("click", function (e) {
      e.preventDefault();
      if (isFolded) {
        ori.unfold();
        isFolded = false;
      } else {
        ori.accordion(20);
        isFolded = true;
      }
    });

    ec._oriDomi = ori;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        initFold(entry.target);
        observer.unobserve(entry.target); // one-shot: init once, keep alive
      }
    });
  }, { rootMargin: "200px 0px" }); // init slightly before entering viewport

  targets.forEach(function (ec) {
    observer.observe(ec);
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

