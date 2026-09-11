/**
 * Astro components for Tinylytics — a privacy-first analytics service.
 *
 * The package mirrors every script parameter and widget element documented at
 * https://tinylytics.app/docs and is designed to drop into any Astro site
 * (including Starlight). Components are unstyled by default; consumers
 * provide their own CSS.
 *
 * Typical setup (e.g. in `BaseLayout.astro` or a Starlight `Head` override):
 *
 *   <Script embedCode="YOUR_CODE" hits kudos events beacon />
 *
 * Then drop widgets where you want them:
 *
 *   <Hits />              ← lifetime hit counter
 *   <Kudos path="/post" /> ← like button for the current post
 *   <Uptime />            ← uptime percentage
 *   <Countries />         ← visitor country flags
 *   <Webring avatar />    ← random webring member
 *
 * For RSS / email contexts use the no-JS pixel:
 *
 *   <Pixel embedCode="YOUR_CODE" path="/posts/hello" />
 */

export { default as Countries } from "./Countries.astro";
export { default as Event } from "./Event.astro";
export { default as Hits } from "./Hits.astro";
export { default as Kudos } from "./Kudos.astro";
export { default as Pixel } from "./Pixel.astro";
export { default as Script } from "./Script.astro";
export type {
  EventProps,
  KudosProps,
  PixelProps,
  ScriptProps,
  WebringProps,
  WidgetProps,
} from "./types.ts";
export { default as Uptime } from "./Uptime.astro";
export { default as Webring } from "./Webring.astro";
