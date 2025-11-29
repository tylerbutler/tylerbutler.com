/**
 * Littlefoot.js initialization script
 * External script to avoid Astro's is:inline limitations
 */
import { littlefoot } from "littlefoot";

export function initializeLittlefoot() {
  try {
    // Add class to body to indicate Littlefoot is active
    document.body.classList.add("littlefoot-active");

    // Initialize Littlefoot with configuration
    const config = {
      allowDuplicates: false,
      allowMultiple: false,
      dismissDelay: 100,
      dismissOnUnhover: true,
      hoverDelay: 250,
      scope: "body",
    };

    littlefoot(config);

    console.log("Littlefoot.js initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Littlefoot.js:", error);
    // If Littlefoot fails, ensure footnotes section remains visible
    document.body.classList.remove("littlefoot-active");
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeLittlefoot);
} else {
  initializeLittlefoot();
}

// Re-initialize after navigation in SPA mode (for Astro view transitions)
document.addEventListener("astro:page-load", initializeLittlefoot);
