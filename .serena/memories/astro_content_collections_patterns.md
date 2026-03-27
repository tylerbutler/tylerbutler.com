# Astro Content Collections Architecture Patterns

## Content Collections Discovery
The Tyler Butler website uses Astro's content collections system instead of custom markdown processing:

### Key Pattern
```typescript
// Standard pattern across the site
const articles = await getCollection('articles', ({ data }) => {
  return !data.draft;
});
```

### Article Data Structure
Articles accessed via content collections have this structure:
- `article.data` - Contains frontmatter (title, date, tags, slug, etc.)
- `article.slug` - File-based slug
- `article.render()` - Renders content component

### URL Generation Pattern
```typescript
const date = new Date(article.data.date);
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const slug = article.data.slug || article.slug;
const url = `/articles/${year}/${month}/${slug}/`;
```

### Static Path Generation
For dynamic routes, use `getStaticPaths()` with content collections:
```typescript
export async function getStaticPaths() {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  
  // Process articles to generate paths and props
  return articles.map(article => ({
    params: { /* route params */ },
    props: { /* page props */ }
  }));
}
```

### Tags Implementation Pattern
1. Extract all unique tags during build
2. Generate static paths for each tag
3. Filter articles by tag in props
4. Sort by date for consistent display

This approach ensures optimal performance through static generation while maintaining data consistency across all pages.