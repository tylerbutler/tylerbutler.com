// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { visualizer } from 'rollup-plugin-visualizer';

import expressiveCode from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
// import { pluginColorChips } from 'expressive-code-color-chips';
import ecTwoSlash from "expressive-code-twoslash";

// https://astro.build/config
export default defineConfig({
	site: "https://tylerbutler.com",
	integrations: [
		svelte(),
		sitemap(),
		expressiveCode({
			themes: [
				// "github-dark",
				// "github-light",
				"catppuccin-latte",
				"catppuccin-frappe",
			],
			useDarkModeMediaQuery: true,
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
			plugins: [
				pluginLineNumbers(),
				// pluginColorChips()
				ecTwoSlash(),
			],
		}),
		mdx(),
	],
	output: "static",
	build: {
		assets: "assets",
	},
	vite: {
		optimizeDeps: {
			exclude: ["@fontsource/advent-pro", "@fontsource/lato"],
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
