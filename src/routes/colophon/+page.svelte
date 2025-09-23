<script lang="ts">
  // Colophon page
</script>

<svelte:head>
  <title>Colophon - Tyler Butler</title>
  <meta name="description" content="Technical details and credits for tylerbutler.com" />
</svelte:head>

<section>
  <h2>Colophon</h2>

  <p>
    A colophon is traditionally a brief statement containing information about the
    production of a book. In the digital world, it's become a place to share
    technical details about how a website is built and maintained.
  </p>

  <h3>Technology Stack</h3>
  <dl>
    <dt>Framework</dt>
    <dd>SvelteKit - A modern web framework built on Svelte</dd>

    <dt>Hosting</dt>
    <dd>Netlify - Fast, reliable static site hosting</dd>

    <dt>Typography</dt>
    <dd>Advent Pro, Lato, and adelle - Carefully chosen fonts for readability and character</dd>

    <dt>Source Code</dt>
    <dd><a href="https://github.com/tylerbutler/tylerbutler.com-hugo" target="_blank" rel="noopener">Available on GitHub</a></dd>
  </dl>

  <h3>Design</h3>
  <p>
    The design is intentionally minimal, focusing on readability and content.
    The color palette uses warm, muted tones with careful attention to typography
    and spacing. The layout is responsive and works well across different devices.
  </p>

  <h3>Content</h3>
  <p>
    All articles and content on this site are written by me unless otherwise noted.
    The site contains a digital archive of thoughts and experiences spanning more
    than two decades, from 2002 to the present.
  </p>

  <h3>Performance</h3>
  <p>
    The site is built as a static site for optimal performance. All pages are
    pre-rendered at build time, resulting in fast loading times and excellent
    SEO performance.
  </p>
</section>

<style>
  h3 {
    font-size: 20px;
    font-weight: 400;
    margin: 2em 0 1em 0;
    color: var(--accent);
  }

  dl {
    margin: 1.5em 0;
  }

  dt {
    font-weight: bold;
    margin-top: 1em;
    color: var(--text);
  }

  dd {
    margin: 0.25em 0 0 1em;
    color: #666;
  }
</style>