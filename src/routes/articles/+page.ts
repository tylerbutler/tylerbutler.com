import { getArticlesByYear } from '$lib/content/articles.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async () => {
  const articlesByYear = await getArticlesByYear();

  return {
    articlesByYear
  };
};