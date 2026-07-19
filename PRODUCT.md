# Product

## Register

brand

## Platform

web

## Users

Fellow developers — engineers and tech folks who arrive via search, feeds, or shared links, mostly to read technical articles. They're readers first: some land once from a search result, others follow along through RSS/JSON feeds and the IndieWeb. Their context is casual, self-directed reading, not a task or workflow.

## Product Purpose

Tyler Butler's personal website: long-form articles, short-form notes, and project showcases, published from a site he owns and controls. Success is people reading and returning — articles get read, subscribers follow the feed, and the occasional reply or kudos comes back.

## Positioning

A programmer's home on the web — an independent, self-owned corner of the internet where writing, projects, and identity live in one place.

## Conversion & proof

- Primary CTA: read an article. Secondary: subscribe to the RSS/JSON feed to return later.
- The line a visitor remembers after 10 seconds: a programmer's home on the web.
- Belief ladder: (1) this is a real person's own site, not a platform → (2) this person writes things worth my time → (3) there's more here and it'll keep coming — worth subscribing.
- Proof on hand: the work itself — the article archive, notes, and projects published on the site.

## Brand Personality

Curious, warm, nostalgic. The retro-sci-fi thread — deep blue-gray and golden-orange palette, constellation dividers, spacecraft-interior inspiration — carries a sense of wonder, and personal touches (kudos buttons, the webring, three chihuahuas on the about page) keep it human. This identity is committed: future design work should preserve and deepen it, not replace it.

## Anti-references

- SaaS landing pages: hero metrics, identical card grids, gradient CTAs — marketing-site grammar has no place here.
- The minimal dev-blog template: the interchangeable Inter-on-white engineering blog with no personality.

## Design Principles

- **A home, not a platform.** Every page should feel personally owned. Nothing should read as themed, templated, or platform-issued.
- **Reading comes first.** The primary CTA is reading an article; identity and ornament never come at the expense of long-form legibility.
- **Preserve and deepen.** The retro-sci-fi identity (palette, Adelle headings, constellations) is the brand. Refine and extend it rather than swapping it out.
- **Warmth through detail.** The curious/warm/nostalgic voice lives in small touches — dividers, kudos, microcopy — not in loud visual gestures.
- **Built to return to.** Feeds, permalinks, and the archive matter; design for the reader who comes back, not just the one who lands once.

## Accessibility & Inclusion

WCAG 2.1 AA, enforced in CI via pa11y-ci and Lighthouse accessibility checks. Animated elements (Lottie constellations, code-fold animations) need `prefers-reduced-motion` alternatives. Light and dark themes are user-toggled via a class on `<html>`; both must independently meet AA contrast.
