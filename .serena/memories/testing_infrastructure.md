# Testing Infrastructure

## Test Suites Overview
Comprehensive testing setup covering performance, accessibility, visual regression, and bundle analysis.

## Visual Regression Testing (Playwright)
- **Framework**: @playwright/test ^1.55.0
- **Configuration**: playwright.config.js
- **Test Directory**: tests/visual/
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Viewports**: Desktop, tablet, mobile
- **Features**: Screenshot comparison, cross-browser testing

### Commands
```bash
npm run test:visual      # Run visual tests
npm run test:update      # Update baselines
npm run test:headed      # Run with browser visible
```

## Performance Testing
### Lighthouse CI
- **Tool**: @lhci/cli ^0.15.1
- **Configurations**: 
  - Desktop: lighthouserc.js
  - Mobile: lighthouserc.mobile.js
- **Metrics**: Performance, accessibility, best practices, SEO

### Web Vitals
- **Tool**: web-vitals ^5.1.0
- **Script**: scripts/web-vitals-test.js
- **Metrics**: LCP, FID, CLS core web vitals

### Commands
```bash
npm run test:lighthouse         # Desktop performance
npm run test:lighthouse:mobile  # Mobile performance
npm run test:web-vitals        # Core Web Vitals
```

## Accessibility Testing
- **Tool**: pa11y-ci ^4.0.1
- **Standard**: WCAG2AA compliance
- **Configuration**: .pa11yci.json
- **Features**: Color contrast, keyboard navigation, screen reader compatibility

### Commands
```bash
npm run test:accessibility
```

## Bundle Analysis
- **Script**: scripts/analyze-bundle.js
- **Metrics**: CSS/JS bundle sizes, optimization recommendations
- **Output**: metrics/bundle-analysis.json

### Commands
```bash
npm run test:bundle
```

## Image Optimization
- **Script**: scripts/check-images.js
- **Tools**: imageoptim-cli, sharp
- **Checks**: File sizes, format optimization, responsive images, alt text

### Commands
```bash
npm run test:images
```

## Baseline Management
Generates reference metrics for all test suites:

### Commands
```bash
npm run baseline                # All baselines
npm run baseline:build         # Build baseline
npm run baseline:lighthouse    # Performance baseline
npm run baseline:accessibility # Accessibility baseline
npm run baseline:bundle       # Bundle baseline
npm run baseline:images       # Image baseline
```

## CI Integration
- All tests output JSON for automated analysis
- `npm test` runs full suite and fails on threshold violations
- Designed for CI/CD pipeline integration