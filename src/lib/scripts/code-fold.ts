/**
 * Adds a `.fold-active` class to `.ec-fold-wrapper` elements whose code
 * content extends beyond the column width. CSS scroll-driven animations
 * (animation-timeline: view()) handle the actual fold-out effect.
 */
export function initCodeFolds(): void {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isWideScreen = window.matchMedia("(min-width: 1200px)").matches;

  if (!isWideScreen || prefersReducedMotion) return;

  document
    .querySelectorAll<HTMLElement>(".ec-fold-wrapper")
    .forEach((wrapper) => {
      const ec = wrapper.querySelector<HTMLElement>(".expressive-code");
      if (ec && ec.scrollWidth <= wrapper.clientWidth) return;

      wrapper.classList.add("fold-active");
    });
}
