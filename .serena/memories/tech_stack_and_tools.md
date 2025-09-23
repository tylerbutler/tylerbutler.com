# Tech Stack and Development Tools

## Core Technologies
- **Hugo Extended**: 0.148.2 (static site generator)
- **Node.js**: 24+ (for testing infrastructure)
- **Package Manager**: npm (package-lock.json present)
- **Version Manager**: mise (mise.toml for tool versions)
- **Theme**: dark_rainbow (Hugo theme)

## Dependencies
### Production
- `hugo-extended`: ^0.148.2

### Development/Testing
- `@playwright/test`: ^1.55.0 (visual regression testing)
- `@lhci/cli`: ^0.15.1 (Lighthouse CI)
- `lighthouse`: ^12.8.2 (performance testing)
- `pa11y-ci`: ^4.0.1 (accessibility testing)
- `@axe-core/playwright`: ^4.10.2 (accessibility automation)
- `sharp`: ^0.34.3 (image processing)
- `web-vitals`: ^5.1.0 (performance metrics)
- `imageoptim-cli`: ^3.1.9 (image optimization)

## Configuration Files
- `hugo.yaml` - Main Hugo configuration (baseURL, permalinks, menus)
- `netlify.toml` - Deployment configuration
- `playwright.config.js` - Browser testing configuration
- `mise.toml` - Tool version management
- `.editorconfig` - Code formatting standards
- `package.json` - Dependencies and scripts

## Git Configuration
- Repository has nested submodules requiring `git submodule update --recursive --init`
- Uses conventional commit patterns
- Deployment triggers on git push to main branch