# Tech Stack and Development Tools

## Core Technologies
- **Astro**: 5.13+ (static site generator)
- **Node.js**: 24+ (for development and testing infrastructure)
- **Package Manager**: npm (package-lock.json present)
- **Version Manager**: mise (mise.toml for tool versions)
- **Framework Integrations**: Svelte, MDX, Sitemap, Expressive Code

## Dependencies
### Production
- `astro`: ^5.13.11
- `@astrojs/svelte`: ^7.2.0
- `@astrojs/mdx`: ^4.3.6
- `@astrojs/sitemap`: ^3.6.0
- `@astrojs/rss`: ^4.0.12
- `astro-expressive-code`: ^0.41.3

### Development/Testing
- `@playwright/test`: ^1.55.1 (visual regression testing)
- `@lhci/cli`: ^0.15.1 (Lighthouse CI)
- `lighthouse`: ^12.8.2 (performance testing)
- `pa11y-ci`: ^4.0.1 (accessibility testing)
- `@axe-core/playwright`: ^4.10.2 (accessibility automation)
- `sharp`: ^0.34.4 (image processing)
- `web-vitals`: ^5.1.0 (performance metrics)
- `imageoptim-cli`: ^3.1.9 (image optimization)

## Configuration Files
- `astro.config.mjs` - Main Astro configuration (site, integrations, build options)
- `netlify.toml` - Deployment configuration
- `playwright.config.js` - Browser testing configuration (port 4321)
- `mise.toml` - Tool version management (Node.js 24)
- `.editorconfig` - Code formatting standards
- `package.json` - Dependencies and scripts

## Development Commands
- `astro dev` - Development server (port 4321)
- `astro build` - Production build
- `astro preview` - Preview production build
- `astro check` - Type checking and linting