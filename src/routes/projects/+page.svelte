<script lang="ts">
  // Projects page
</script>

<svelte:head>
  <title>Projects - Tyler Butler</title>
  <meta name="description" content="Projects and open source work by Tyler Butler" />
</svelte:head>

<section>
  <h2>Projects</h2>
  <p>
    A collection of projects I've worked on over the years, including open source
    contributions, personal projects, and experimental work.
  </p>

  <div class="projects-grid">
    <article class="project-card">
      <h3><a href="/projects/engineer">Engineer</a></h3>
      <p>A static site generator built in Python, designed for simplicity and flexibility.</p>
      <div class="project-links">
        <a href="https://github.com/tylerbutler/engineer" target="_blank" rel="noopener">GitHub</a>
      </div>
    </article>

    <article class="project-card">
      <h3><a href="/projects/xkcd2">XKCD2</a></h3>
      <p>A Firefox extension for enhanced XKCD comic browsing experience.</p>
      <div class="project-links">
        <a href="https://github.com/tylerbutler/xkcd2" target="_blank" rel="noopener">GitHub</a>
      </div>
    </article>

    <article class="project-card">
      <h3><a href="/projects/readycheck">ReadyCheck</a></h3>
      <p>A simple tool for checking service readiness and health status.</p>
      <div class="project-links">
        <a href="https://github.com/tylerbutler/readycheck" target="_blank" rel="noopener">GitHub</a>
      </div>
    </article>

    <article class="project-card">
      <h3><a href="/projects/tylerbutler.com">tylerbutler.com</a></h3>
      <p>This website - a personal blog and portfolio built with modern web technologies.</p>
      <div class="project-links">
        <a href="https://github.com/tylerbutler/tylerbutler.com-hugo" target="_blank" rel="noopener">GitHub</a>
      </div>
    </article>
  </div>
</section>

<style>
  .projects-grid {
    display: grid;
    gap: 2em;
    margin: 2em 0;
  }

  .project-card {
    padding: 1.5em;
    border: 1px solid #eee;
    border-radius: 4px;
    background: white;
  }

  .project-card h3 {
    margin: 0 0 0.5em 0;
    font-size: 20px;
    font-weight: 400;
  }

  .project-card h3 a {
    color: var(--text);
    text-decoration: none;
  }

  .project-card h3 a:hover {
    color: var(--accent);
  }

  .project-card p {
    margin: 0 0 1em 0;
    color: #666;
  }

  .project-links {
    display: flex;
    gap: 1em;
  }

  .project-links a {
    color: var(--accent);
    text-decoration: none;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .project-links a:hover {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    .projects-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
  }
</style>