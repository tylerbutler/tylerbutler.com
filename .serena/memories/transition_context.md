# Hugo to SvelteKit Transition Context

## Current Status
The project is currently a Hugo-based static site but has a detailed transition plan to migrate to SvelteKit while preserving all content and design.

## Key Transition Documents
- **TRANSITION_PLAN.md**: Comprehensive migration plan with exact design specifications
- **Design Reference**: http://localhost:3000/Current%20Issue%20%E2%80%94%20Bastion (mockup)
- **Target**: SvelteKit static site deployed on Netlify

## Migration Approach
1. **Content Preservation**: All markdown content in `/content/` will be migrated
2. **URL Structure**: Maintain existing permalinks with redirects
3. **Design Fidelity**: Pixel-perfect match to provided mockup
4. **Performance**: Maintain or improve current performance metrics

## Files to Preserve During Migration
- `/content/` - All content files
- `/tests/` - Testing infrastructure
- `netlify.toml` - Deployment configuration (update for SvelteKit)
- `.git/` - Git repository
- `package.json` - Update dependencies for SvelteKit
- `README.md` - Documentation

## Files to Delete After Migration
- `.forestry/` - Hugo CMS integration
- `archetypes/` - Hugo content templates
- `config/` - Hugo configuration
- `layouts/` - Hugo templates
- `resources/` - Hugo build resources
- `static/` - Hugo static assets
- `themes/` - Hugo themes
- `azure-hugo/` - Hugo deployment scripts
- `.hugo_build.lock` - Hugo build file

## Design Requirements
- **Fonts**: Advent Pro (headlines), adelle (body), Lato (navigation)
- **Colors**: Dark header (#0E0E0E), light content (#F7F6F5), accent (#A2834E)
- **Layout**: 636px container, two-section layout (header/content)
- **Typography**: Precise font sizes, weights, and spacing per mockup

## Current Architecture
- Hugo static site generator
- dark_rainbow theme
- Netlify deployment
- Comprehensive testing infrastructure (preserve during migration)

## Migration Timeline
Estimated 19-27 hours total across setup, implementation, testing, and deployment phases.