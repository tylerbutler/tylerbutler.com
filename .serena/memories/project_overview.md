# Tyler Butler's Personal Website - Project Overview

## Purpose
Personal website and blog for Tyler Butler (tylerbutler.com) built with Hugo static site generator. Contains articles dating back to 2002, project showcases, and personal content. Currently undergoing migration planning from Hugo to SvelteKit as documented in TRANSITION_PLAN.md.

## Tech Stack
- **Primary**: Hugo Extended 0.148.2 (static site generator)
- **Theme**: dark_rainbow (custom Hugo theme)
- **Runtime**: Node.js 24+
- **Build System**: Hugo with npm scripts for testing infrastructure
- **Deployment**: Netlify (via netlify.toml configuration)
- **Version Management**: mise for tool versions

## Repository Structure
- `content/` - All markdown content (articles, projects, about, colophon)
  - `articles/` - Blog posts organized by year (2002-2024)
  - `projects/` - Project showcase pages
  - `about/` - About page
  - `colophon/` - Site information
- `config/` - Hugo configuration files (development, production, default)
- `layouts/` - Hugo templates and layout files
- `static/` - Static assets
- `themes/` - Hugo themes (dark_rainbow)
- `tests/` - Testing infrastructure (visual regression, performance)
- `scripts/` - Utility scripts for bundle analysis, image checking, web vitals
- `public/` - Built site output (generated)

## Content Structure
- 100+ blog articles from 2002-2024
- Multiple project pages
- Static pages (About, Colophon)
- RSS feed generation
- Permalink structure: `/year/month/slug/` for articles

## Deployment
- Platform: Netlify
- Build command: `git submodule update --recursive --init ; hugo`
- Publish directory: `public`
- Domain: tylerbutler.com