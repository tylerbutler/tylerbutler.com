import type { PageServerLoad } from './$types.js';
import { loadArticle } from '$lib/content/articles.js';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { year, month, slug } = params;

  const article = await loadArticle(year, month, slug);

  if (!article) {
    throw error(404, {
      message: 'Article not found'
    });
  }

  return {
    article
  };
};