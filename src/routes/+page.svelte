<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;
</script>

<svelte:head>
  <title>Tyler Butler - Personal Website</title>
  <meta name="description" content="Personal website and blog of Tyler Butler, featuring articles on technology, programming, and more." />
</svelte:head>

<section>
  <h2>Welcome</h2>
  <p>
    This is the personal website of Tyler Butler. Here you'll find articles about technology,
    programming, and various other topics that interest me. The site contains content dating
    back to 2002, providing a long history of thoughts and experiences.
  </p>

  <h2>Recent Articles</h2>
  <p>
    Browse through my collection of articles covering web development, software engineering,
    and technology trends over the years.
  </p>

  {#if data.recentArticles && data.recentArticles.length > 0}
    <ul class="recent-articles">
      {#each data.recentArticles as article}
        <li>
          <article class="article-preview">
            <h3>
              <a href="/articles/{article.year}/{article.month}/{article.slug}">
                {article.title}
              </a>
            </h3>
            <time datetime={article.date}>
              {new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            {#if article.excerpt}
              <p class="excerpt">{article.excerpt}</p>
            {/if}
          </article>
        </li>
      {/each}
    </ul>
  {/if}

  <p>
    <a href="/articles">View All Articles</a>
  </p>
</section>

<style>
  .recent-articles {
    list-style: none;
    padding: 0;
    margin: 2em 0;
  }

  .article-preview {
    margin-bottom: 1.5em;
    padding-bottom: 1em;
    border-bottom: 1px solid #f0f0f0;
  }

  .article-preview:last-child {
    border-bottom: none;
  }

  .article-preview h3 {
    margin: 0 0 0.5em 0;
    font-size: 18px;
    font-weight: 400;
  }

  .article-preview h3 a {
    color: var(--text);
    text-decoration: none;
  }

  .article-preview h3 a:hover {
    color: var(--accent);
  }

  .article-preview time {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .excerpt {
    margin: 0.5em 0;
    font-size: 13px;
    line-height: 1.6;
    color: #555;
  }
</style>