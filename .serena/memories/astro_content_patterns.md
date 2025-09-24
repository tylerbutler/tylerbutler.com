# Astro Content Collection Patterns

## External Link Handling in Articles

### Schema Design
```typescript
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    link: z.string().optional(),      // External URL for title link
    via: z.string().optional(),       // Attribution text
    vialink: z.string().optional(),   // Attribution URL
    // ... other fields
  }),
});
```

### Template Implementation
```astro
---
// Dynamic link handling
const linkUrl = article.data.link || `/articles/${year}/${month}/${slug}`;
const isExternalLink = !!article.data.link;
---

<h4>
  <a href={linkUrl} {...(isExternalLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
    {article.data.title}
    {isExternalLink && <span class="external-link-icon">↗</span>}
  </a>
</h4>

<!-- Via attribution -->
{(article.data.via || article.data.vialink) && (
  <p class="via">
    via {article.data.vialink ? (
      <a href={article.data.vialink} target="_blank" rel="noopener noreferrer">
        {article.data.via || 'link'}
      </a>
    ) : article.data.via}
  </p>
)}
```

### CSS Styling Patterns
```css
.external-link-icon {
  font-size: 0.8em;
  margin-left: 0.3em;
  opacity: 0.6;
}

.via {
  margin: 0.5em 0 0 0;
  font-size: 11px;
  color: #888;
  font-style: italic;
}

.via a {
  color: var(--accent);
  text-decoration: none;
}
```

## Responsive Navigation Patterns

### Mobile-First Approach with Wide-Screen Enhancement
```css
/* Base: Centered horizontal navigation */
nav ul {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* Wide screens: Vertical left navigation */
@media (min-width: 1200px) {
  nav {
    text-align: left;
  }
  
  nav ul {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
```

## Project Content Management

### Metadata Schema
```typescript
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string().optional(),      // Live project URL
    github: z.string().optional(),   // GitHub repository
    tags: z.array(z.string()).optional(),
  }),
});
```

### Dynamic Link Generation
```astro
<div class="project-links">
  {project.data.url && (
    <a href={project.data.url} target="_blank" rel="noopener">View Project</a>
  )}
  {project.data.github && (
    <a href={project.data.github} target="_blank" rel="noopener">GitHub</a>
  )}
</div>
```

## Content Migration Patterns

### From Hugo to Astro
1. **Frontmatter Compatibility**: Most YAML frontmatter translates directly
2. **Content Collections**: Replace Hugo's content organization
3. **URL Preservation**: Maintain SEO-friendly URLs with `[...slug].astro`
4. **Schema Validation**: Add Zod schemas for type safety

### Key Considerations
- Date handling: Use `z.coerce.date()` for string date conversion
- Optional fields: Liberal use of `.optional()` for gradual migration  
- Backward compatibility: Preserve existing URL structures
- Performance: Leverage Astro's static generation for speed