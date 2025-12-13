/**
 * Parallax Background Effect
 * Creates a subtle parallax scrolling effect on the background image
 * Respects reduced motion preferences
 */

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Only initialize parallax if motion is allowed
if (!prefersReducedMotion) {
  // Configuration
  const PARALLAX_SPEED = 0.3; // How much the background moves relative to scroll (0-1)
  const MOBILE_BREAKPOINT = 768; // Match CSS breakpoint

  let ticking = false;
  let lastScrollY = 0;

  // Get the background pseudo-element via CSS custom property
  const updateParallax = () => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    // Calculate parallax offset
    // Negative value moves background up as user scrolls down
    const parallaxOffset = -(scrollY * PARALLAX_SPEED);

    // Apply the transform via CSS custom property on the root
    document.documentElement.style.setProperty(
      "--parallax-offset",
      `${parallaxOffset}px`,
    );

    ticking = false;
  };

  const onScroll = () => {
    lastScrollY = window.scrollY;

    if (!ticking) {
      requestAnimationFrame(() => {
        updateParallax();
      });
      ticking = true;
    }
  };

  // Only enable on desktop (where background image is visible)
  const initParallax = () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      window.addEventListener("scroll", onScroll, { passive: true });
      // Initial update
      updateParallax();
    }
  };

  // Handle resize - enable/disable parallax based on viewport
  const handleResize = () => {
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.setProperty("--parallax-offset", "0px");
    } else {
      // Re-add listener if we're on desktop
      window.removeEventListener("scroll", onScroll); // Prevent duplicates
      window.addEventListener("scroll", onScroll, { passive: true });
      updateParallax();
    }
  };

  // Debounce resize handler
  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initParallax);
  } else {
    initParallax();
  }
}
