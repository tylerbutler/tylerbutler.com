# Tyler Butler's Website

Built with [Astro](https://astro.build/) - a modern web framework for content-focused sites.

## Requirements

- Node.js 24+ (see `mise.toml` for specific version requirements)
- pnpm 12.7.0 (pinned in `package.json` and `mise.toml`)

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

### Fonts

The masthead uses Idlewild SSm Light (weight 300) from the font service.
Masthead titles use uppercase letters, normal kerning, and 0.05em tracking,
with maximum sizes of 36px on the homepage and 24px on interior pages.
The rotating tagline uses italic Adelle in sentence case.
Navigation, constellation nameplates, and UI labels use Lato Regular (weight 400);
alert titles use Lato Bold (weight 700). These faces come from `@fontsource/lato`.
Social-preview images use Lato Light for the site label and Regular for metadata.
Body text and headings remain Adelle, and code uses PragmataPro Mono Liga 0.903 under the
`PragmataPro` CSS family.
Keep code letter spacing at `normal` so programming ligatures can form.

At build start, `scripts/download-fonts.ts` downloads missing full WOFF2 sources
into the Git-ignored `public/fonts/` directory. PragmataPro and Idlewild come from
`fonts.tylerbutler.com`, with an approved `Origin` header and without GitHub
credentials.

**Deploy the font service with PragmataPro version `0.903` and Idlewild version
`1.401` before a production build.** The site downloads all four faces per family
from `https://fonts.tylerbutler.com/fonts/pragmata-pro/0.903/` and
`https://fonts.tylerbutler.com/fonts/idlewild/1.401/`.

After Astro generates the HTML, `scripts/publish-font-subsets.ts` collects the
site's Unicode code points and publishes subsets for both font-service families.
Each family has its own cache entry and stable stylesheet:

```text
https://fonts.tylerbutler.com/css/sites/tylerbutler.com/pragmata-pro.css
https://fonts.tylerbutler.com/css/sites/tylerbutler.com/idlewild.css
```

Both stylesheets are loaded by `BaseLayout.astro`. A failed publication fails the
build. `FONT_SUBSET_API_URL` can point publication at a local font service;
`SKIP_FONT_SUBSET_PUBLISH=1` skips publication for offline build checks.

Visual tests fetch font assets with the approved production origin while the
pages run on localhost. Set `FONT_SERVICE_TEST_ORIGIN=http://localhost:18787`
to use a local font service after publishing subsets there.

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
