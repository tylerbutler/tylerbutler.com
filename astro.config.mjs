// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://tylerbutler.com',
  integrations: [
    svelte(),
    sitemap(),
    mdx()
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    optimizeDeps: {
      exclude: ['@fontsource/advent-pro', '@fontsource/lato']
    }
  }
});
