import rehypeExpressiveCode, { ExpressiveCodeTheme, type ExpressiveCodeConfig } from 'rehype-expressive-code';
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import remarkMermaid from 'remark-mermaid';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { remarkNormalizeHeadings } from './remark-normalize-headings.ts';
import { rehypeFootnotes } from './footnotes.js';

// Load themes
import ayuLightJson from './themes/ayu-light.json';
import ayuMirageJson from './themes/ayu-mirage.json';
import oneDarkJson from './themes/OneDark.json';

const ayuLight = new ExpressiveCodeTheme(ayuLightJson);
const ayuMirage = new ExpressiveCodeTheme(ayuMirageJson);
const oneDark = new ExpressiveCodeTheme(oneDarkJson)

const themes = [
  ayuLight, // light
  ayuMirage, // dark
];

/**
 * Centralized Expressive Code configuration
 * Used by astro.config.mjs for consistent syntax highlighting across the site
 */
export const expressiveCodeConfig: ExpressiveCodeConfig = {
  themes,
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme: ExpressiveCodeTheme) => {
    // Map themes to our CSS classes
    if (theme.name === themes[0].name) {
      return '.light';
    }
    if (theme.name === themes[1].name) {
      return '.dark';
    }
    return ':root'; // fallback
  },
  defaultProps: {
    wrap: false,
    showLineNumbers: false,
    overridesByLang: {
      'js,ts,html,python,rust,csharp': {
        showLineNumbers: true,
      },
    },
  },
  plugins: [pluginLineNumbers()],
  styleOverrides: {
    codeFontFamily: 'var(--code-font)',
    codeFontSize: 'var(--code-font-size)',
    codePaddingBlock: '1.5rem',
    codePaddingInline: '1.5rem',
  }
}

/**
 * Creates a unified processor with the same plugins as Astro's markdown config
 * This ensures consistency between Astro's built-in rendering and custom rendering
 *
 * @param headingLevel - Optional override for heading normalization (default: auto-detect)
 * @returns Configured unified processor
 */
function createMarkdownProcessor(headingLevel?: number) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkMermaid)
    .use(remarkGithubBlockquoteAlert);

  // Add heading normalization with optional override
  if (headingLevel !== undefined) {
    processor.use(remarkNormalizeHeadings, {
      defaultCollectionLevel: headingLevel,
      defaultPageLevel: headingLevel,
    });
  } else {
    processor.use(remarkNormalizeHeadings);
  }

  return processor
    .use(remarkRehype)
    .use(rehypeFootnotes)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Link to this heading",
      },
    })
    .use(rehypeExpressiveCode, expressiveCodeConfig)
    .use(rehypeStringify);
}

/**
 * Renders markdown with the full Astro pipeline, optionally overriding heading level
 * Use this for custom rendering that needs to match Astro's built-in markdown processing
 *
 * @param markdownContent - Raw markdown content
 * @param headingLevel - Optional heading level override (e.g., 3 for h3)
 * @returns HTML string with all plugins applied
 */
export async function renderMarkdownWithPipeline(
  markdownContent: string,
  headingLevel?: number
): Promise<string> {
  const processor = createMarkdownProcessor(headingLevel);
  const result = await processor.process(markdownContent);
  return String(result);
}

/**
 * Creates a preview version of article content with shifted headings for homepage display
 * This ensures proper heading hierarchy when article content appears under h2 article titles
 * Uses the full Astro markdown pipeline including ExpressiveCode and all other plugins
 *
 * Supports <!--more--> separator for excerpts:
 * - Content before <!--more--> is shown on homepage
 * - Footnote markers are stripped from excerpts (footnotes only appear in full articles)
 * - Returns full content if no <!--more--> separator is found
 *
 * @param markdownContent - Raw article markdown content
 * @returns Object with HTML and whether content was truncated
 */
export async function createHomepagePreview(markdownContent: string): Promise<{ html: string; isTruncated: boolean }> {
  const moreIndex = markdownContent.indexOf('<!--more-->');

  if (moreIndex === -1) {
    // No separator, render full content
    const html = await renderMarkdownWithPipeline(markdownContent, 3);
    return { html, isTruncated: false };
  }

  // Extract excerpt and strip all footnote markers
  const excerpt = markdownContent.substring(0, moreIndex);
  const excerptWithoutFootnotes = excerpt.replace(/\[\^(\w+)\]/g, '');

  const html = await renderMarkdownWithPipeline(excerptWithoutFootnotes, 3);
  return { html, isTruncated: true };
}
