<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import '../lib/styles/global.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Tyler Butler</title>
  <meta name="description" content="Personal website and blog of Tyler Butler" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="site-container">
  <Header />
  <Navigation />
  <main class="content-section">
    <div class="content-inner">
      {@render children()}
    </div>
  </main>
</div>