import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import brokenLinksChecker from "astro-broken-links-checker";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExpressiveCode from "rehype-expressive-code";
import { rehypeFootnotes } from "rehype-footnotes";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";
import { remarkLazyLinks } from "remark-lazy-links";
import { remarkShiftHeadings } from "remark-shift-headings";
import remarkSmartypants from "remark-smartypants";
import { visualizer } from "rollup-plugin-visualizer";
import { downloadFonts } from "./scripts/download-fonts.ts";
import { optimizeFonts } from "./scripts/optimize-fonts.ts";
import { expressiveCodeConfig } from "./src/lib/markdown-utils.ts";
import { rehypeMarkBrokenLinks } from "./src/lib/rehype-mark-broken-links.ts";
import { rehypeTagExternalLinks } from "./src/lib/rehype-tag-external-links.ts";
import { viteDotLottie } from "./src/lib/vite-plugin-dotlottie.ts";

const fontDownloader = () => ({
  name: "font-downloader",
  hooks: {
    "astro:build:start": async () => {
      try {
        await downloadFonts();
      } catch (error) {
        const isProduction =
          process.env.NODE_ENV === "production" ||
          process.env.NETLIFY === "true";

        if (isProduction) {
          console.error("Font download failed:", (error as Error).message);
          process.exit(1);
        } else {
          console.warn(
            "⚠️  Font download failed (local dev - continuing anyway):",
            (error as Error).message,
          );
        }
      }
    },
  },
});

const fontOptimizer = () => ({
  name: "font-optimizer",
  hooks: {
    "astro:build:done": async () => {
      try {
        await optimizeFonts();
      } catch (error) {
        console.warn(
          "⚠️  Font optimization failed (continuing anyway):",
          (error as Error).message,
        );
      }
    },
  },
});

const pagefindDevServer = () => ({
  name: "pagefind-dev-server",
  configureServer(server: {
    middlewares: {
      use: (
        handler: (
          req: { url?: string },
          res: {
            setHeader: (k: string, v: string) => void;
          } & NodeJS.WritableStream,
          next: () => void,
        ) => void,
      ) => void;
    };
  }) {
    const pagefindDir = path.resolve("dist/pagefind");
    const contentTypes: Record<string, string> = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".wasm": "application/wasm",
    };
    let warned = false;
    server.middlewares.use((req, res, next) => {
      if (!req.url?.startsWith("/pagefind/")) return next();
      const rel = req.url.replace(/^\/pagefind\//, "").split("?")[0];
      const filePath = path.join(pagefindDir, rel);
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        if (!warned) {
          console.warn(
            "⚠️  /pagefind/ not found — run `pnpm build` once to enable dev-mode search",
          );
          warned = true;
        }
        return next();
      }
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader(
        "Content-Type",
        contentTypes[ext] ?? "application/octet-stream",
      );
      fs.createReadStream(filePath).pipe(res);
    });
  },
});

const pagefindIntegration = () => ({
  name: "pagefind-integration",
  hooks: {
    "astro:build:done": async ({ dir }: { dir: URL }) => {
      try {
        console.log("🔍 Building Pagefind search index...");
        execSync(`npx pagefind --site "${dir.pathname}"`, {
          stdio: "inherit",
        });
        console.log("✅ Pagefind search index built successfully");
      } catch (error) {
        console.error("❌ Pagefind indexing failed:", (error as Error).message);
        throw error;
      }
    },
  },
});

// https://astro.build/config
export default defineConfig({
  site: "https://tylerbutler.com",

  adapter: netlify({
    imageCDN: false,
  }),
  output: "static",

  integrations: [
    icon(),
    fontDownloader(),
    fontOptimizer(),
    pagefindIntegration(),
    sitemap(),
    mdx({
      remarkPlugins: [
        // Process lazy links first, before other transformations
        // Use [remarkLazyLinks, { persist: true }] to write changes back to source files
        remarkLazyLinks,
        remarkGfm,
        remarkSmartypants as never,
        // Disabled since mermaid is not used
        // [remarkMermaidConfigured, { destinationSubdir: "diagrams" }],
        [remarkGithubBlockquoteAlert, { tagName: "blockquote" }],
        remarkShiftHeadings,
      ],
      rehypePlugins: [
        rehypeFootnotes,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: {
              className: ["heading-anchor"],
              ariaLabel: "Link to this heading",
            },
          },
        ],
        [rehypeExpressiveCode, expressiveCodeConfig],
        rehypeMarkBrokenLinks,
        rehypeTagExternalLinks,
      ],
    }),
    brokenLinksChecker({
      checkExternalLinks: false,
    }),
  ],
  image: {
    responsiveStyles: true,
    layout: "constrained", // Generates srcset for responsive images
  },
  markdown: {
    syntaxHighlight: false, // Disable Astro's built-in syntax highlighting to use Expressive Code
    remarkPlugins: [
      // Process lazy links first, before other transformations
      // Use [remarkLazyLinks, { persist: true }] to write changes back to source files
      remarkLazyLinks,
      remarkGfm,
      remarkSmartypants as never,
      // Disabled since mermaid is not used
      // [remarkMermaidConfigured, { destinationSubdir: "diagrams" }],
      [remarkGithubBlockquoteAlert, { tagName: "blockquote" }],
      remarkShiftHeadings,
    ],
    rehypePlugins: [
      rehypeFootnotes,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["heading-anchor"],
            ariaLabel: "Link to this heading",
          },
        },
      ],
      [rehypeExpressiveCode, expressiveCodeConfig],
      rehypeMarkBrokenLinks,
      rehypeTagExternalLinks,
    ],
  },

  build: {
    assets: "assets",
  },

  vite: {
    ssr: {
      // noExternal: ["simple-icons-astro"],
    },
    optimizeDeps: {
      exclude: [
        // "@fontsource/lato",
      ],
    },
    build: {
      assetsInlineLimit(filePath: string) {
        // Never inline .lottie files — they're binary (ZIP) and should be
        // served as separate assets with proper caching.
        if (filePath.endsWith(".lottie")) return false;
        return undefined; // default for everything else
      },
    },
    plugins: [
      viteDotLottie(),
      pagefindDevServer(),
      // Only generate bundle analysis in production builds
      process.env.NODE_ENV === "production" &&
        visualizer({
          filename: "dist/bundle-analysis.html",
          open: false,
          gzipSize: true,
          brotliSize: true,
          template: "treemap", // treemap, sunburst, network
        }),
    ].filter(Boolean),
  },
});
