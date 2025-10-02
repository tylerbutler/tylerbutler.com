import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
  const articles = await getCollection('articles', ({ data }) => {
    return !data.draft;
  });

  const sortedArticles = articles.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Tyler Butler',
    description: 'Personal website and blog of Tyler Butler, featuring articles on technology, programming, and more.',
    site: context.site,
    items: sortedArticles.map((article) => {
      const date = new Date(article.data.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const slug = article.data.slug || article.slug;

      return {
        title: article.data.title,
        pubDate: article.data.date,
        description: article.data.description || article.data.title,
        content: sanitizeHtml(parser.render(article.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
        }),
        link: `/${year}/${month}/${slug}/`,
      };
    }),
    customData: `<language>en-us</language>`,
  });
}
