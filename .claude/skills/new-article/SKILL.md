---
name: new-article
description: Scaffold a new blog article with correct frontmatter and file placement
---

# New Article

Create a new article in the Astro content collection.

## Arguments

- **title** (required): The article title
- **slug** (optional): URL slug. If omitted, derive from title (lowercase, hyphens, no special chars)
- **tags** (optional): Comma-separated tags
- **draft** (optional): Set to true to mark as draft. Defaults to false.
- **link** (optional): External URL for link-type articles
- **type** (optional): "guide" (shows ToC) or "standard" (default)

## File Placement

Articles use the naming pattern: `YYYY-MM-DD-<slug>.md`

- Recent articles go directly in `src/content/articles/`
- Older articles are organized by year: `src/content/articles/YYYY/`
- New articles should go directly in `src/content/articles/`

## Frontmatter Schema

```yaml
---
title: 'Article Title'
date: 'YYYY-MM-DDTHH:MM:SS-07:00'
slug: article-slug
tags:
  - tag1
  - tag2
excerpt: 'Optional short description'
draft: false
---
```

### Optional frontmatter fields:
- `link`: External URL (makes this a "link" type article)
- `via`: Attribution name for linked articles
- `vialink`: Attribution URL for linked articles
- `headingStartLevel`: Override heading normalization level
- `type`: "guide" (for ToC) or "standard"

## Steps

1. Generate the filename using today's date and the slug: `YYYY-MM-DD-<slug>.md`
2. Create the file at `src/content/articles/<filename>`
3. Use the current date/time in ISO 8601 format with timezone offset for the `date` field
4. Include only the frontmatter fields that were specified -- don't add empty optional fields
5. Add `<!--more-->` after the first paragraph as an excerpt separator if the article has body content
6. Report the created file path
