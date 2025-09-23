import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			// Allow access to the content directory
			allow: ['.', './content']
		}
	},
	define: {
		global: 'globalThis',
	},
	optimizeDeps: {
		include: ['marked', 'gray-matter']
	}
});
