import { loadArticle } from '$lib/content/articles.js';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ params }) => {
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