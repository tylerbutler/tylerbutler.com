import OriDomi from "oridomi";
import { calcScrollProgress } from "./scroll-utils.ts";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function initCodeFolds(): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isWideScreen = window.matchMedia("(min-width: 1200px)").matches;

  if (!isWideScreen) return;

  document
    .querySelectorAll<HTMLElement>(".ec-fold-wrapper")
    .forEach((wrapper) => {
      const codeBlock = wrapper.querySelector<HTMLElement>(".expressive-code");
      const foldPanel = wrapper.querySelector<HTMLElement>(".ec-fold-panel");

      if (!codeBlock || !foldPanel) return;

      // Skip blocks that fit within the column (no overflow)
      const ecRect = codeBlock.getBoundingClientRect();
      if (ecRect.width <= wrapper.clientWidth) {
        foldPanel.style.display = "none";
        return;
      }

      if (prefersReducedMotion) {
        // Progressive enhancement: show full code immediately
        codeBlock.style.clipPath = "none";
        return;
      }

      const ori = new OriDomi(foldPanel, {
        vPanels: 2,
        shading: true,
        backface: true,
        speed: 0, // Instant state changes for scroll-driven animation
      });

      // Initial state: fold panel folded closed, code clipped
      ori.accordion(-90);
      codeBlock.style.clipPath = "inset(0 180px 0 0)";

      let ticking = false;

      const update = () => {
        const rect = wrapper.getBoundingClientRect();
        const progress = calcScrollProgress(rect.bottom, window.innerHeight);
        const foldAngle = lerp(-90, 0, progress);
        const clipRight = Math.round(lerp(180, 0, progress));

        ori.accordion(foldAngle);
        codeBlock.style.clipPath =
          clipRight > 0 ? `inset(0 ${clipRight}px 0 0)` : "none";

        ticking = false;
      };

      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      update(); // Set initial paint state
    });
}
