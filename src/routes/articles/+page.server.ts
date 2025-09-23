import type { PageServerLoad } from './$types.js';
import { getArticlesByYear } from '$lib/content/articles.js';

export const load: PageServerLoad = async () => {
  const articlesByYear = await getArticlesByYear();

  return {
    articlesByYear
  };
};