# Tyler Butler's Hugo Site

This repo has nested submodules, so use the following command to update them all after a fresh clone:

    git submodule update --recursive --init

## Requirements

- Hugo 0.126.1+ (see `mise.toml`)
- Node.js 24+ (for testing infrastructure)

## Development

### Building the Site

```bash
# Build the site
npm run build

# Start development server
hugo server -D
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
# Analyze CSS/JS bundle sizes
npm run test:bundle
```

**Current baseline:**
- CSS: 407KB (⚠️ consider code splitting >100KB)
- JavaScript: 119KB ✅
- Total: 526KB

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

**Metrics saved to:**
- `metrics/bundle-analysis.json` - Bundle size tracking
- `metrics/image-analysis.json` - Image optimization data
- `metrics/web-vitals.json` - Core Web Vitals measurements
- `.lighthouseci/` - Lighthouse performance reports

## CI/CD Integration

All testing tools output JSON for automated analysis and can be integrated into CI/CD pipelines. The `npm test` command runs the full test suite and will fail if any quality thresholds are not met.
