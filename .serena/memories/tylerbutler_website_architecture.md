# Tyler Butler Website Architecture (Astro Migration)

## Project Overview
Personal website and blog for Tyler Butler, migrated from SvelteKit to Astro with modern static site generation.

## Current Branch Status
- **Active Branch**: `redesign-2025-astro`
- **Base Branch**: `main`
- **Migration Status**: Complete SvelteKit to Astro migration with layout refinements

## Technology Stack
- **Framework**: Astro v5.13.10
- **Styling**: Custom CSS with CSS variables
- **Fonts**: Advent Pro (display), Lato (navigation), Adelle (body text)
- **Assets**: Static files served from `public/` directory
- **Development**: npm, port 4321/4322

## Architecture Patterns

### CSS Organization
- **Global Styles**: `src/lib/styles/global.css`
- **CSS Variables**: Centralized design tokens for colors, typography, spacing
- **Component Styles**: Astro component-scoped styles where needed
- **Background System**: Body-level background images with content overlays

### Layout System
```
src/layouts/BaseLayout.astro
├── Header (Navigation + Title + Tagline)
├── Main Content (.content-section)
│   └── Content Inner (.content-inner)
└── Footer
```

### Content Architecture
- **Articles**: Markdown content in `src/content/articles/[year]/`
- **Projects**: `src/content/projects/`
- **Static Assets**: `public/` directory (favicon, background images)
- **Components**: `src/components/` (Header, Footer, Navigation)

## Design System

### Color Palette
- **Dark Background**: `#0E0E0E` (header section)
- **Light Background**: `#F7F6F5` (content section)  
- **Accent Color**: `#A2834E` (golden bronze for titles, links)
- **Text Color**: `#262626` (dark gray body text)
- **Navigation Links**: `#F7F6F5` (off-white)

### Typography Scale
- **Main Title**: Advent Pro, 96px, 100 weight, 2px letter spacing
- **Tagline**: Adelle, 13px, 3px letter spacing, uppercase
- **Navigation**: Lato, 12px, 3px letter spacing, uppercase
- **Section Headings**: Adelle, 26px, 300 weight, 1px letter spacing
- **Body Text**: Adelle, 14px, 23.8px line height

### Layout Measurements
- **Container Width**: 636px
- **Content Width**: 380px  
- **Container Margin**: 30px auto (centered)
- **Header Padding**: 35px 25px
- **Content Padding**: 50.875px 0px
- **Inner Content Margins**: 0px 35px

## Background Image System
- **Location**: `public/bg.jpg` (Klaus Bürgle artwork, 1600x1228)
- **Implementation**: Applied to `body` element with `background-attachment: fixed`
- **Properties**: `cover` size, `center` position, `no-repeat`
- **Content Strategy**: White content container with box shadow over background

## Development Workflow
- **Dev Server**: `npm run dev` (auto-detects available ports)
- **Content Hot Reload**: Astro content collections with live updates
- **Asset Serving**: Direct serving from `public/` at root path
- **CSS Processing**: Native CSS with Astro processing

## Known Implementation Details
- Typography uses mix of web fonts (Typekit) and fallbacks
- Responsive breakpoints at 768px and 480px
- HR elements styled as centered "###" symbols  
- Navigation includes conditional small header variant
- Footer includes attribution to background image source