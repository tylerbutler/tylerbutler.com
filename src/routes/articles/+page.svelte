<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;
</script>

<svelte:head>
  <title>Articles - Tyler Butler</title>
  <meta name="description" content="Blog articles by Tyler Butler covering technology, programming, and various other topics." />
</svelte:head>

<section>
  <h2>Articles</h2>
  <p>
    A collection of articles I've written over the years, covering topics from web development
    to technology trends and personal experiences.
  </p>

  {#if data.articlesByYear}
    {#each Object.entries(data.articlesByYear).sort(([a], [b]) => parseInt(b) - parseInt(a)) as [year, articles]}
      <section class="year-section">
        <h3>{year}</h3>
        <ul class="article-list">
          {#each articles as article}
            <li>
              <article class="article-preview">
                <h4>
                  <a href="/articles/{article.year}/{article.month}/{article.slug}">
                    {article.title}
                  </a>
                </h4>
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
                {#if article.tags && article.tags.length > 0}
                  <div class="tags">
                    {#each article.tags as tag}
                      <span class="tag">{tag}</span>
                    {/each}
                  </div>
                {/if}
              </article>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {:else}
    <p>No articles found.</p>
  {/if}
</section>

<style>
  .year-section {
    margin: 2em 0;
  }

  .year-section h3 {
    font-size: 22px;
    font-weight: 400;
    color: var(--accent);
    margin-bottom: 1em;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5em;
  }

  .article-list {
    list-style: none;
    padding: 0;
  }

  .article-preview {
    margin-bottom: 1.5em;
    padding-bottom: 1em;
    border-bottom: 1px solid #f0f0f0;
  }

  .article-preview:last-child {
    border-bottom: none;
  }

  .article-preview h4 {
    margin: 0 0 0.5em 0;
    font-size: 18px;
    font-weight: 400;
  }

  .article-preview h4 a {
    color: var(--text);
    text-decoration: none;
  }

  .article-preview h4 a:hover {
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

  .tags {
    margin-top: 0.5em;
  }

  .tag {
    display: inline-block;
    background: #f0f0f0;
    color: #666;
    font-size: 11px;
    padding: 2px 6px;
    margin-right: 4px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>