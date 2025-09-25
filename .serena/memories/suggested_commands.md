# Essential Development Commands

## Build and Development
```bash
# Build the site
npm run build
# OR
astro build

# Start development server
npm run dev
# OR  
astro dev

# Preview production build
npm run preview
# OR
astro preview

# Type checking
npm run check
# OR
astro check
```

## Testing Commands

### Full Test Suite
```bash
# Run all tests (visual, performance, accessibility, bundle)
npm test
```

### Individual Test Suites
```bash
# Visual regression testing (Playwright)
npm run test:visual

# Performance testing
npm run test:performance
npm run test:lighthouse          # Desktop Lighthouse
npm run test:lighthouse:mobile   # Mobile Lighthouse
npm run test:web-vitals         # Core Web Vitals

# Accessibility testing
npm run test:accessibility       # Pa11y WCAG2AA compliance

# Bundle analysis
npm run test:bundle             # CSS/JS bundle size analysis

# Image optimization checks
npm run test:images
```

### Test Management
```bash
# Update visual test baselines
npm run test:update

# Run tests with browser visible
npm run test:headed
```

### Baseline Generation
```bash
# Generate all baseline metrics
npm run baseline

# Individual baselines
npm run baseline:build
npm run baseline:lighthouse
npm run baseline:accessibility
npm run baseline:bundle
npm run baseline:images
```

## Development Tools
```bash
# Add Astro integrations
npx astro add <integration>     # Add official integrations

# Bundle analysis (generated during test:bundle)
open dist/bundle-analysis.html
```

## System Commands (macOS/Darwin)
```bash
# Standard Unix commands available
ls, cd, grep, find, cat, head, tail, sed, awk

# Package management via mise
mise install        # Install tools from mise.toml
mise list          # List available tools
```

## Project Structure Navigation
```bash
# Content directories
ls src/content/articles/    # Blog posts by year
ls src/content/projects/    # Project pages  
ls src/content/about/       # About page content
ls src/content/colophon/    # Site info

# Source structure
ls src/pages/              # Astro pages
ls src/layouts/            # Layout components
ls src/lib/                # Utilities and styles
ls public/                 # Static assets
ls dist/                   # Built output
```