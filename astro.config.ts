import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { visualizer } from "rollup-plugin-visualizer";
import netlify from "@astrojs/netlify";
import remarkGithubBlockquoteAlert from "remark-github-blockquote-alert";
import brokenLinksChecker from "astro-broken-links-checker";

import { downloadFonts } from "./scripts/download-fonts.ts";
import { optimizeFonts } from "./scripts/optimize-fonts.ts";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkMermaid from "remark-mermaid";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExpressiveCode from "rehype-expressive-code";
import { remarkNormalizeHeadings } from "./src/lib/remark-normalize-headings.ts";
import { rehypeMarkBrokenLinks } from "./src/lib/rehype-mark-broken-links.ts";
import { rehypeFootnotes } from "./src/lib/footnotes.js";
import { expressiveCodeConfig } from "./src/lib/markdown-utils.ts";
import { execSync } from "node:child_process";

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

const pagefindIntegration = () => ({
	name: "pagefind-integration",
	hooks: {
		"astro:build:done": async ({ dir }) => {
			try {
				console.log("🔍 Building Pagefind search index...");
				execSync(`npx pagefind --site "${dir.pathname}"`, {
					stdio: "inherit",
				});
				console.log("✅ Pagefind search index built successfully");
			} catch (error) {
				console.error(
					"❌ Pagefind indexing failed:",
					(error as Error).message,
				);
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
		fontDownloader(),
		// TODO: Re-enable font optimizer once Chrome/Puppeteer is configured for glyphhanger
		// fontOptimizer(),
		pagefindIntegration(),
		sitemap(),
		mdx({
			remarkPlugins: [
				remarkGfm,
				remarkSmartypants,
				remarkMermaid,
				remarkGithubBlockquoteAlert,
				remarkNormalizeHeadings,
			],
			rehypePlugins: [
				rehypeFootnotes,
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
			],
		}),
		brokenLinksChecker({
			checkExternalLinks: false,
		}),
	],
	image: {
		responsiveStyles: true,
		layout: 'constrained', // Generates srcset for responsive images
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'via.placeholder.com',
			},
		],
	},
	markdown: {
		remarkPlugins: [
			remarkGfm,
			remarkSmartypants,
			remarkMermaid,
			remarkGithubBlockquoteAlert,
			remarkNormalizeHeadings,
		],
		rehypePlugins: [
			rehypeFootnotes,
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
		],
	},

	build: {
		assets: "assets",
	},

	vite: {
		ssr: {
			// Externalize Lucide to prevent SSR bundling issues
			noExternal: ["@lucide/astro"],
		},
		optimizeDeps: {
			exclude: [
				// "@fontsource/lato",
			],
		},
		plugins: [
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
