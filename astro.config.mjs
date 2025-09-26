// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { visualizer } from 'rollup-plugin-visualizer';

import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

// https://astro.build/config
export default defineConfig({
	site: "https://tylerbutler.com",
	integrations: [
		svelte(),
		sitemap(),
		expressiveCode({
			themes: [
				"catppuccin-latte",  // light theme
				"catppuccin-frappe", // dark theme
			],
			useDarkModeMediaQuery: false,
			themeCssSelector: (theme) => {
				// Map Catppuccin themes to our CSS classes
				if (theme.name === 'catppuccin-latte') {
					return '.light';
				}
				if (theme.name === 'catppuccin-frappe') {
					return '.dark';
				}
				return ':root'; // fallback
			},
			defaultProps: {
				wrap: false,
				// Disable line numbers by default
				showLineNumbers: false,
				// But enable line numbers for certain languages
				overridesByLang: {
					"js,ts,html,python,rust,csharp": {
						showLineNumbers: true,
					},
				},
			},
			plugins: [pluginLineNumbers()],
		}),
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
			process.env.NODE_ENV === 'production' && visualizer({
				filename: 'dist/bundle-analysis.html',
				open: false,
				gzipSize: true,
				brotliSize: true,
				template: 'treemap' // treemap, sunburst, network
			})
		].filter(Boolean)
	},
});
