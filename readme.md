# Tyler Butler's Website

Built with [Astro](https://astro.build/) - a modern web framework for content-focused sites.

## Requirements

- Node.js 20+ (for Astro and testing infrastructure)
- See `mise.toml` for specific version requirements

## Development

### Building the Site

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the site for production
npm run build

# Preview production build
npm run preview
```

## Testing Infrastructure

This site includes comprehensive performance and quality testing:

### Performance Testing

```bash
# Run all tests
npm test

# Run individual test suites
npm run test:visual          # Playwright visual regression tests
npm run test:performance     # Lighthouse CI + Web Vitals
npm run test:accessibility   # Pa11y WCAG2AA compliance
npm run test:bundle         # Bundle size analysis
npm run test:images         # Image optimization checks
```

### Lighthouse CI Testing

```bash
# Desktop performance testing
npm run test:lighthouse

# Mobile performance testing  
npm run test:lighthouse:mobile
```

**Configured thresholds:**
- Performance: 90% (desktop), 85% (mobile)
- Accessibility: 95%
- Best Practices: 90%
- SEO: 95%
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

### Visual Regression Testing

```bash
# Run visual tests
npm run test:visual

# Update baseline screenshots
npm run test:update

# Run tests in headed mode (see browser)
npm run test:headed
```

Tests homepage, articles, code blocks, and footer across:
- Chrome, Firefox, Safari
- Desktop, tablet, mobile viewports

### Bundle Analysis

```bash
# Analyze bundle composition with interactive visualization
npm run test:bundle
```

This generates an interactive treemap visualization at `dist/bundle-analysis.html` showing:
- Bundle composition by module
- Gzip and Brotli compressed sizes
- Import relationships and dependencies

Open `dist/bundle-analysis.html` in your browser after running the command to explore the bundle structure.

### Image Optimization

```bash
# Check image formats and responsive images
npm run test:images
```

**Checks for:**
- Oversized images (>500KB)
- PNG vs JPEG format optimization
- Missing responsive image attributes (`srcset`/`sizes`)
- Alt text compliance

### Accessibility Testing

```bash
# WCAG2AA compliance testing
npm run test:accessibility
```

**Validates:**
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- Semantic HTML structure

### Generate All Baselines

```bash
# Generate baseline metrics for all testing suites
npm run baseline
```

**Output files:**
- `dist/bundle-analysis.html` - Interactive bundle visualization (generated during production builds)
- `metrics/image-analysis.json` - Image optimization data
- `metrics/web-vitals.json` - Core Web Vitals measurements
- `.lighthouseci/` - Lighthouse performance reports

## CI/CD Integration

All testing tools output JSON for automated analysis and can be integrated into CI/CD pipelines. The `npm test` command runs the full test suite and will fail if any quality thresholds are not met.
