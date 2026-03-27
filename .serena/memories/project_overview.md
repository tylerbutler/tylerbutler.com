# Tyler Butler's Personal Website - Project Overview

## Purpose
Personal website and blog for Tyler Butler (tylerbutler.com) built with Astro static site generator. Contains articles dating back to 2002, project showcases, and personal content. Successfully migrated from Hugo to Astro in 2025.

## Tech Stack
- **Primary**: Astro 5.13+ (static site generator)
- **Framework Integrations**: Svelte, MDX, Sitemap, Expressive Code
- **Runtime**: Node.js 24+
- **Build System**: Astro with npm scripts for testing infrastructure
- **Deployment**: Netlify (via netlify.toml configuration)
- **Version Management**: mise for tool versions

## Repository Structure
- `src/content/` - All markdown content (articles, projects, about, colophon)
  - `articles/` - Blog posts organized by year (2002-2024)
  - `projects/` - Project showcase pages
  - `about/` - About page content
  - `colophon/` - Site information
- `src/pages/` - Astro pages and layouts
- `src/layouts/` - Astro layout components
- `src/lib/` - Utility functions and styles
- `public/` - Static assets
- `tests/` - Testing infrastructure (visual regression, performance)
- `scripts/` - Utility scripts for bundle analysis, image checking, web vitals
- `dist/` - Built site output (generated)

## Content Structure
- 100+ blog articles from 2002-2024
- Multiple project pages
- Static pages (About, Colophon)
- RSS feed generation
- Permalink structure: `/year/month/slug/` for articles

## Deployment
- Platform: Netlify
- Build command: `astro build`
- Publish directory: `dist`
- Domain: tylerbutler.com