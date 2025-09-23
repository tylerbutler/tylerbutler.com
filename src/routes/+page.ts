import { getRecentArticles } from '$lib/content/articles.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async () => {
  const recentArticles = await getRecentArticles(5);

  return {
    recentArticles
  };
};