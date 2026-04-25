# Tinylytics for Astro

Unstyled, fully-typed Astro components for [Tinylytics](https://tinylytics.app),
the privacy-first analytics service. Every script parameter and widget element
documented at <https://tinylytics.app/docs> is exposed as a typed prop, so you
can wire up tracking without hand-writing embed URLs or remembering CSS class
names.

## Components

| Component    | Purpose                                                    | Tinylytics docs |
| ------------ | ---------------------------------------------------------- | --------------- |
| `Script`     | Loads the embed `<script>` with all options as props       | [embed](https://tinylytics.app/docs/embedding_your_script) |
| `Hits`       | Hit counter widget (`tinylytics_hits`)                     | [hits](https://tinylytics.app/docs/show_hit_counter) |
| `Kudos`      | Kudos / like button (`tinylytics_kudos`)                   | [kudos](https://tinylytics.app/docs/showing_kudos) |
| `Uptime`     | Uptime percentage badge (`tinylytics_uptime`)              | [uptime](https://tinylytics.app/docs/showing_uptime) |
| `Countries`  | Visitor country flags (`tinylytics_countries`)             | [countries](https://tinylytics.app/docs/showing_countries) |
| `Webring`    | Random webring link, optional avatar (`tinylytics_webring`)| [webring](https://tinylytics.app/docs/showing_webring) |
| `Event`      | Wraps any element with `data-tinylytics-event*` attributes | [events](https://tinylytics.app/docs/event_tracking) |
| `Pixel`      | No-JS tracking pixel for RSS feeds and HTML email          | [pixel](https://tinylytics.app/docs/pixel_tracking) |

## Quick start

```astro
---
import { Script, Hits, Kudos, Webring, Event } from "@lib/tinylytics";
---

<Script
  embedCode="YOUR_EMBED_CODE"
  hits
  kudos
  events
  beacon
  webring="avatars"
  min
/>

<footer>
  Lifetime hits: <Hits /> · Uptime: <Uptime />
  <Webring avatar>🕸️ Visit a random site 💍</Webring>
</footer>

<article>
  <h1>Hello world</h1>
  <Kudos path="/posts/hello-world">👋 like this post</Kudos>

  <Event name="file.download" value="resume.pdf" as="a" href="/resume.pdf">
    Download résumé
  </Event>
</article>
```

## `Script` props

| Prop         | Type                                | URL parameter            |
| ------------ | ----------------------------------- | ------------------------ |
| `embedCode`  | `string` (required)                 | path segment             |
| `min`        | `boolean`                           | `/min.js` URL            |
| `spa`        | `boolean`                           | `?spa`                   |
| `ignore`     | `boolean`                           | `?ignore`                |
| `hits`       | `true \| "unique"`                  | `?hits` / `?hits=unique` |
| `kudos`      | `true \| "custom" \| string`        | `?kudos` / `?kudos=custom` / `?kudos=<emoji>` |
| `uptime`     | `boolean`                           | `?uptime`                |
| `countries`  | `boolean`                           | `?countries`             |
| `webring`    | `true \| "avatars"`                 | `?webring` / `?webring=avatars` |
| `events`     | `boolean`                           | `?events`                |
| `beacon`     | `boolean`                           | `?beacon`                |
| `defer`      | `boolean` (default `true`)          | adds `defer` attribute   |

## Using with Starlight

Override Starlight's `Head` (or `Footer`) component and drop `<Script />` in:

```astro
---
// src/components/Head.astro
import Default from "@astrojs/starlight/components/Head.astro";
import { Script } from "@lib/tinylytics";
---

<Default><slot /></Default>
<Script embedCode="YOUR_EMBED_CODE" hits events beacon spa />
```

```js
// astro.config.ts
starlight({
  components: { Head: "./src/components/Head.astro" },
});
```

The widget components (`Hits`, `Kudos`, etc.) work directly inside MDX.

## RSS / email pixel

```astro
---
import { Pixel } from "@lib/tinylytics";
const { post } = Astro.props;
---
<article set:html={post.html} />
<Pixel embedCode="YOUR_EMBED_CODE" path={`/posts/${post.slug}`} />
```

## Event names

Tinylytics requires `category.action` format. The script auto-converts
`category->action` to `category.action`. Use the `value` prop to disambiguate
similar events.

## Privacy

Tinylytics does not use cookies, local storage, or fingerprinting. See
[their privacy docs](https://tinylytics.app/docs/privacy) for details.
