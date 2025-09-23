<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '../lib/styles/global.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Tyler Butler</title>
  <meta name="description" content="Personal website and blog of Tyler Butler" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://use.typekit.net/zsx5vsn.css" />
</svelte:head>

<div class="site-container">
  <Header />
  <main class="content-section">
    <div class="content-inner">
      {@render children()}
    </div>
  </main>
  <Footer />
</div>