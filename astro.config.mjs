// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { visualizer } from "rollup-plugin-visualizer";
import netlify from "@astrojs/netlify";

import { downloadFonts } from "./scripts/download-fonts.mjs";
import { optimizeFonts } from "./scripts/optimize-fonts.mjs";

const fontDownloader = () => ({
	name: "font-downloader",
	hooks: {
		"astro:build:start": async () => {
			try {
				await downloadFonts();
			} catch (error) {
				const isProduction = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";

				if (isProduction) {
					console.error("Font download failed:", error.message);
					process.exit(1);
				} else {
					console.warn("⚠️  Font download failed (local dev - continuing anyway):", error.message);
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
				console.warn("⚠️  Font optimization failed (continuing anyway):", error.message);
			}
		},
	},
});

// https://astro.build/config
export default defineConfig({
	site: "https://tylerbutler.com",

	adapter: netlify(),

	integrations: [
		fontDownloader(),
		fontOptimizer(),
		svelte({
			compilerOptions: {
				experimental: {
					async: true,
				},
			},
		}),
		sitemap(),
		mdx(),
	],

	output: "static",

	build: {
		assets: "assets",
	},

	vite: {
		optimizeDeps: {
			exclude: ["@fontsource/lato"],
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
