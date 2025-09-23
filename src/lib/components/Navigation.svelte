<script lang="ts">
  import { page } from '$app/stores';

  // Navigation items matching the current Hugo site structure
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/projects', label: 'Projects' },
    { href: '/about', label: 'About' },
    { href: '/colophon', label: 'Colophon' },
  ];
</script>

<nav class="main-navigation visible">
  <ul>
    {#each navItems as item}
      <li>
        <a
          href={item.href}
          class:active={$page.url.pathname === item.href}
          aria-current={$page.url.pathname === item.href ? 'page' : undefined}
        >
          {item.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>