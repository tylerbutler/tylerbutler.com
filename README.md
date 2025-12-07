# Tyler Butler's Website

Built with [Astro](https://astro.build/) - a modern web framework for content-focused sites.

## Requirements

- Node.js 24+ (see `mise.toml` for specific version requirements)

## Development

### Building the Site

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build the site for production
pnpm build

# Serve the production build locally
pnpm serve
```

## Testing Infrastructure

This site includes comprehensive performance and quality testing. All tests run against the production build.

### Running Tests

```bash
# Build and run all tests
pnpm build && pnpm test

# Run individual test suites
pnpm test:visual          # Playwright visual regression tests
pnpm test:performance     # Lighthouse CI performance testing
pnpm test:accessibility   # Pa11y WCAG2AA compliance
pnpm test:bundle          # Bundle size analysis (includes build)
```

### Lighthouse CI Testing

```bash
# Desktop performance testing
pnpm test:lighthouse

# Mobile performance testing
pnpm test:lighthouse:mobile
```

**Configured thresholds:**
- Performance: 90% (desktop), 85% (mobile)
- Accessibility: 95%
- Best Practices: 90%
- SEO: 95%
- Core Web Vitals: LCP <2.5s, TBT <300ms, CLS <0.1

### Visual Regression Testing

```bash
# Run visual tests
pnpm test:visual

# Update baseline screenshots
pnpm test:update

# Run tests in headed mode (see browser)
pnpm test:headed
```

Tests homepage, articles, code blocks, and footer across:
- Chrome, Firefox, Safari (desktop)
- Mobile Chrome, Mobile Safari
- Tablet (iPad Pro)

### Bundle Analysis

```bash
# Analyze bundle composition with interactive visualization
pnpm test:bundle
```

This generates an interactive treemap visualization at `dist/bundle-analysis.html` showing:
- Bundle composition by module
- Gzip and Brotli compressed sizes
- Import relationships and dependencies

Open `dist/bundle-analysis.html` in your browser after running the command to explore the bundle structure.

### Accessibility Testing

```bash
# WCAG2AA compliance testing
pnpm test:accessibility
```

**Validates:**
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- Semantic HTML structure

### Generate All Baselines

```bash
# Generate baseline metrics for all testing suites
pnpm baseline
```

**Output files:**
- `dist/bundle-analysis.html` - Interactive bundle visualization
- `.lighthouseci/` - Lighthouse performance reports

## CI/CD Integration

All testing tools output JSON for automated analysis and can be integrated into CI/CD pipelines. The `pnpm test` command runs the full test suite and will fail if any quality thresholds are not met.
