<script lang="ts">
  import type { PageData } from './$types.js';

  export let data: PageData;
</script>

<svelte:head>
  <title>{data.article.metadata.title} - Tyler Butler</title>
  <meta name="description" content={data.article.metadata.excerpt || `Article by Tyler Butler: ${data.article.metadata.title}`} />
  {#if data.article.metadata.tags}
    <meta name="keywords" content={data.article.metadata.tags.join(', ')} />
  {/if}
</svelte:head>

<article class="article-content">
  <header class="article-header">
    <h2>{data.article.metadata.title}</h2>
    <div class="article-meta">
      <time datetime={data.article.metadata.date}>
        {new Date(data.article.metadata.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
      {#if data.article.metadata.tags && data.article.metadata.tags.length > 0}
        <div class="tags">
          {#each data.article.metadata.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      {/if}
    </div>
  </header>

  <div class="article-body">
    {@html data.article.html}
  </div>

  <footer class="article-footer">
    <nav class="article-nav">
      <a href="/articles">← Back to Articles</a>
    </nav>
  </footer>
</article>

<style>
  .article-content {
    max-width: 100%;
  }

  .article-header {
    margin-bottom: 2em;
    padding-bottom: 1em;
    border-bottom: 1px solid #eee;
  }

  .article-header h2 {
    margin-bottom: 0.5em;
  }

  .article-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  .article-meta time {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    background: #f0f0f0;
    color: #666;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .article-body {
    line-height: 1.7;
  }

  .article-body :global(h1),
  .article-body :global(h2),
  .article-body :global(h3),
  .article-body :global(h4),
  .article-body :global(h5),
  .article-body :global(h6) {
    margin: 1.5em 0 0.5em 0;
    color: var(--text);
  }

  .article-body :global(h1) { font-size: 24px; }
  .article-body :global(h2) { font-size: 22px; }
  .article-body :global(h3) { font-size: 20px; }
  .article-body :global(h4) { font-size: 18px; }

  .article-body :global(p) {
    margin: 1em 0;
  }

  .article-body :global(blockquote) {
    margin: 1.5em 0;
    padding: 1em 1.5em;
    background: #f8f8f8;
    border-left: 4px solid var(--accent);
    font-style: italic;
  }

  .article-body :global(pre) {
    background: #f5f5f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.4;
  }

  .article-body :global(code) {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 2px;
    font-size: 13px;
  }

  .article-body :global(pre code) {
    background: none;
    padding: 0;
  }

  .article-body :global(ul),
  .article-body :global(ol) {
    margin: 1em 0;
    padding-left: 2em;
  }

  .article-body :global(li) {
    margin: 0.5em 0;
  }

  .article-footer {
    margin-top: 3em;
    padding-top: 2em;
    border-top: 1px solid #eee;
  }

  .article-nav a {
    color: var(--accent);
    text-decoration: none;
    font-size: 14px;
  }

  .article-nav a:hover {
    text-decoration: underline;
  }
</style>