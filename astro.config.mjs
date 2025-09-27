// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import { visualizer } from 'rollup-plugin-visualizer';


import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://tylerbutler.com",

  adapter: netlify(),
	
	integrations: [
      svelte({
        compilerOptions: {
          experimental: {
            async: true
          }
        }
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