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

## Hugo Conventions
- **Configuration Format**: YAML (hugo.yaml)
- **Metadata Format**: YAML front matter
- **Content Organization**: 
  - Articles in `/content/articles/YYYY/` structure
  - Projects in `/content/projects/`
  - Static pages in dedicated directories
- **Permalinks**: `/:year/:month/:slug/` for articles, `/:slug/` for pages

## Content Conventions
- **Front Matter**: YAML format
- **Code Highlighting**: Pygments with CSS classes
- **Markdown**: CommonMark with Goldmark renderer
- **Images**: Organized in static/ directory

## File Naming
- **Content Files**: kebab-case with date prefix for articles
- **Configuration**: snake_case or camelCase based on context
- **Scripts**: kebab-case (analyze-bundle.js, check-images.js)

## Testing File Organization
- **Visual Tests**: `/tests/visual/`
- **Scripts**: `/scripts/` directory
- **Configuration**: Root-level config files

## Git Submodules
- Nested submodules present (themes)
- Requires recursive initialization: `git submodule update --recursive --init`