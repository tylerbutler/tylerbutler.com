# Background Image Troubleshooting Session

## Issue Resolved
**Problem**: Background image on Tyler Butler's personal website was not visible - appeared as white background instead of the Klaus Bürgle artwork.

## Root Cause Analysis
The background image was incorrectly applied to `.site-container` instead of the `body` element. Child elements (`.site-header` and `.content-section`) had solid background colors that completely covered the parent's background image.

## Technical Investigation Process
1. **Initial Investigation**: Verified image file exists at `src/lib/assets/bg.jpg` and `public/bg.jpg`
2. **CSS Analysis**: Found background image correctly referenced as `url('/bg.jpg')` in CSS
3. **Browser Testing**: Confirmed image loads successfully (1600x1228 dimensions)
4. **Layer Analysis**: Discovered child elements with solid backgrounds were covering parent background

## Solution Implementation
**Moved background image from `.site-container` to `body` element**:

```css
/* Before - on .site-container */
.site-container {
  background-image: url('/bg.jpg');
  /* ... other properties */
}

/* After - on body */
body {
  background-color: var(--light-bg);
  background-image: url('/bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.site-container {
  background-color: white; /* Content container background */
}
```

## Key Learnings
- **CSS Background Layering**: Child elements with solid backgrounds will completely hide parent background images
- **Proper Background Placement**: Site background images should typically be applied to `body` or `html`, not content containers
- **Astro Static Assets**: Images in `public/` directory are served at root (`/bg.jpg`), while assets in `src/lib/assets/` need build processing

## File Locations
- **Background Image**: `public/bg.jpg` (1600x1228px Klaus Bürgle artwork)
- **CSS File**: `src/lib/styles/global.css` (lines 40-45)
- **Layout**: `src/layouts/BaseLayout.astro` (HTML structure)

## Testing Verification
- ✅ Background image now visible behind content container
- ✅ Content remains readable with proper contrast
- ✅ Layout structure intact with centered content
- ✅ Image loads correctly and displays as intended

## Astro-Specific Notes
- Static assets in `public/` directory are served directly at root
- Development server properly serves static assets
- Background images work correctly with Astro's build process