# Code Style and Conventions

## Editor Configuration (.editorconfig)
- **Charset**: UTF-8
- **Default Indentation**: Tabs
- **Trailing Whitespace**: Trim
- **Final Newline**: Insert

### File-Specific Indentation
- **Tabs**: Default for most files
- **2 Spaces**: JSON, HTML, YAML, SCSS, SASS
- **4 Spaces**: CSS, LESS, Markdown, Python, reStructuredText

## Astro Conventions
- **Configuration Format**: JavaScript/TypeScript (astro.config.mjs)
- **Content Collections**: TypeScript schema validation in src/content/config.ts
- **Component Format**: .astro files with frontmatter, HTML, and style blocks
- **Content Organization**: 
  - Articles in `/src/content/articles/` with content collections
  - Projects in `/src/content/projects/`
  - Pages in `/src/pages/` directory
- **Permalinks**: `/:year/:month/:slug/` for articles, `/:slug/` for pages

## Content Conventions
- **Front Matter**: YAML format validated by content collections schema
- **Code Highlighting**: Expressive Code with Catppuccin themes
- **Markdown**: Astro's built-in markdown support with MDX integration
- **Images**: Organized in public/ directory

## Component Structure
- **Layouts**: .astro files in src/layouts/
- **Components**: Mix of .astro and .svelte files
- **Pages**: File-based routing in src/pages/
- **Styles**: CSS with custom properties, scoped component styles

## File Naming
- **Content Files**: kebab-case with date prefix for articles
- **Components**: PascalCase (.astro) or kebab-case (.svelte)
- **Pages**: kebab-case or [...slug].astro for dynamic routes
- **Scripts**: kebab-case (analyze-bundle.js, check-images.js)

## Testing File Organization
- **Visual Tests**: `/tests/visual/`
- **Scripts**: `/scripts/` directory
- **Configuration**: Root-level config files (playwright.config.js, etc.)

## TypeScript Configuration
- Astro's built-in TypeScript support
- Content collections provide type safety for frontmatter
- Component props typed via TypeScript interfaces