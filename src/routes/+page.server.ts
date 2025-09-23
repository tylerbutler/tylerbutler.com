import type { PageServerLoad } from './$types.js';
import { getRecentArticles } from '$lib/content/articles.js';

export const load: PageServerLoad = async () => {
  const recentArticles = await getRecentArticles(5);

  return {
    recentArticles
  };
};