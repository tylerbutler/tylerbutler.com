# Server-Side Code Block Processing in Astro

Documentation of approaches to process ``` code blocks in markdown content within Astro sites at build/server time rather than client-side.

## Current Situation

- **Client-side enhancement**: `enhance-code-blocks.js` script adds copy buttons and language indicators after page load
- **Issues**: Flash of Unstyled Content (FOUC), dependency on JavaScript, potential styling delays
- **Goal**: Move code block enhancement to build time for better performance and reliability

## Available Solutions

### 1. Astro Expressive Code (Recommended)

**Best overall solution** for 2024 - officially supported by Astro team.

#### Installation
```bash
npx astro add astro-expressive-code
```

#### Configuration
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      defaultProps: {
        wrap: true,
        showLineNumbers: false,
      }
    }),
    mdx() // Must come AFTER expressiveCode
  ]
});
```

#### Advanced Configuration
```js
const astroExpressiveCodeOptions = {
  themes: ["rose-pine", "rose-pine-dawn"],
  useDarkModeMediaQuery: true,
  themeCssRoot: ":root",
  themeCssSelector: theme => `[data-theme='${theme.name === "dark" ? "dark" : "light"}']`,
  defaultProps: {
    wrap: true,
    overridesByLang: {
      "bash,ps,sh": { preserveIndent: false }
    }
  }
};
```

#### Pros
- ✅ **Zero client-side JavaScript**
- ✅ **Built-in copy buttons**
- ✅ **Automatic theme optimization** (1MB+ bundle reduction)
- ✅ **Easy installation** via Astro CLI
- ✅ **Official Astro integration**
- ✅ **Works with existing markdown**
- ✅ **Line highlighting, line numbers, editor frames**

#### Cons
- ❌ Limited customization compared to rehype plugins

### 2. Rehype Pretty Code

**Most feature-rich** but requires more setup.

#### Installation
```bash
npm install rehype-pretty-code
```

#### Basic Configuration
```js
// astro.config.mjs
import rehypePrettyCode from 'rehype-pretty-code';

export default defineConfig({
  markdown: {
    syntaxHighlight: false, // Disable Astro's built-in
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'github-dark',
        keepBackground: false,
        defaultLang: 'plaintext'
      }]
    ]
  }
});
```

#### Advanced Configuration with Copy Button
```js
import rehypePrettyCode from "rehype-pretty-code";
import { transformerCopyButton } from "@rehype-pretty/transformers";

export default defineConfig({
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: "github-dark",
        transformers: [
          transformerCopyButton({
            visibility: "hover",
            feedbackDuration: 3000,
          }),
        ],
      }],
    ],
  },
});
```

#### Required CSS (Unstyled by default)
```css
/* Basic code block styling */
[data-rehype-pretty-code-figure] {
  margin: 1.5em 0;
}

[data-rehype-pretty-code-title] {
  background: #0d1117;
  color: #c9d1d9;
  padding: 0.75em 1em;
  font-family: ui-monospace, 'Courier New', monospace;
  font-size: 0.875em;
  border-bottom: 1px solid #30363d;
}

/* Copy button styles */
[data-rehype-pretty-code-figure] pre {
  position: relative;
}

/* Line highlighting */
[data-highlighted-line] {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0 1em;
  margin: 0 -1em;
}
```

#### Pros
- ✅ **Maximum customization**
- ✅ **Advanced highlighting features** (line highlighting, character highlighting)
- ✅ **Server-side processing**
- ✅ **Copy button support** (via transformers)
- ✅ **Title, caption, line numbers support**
- ✅ **Uses any VSCode theme**

#### Cons
- ❌ **More complex setup**
- ❌ **Requires manual CSS**
- ❌ **No automatic optimizations**
- ❌ **"A lot of effort to get decent syntax highlighting working"**

### 3. Astro's Built-in Code Component

For programmatic use in `.astro` files.

#### Usage
```astro
---
import { Code } from 'astro:components';
---
<Code
  code={`const hello = 'world';`}
  lang="js"
  theme="github-dark"
  wrap
  transformers={[transformerMetaHighlight()]}
  meta="{1,3}"
/>
```

#### Configuration in astro.config.mjs
```js
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      // Or multiple themes for light/dark mode
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
      transformers: [], // Custom transformers
    },
  },
});
```

#### Pros
- ✅ **Built-in to Astro**
- ✅ **Full Shiki integration**
- ✅ **Server-side rendered**
- ✅ **Supports transformers**

#### Cons
- ❌ **Only for `.astro` files**
- ❌ **Not for markdown content**
- ❌ **Requires manual component usage**

### 4. Custom Remark/Rehype Plugins

Build your own solution using Astro's plugin system.

#### Example Plugin
```js
// custom-code-plugin.mjs
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function customCodePlugin() {
  return function (tree, file) {
    // Transform code blocks in the AST
    // Add custom attributes, wrappers, etc.
    file.data.astro.frontmatter.customProperty = 'Generated property';
  };
}
```

#### Configuration
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { customCodePlugin } from './custom-code-plugin.mjs';

export default defineConfig({
  markdown: {
    remarkPlugins: [customCodePlugin], // Processes markdown AST
    rehypePlugins: [customRehypePlugin] // Processes HTML AST
  }
});
```

#### Pros
- ✅ **Complete control**
- ✅ **Custom logic**
- ✅ **Integration with other plugins**

#### Cons
- ❌ **Requires AST knowledge**
- ❌ **Development time**
- ❌ **Maintenance burden**

### 5. MDX Custom Component Mapping

For MDX files only - map code blocks to custom components.

#### Usage
```mdx
---
// In your .mdx file
import CustomCodeBlock from '../components/CustomCodeBlock.astro';

export const components = {
  code: CustomCodeBlock,
  pre: CustomCodeBlock
};
---

```js
const hello = 'world';
```
```

#### Pros
- ✅ **Full component control**
- ✅ **Astro component features**
- ✅ **Server-side rendered**

#### Cons
- ❌ **MDX only**
- ❌ **Manual mapping required**
- ❌ **Not for regular markdown**

## Performance Comparison

| Solution | Bundle Impact | Setup Complexity | Features | Maintenance |
|----------|---------------|------------------|----------|-------------|
| **Expressive Code** | **-1MB+ (optimized)** | **Low** | **High** | **Low** |
| **Rehype Pretty Code** | Neutral | High | Very High | Medium |
| **Built-in Code Component** | Neutral | Low | Medium | Low |
| **Custom Plugin** | Variable | Very High | Custom | High |
| **MDX Mapping** | Neutral | Medium | High | Medium |

## Migration Recommendation

For the current tylerbutler.com site:

### Recommended: Astro Expressive Code

**Why**: Best balance of features, performance, and ease of implementation.

#### Migration Steps
1. **Install**: `npx astro add astro-expressive-code`
2. **Configure** (optional themes/options in astro.config.mjs)
3. **Remove**: `enhance-code-blocks.js` script from BaseLayout.astro
4. **Test**: Verify all existing code blocks work
5. **Cleanup**: Remove client-side CSS for code block enhancements

#### Configuration for tylerbutler.com
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://tylerbutler.com',
  integrations: [
    svelte(),
    sitemap(),
    expressiveCode({
      themes: ['github-dark'],
      defaultProps: {
        wrap: true,
      }
    }),
    mdx()
  ],
  // ... rest of config
});
```

### Benefits of Migration
- ✅ **Eliminates FOUC** - no client-side enhancement needed
- ✅ **Better Performance** - no JavaScript execution for code blocks
- ✅ **Improved Core Web Vitals** - faster page loads
- ✅ **Zero Breaking Changes** - all existing markdown works
- ✅ **Enhanced Features** - built-in copy buttons, themes, highlighting
- ✅ **Future Proof** - official Astro integration with ongoing support

## References

- [Expressive Code Documentation](https://expressive-code.com/)
- [Rehype Pretty Code](https://rehype-pretty.pages.dev/)
- [Astro Syntax Highlighting Guide](https://docs.astro.build/en/guides/syntax-highlighting/)
- [Astro Markdown Content Guide](https://docs.astro.build/en/guides/markdown-content/)
- [Astro MDX Integration](https://docs.astro.build/en/guides/integrations-guide/mdx/)