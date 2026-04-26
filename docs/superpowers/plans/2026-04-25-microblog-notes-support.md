# Plan: Notes via micro.blog / Micropub clients

## Status update — `notes-rendering` branch

Significant progress is already on the `notes-rendering` branch. Status by
layer:

**Layer 1 — Schema (done)**

- ✅ Added `slug` (required), `title?`, `summary?`, `lastmod?`, `originalUrl?`,
  derived `source` ("twitter" | "microblog" | undefined). Custom `generateId`
  to avoid slug collisions across dates.
- ✅ Added Micropub fields (kebab-case to match `@benjifs/micropub` output):
  `photo`, `in-reply-to`, `like-of`, `repost-of`, `bookmark-of`,
  `mp-syndicate-to`, `syndication`, `location`, `rsvp`, `client_id`,
  `updated`.
- ✅ `derivePostType()` mirrors `@benjifs/micropub`'s `postTypes()` logic.
  Surfaced as `data.postType` (rsvp/reply/repost/like/bookmark/photo/article/note).
- ✅ Camel-case array aliases (`photos`, `replyTo`, `likeOf`, `repostOf`,
  `bookmarkOf`, `syndicateTo`, `syndicationUrls`) for ergonomic template
  access; kebab-case originals retained for h-entry serialization fidelity.

**Layer 2 — Routes & h-entry (done)**

- ✅ Routes: `/notes/[...page]` (paginated index), `/notes/[year]`,
  `/notes/[year]/[month]`, `/notes/[year]/[month]/[day]/[slug]`. Year/month
  rollups go beyond the plan.
- ✅ Microformats present: `h-feed`, `h-entry`, `p-name`, `e-content`,
  `dt-published` (via `NoteDate`), `u-url`, `p-category` on tag links,
  `p-author h-card` (via shared `HEntryAuthor.astro`), `u-photo`,
  `u-in-reply-to`, `u-like-of`, `u-repost-of`, `u-bookmark-of`,
  `u-syndication`, `p-rsvp` (all rendered by `NoteCard.astro` when
  schema fields are present).
- ✅ Reusable `NoteCard.astro` with `feed` / `detail` variants. The four
  notes pages now share rendering, eliminating ~400 lines of duplication.
- ✅ Bonus components: `NoteSourceIcon`, `NotePermalink`, `NoteDate`,
  `HEntryAuthor`.

**Layer 3 — Feeds (done)**

- ✅ **Decision: split feeds are canonical.** `/feed.xml` (articles) and
  `/notes/feed.xml` (notes) remain separate. micro.blog supports multiple
  feeds per account, so this enables per-feed cross-post rules without
  blocking syndication.
- ✅ JSON Feed v1.1 added at `/feed.json` and `/notes/feed.json`.
- ✅ `<link rel="alternate">` tags for both RSS and JSON Feed (articles +
  notes) added to `BaseLayout.astro`.

**Layer 4 — Micropub config (done)**

- ✅ `netlify/config.js` now passes a `config` block to `MicropubEndpoint`.
  `GET /micropub?q=config` (and `?q=media-endpoint|syndicate-to|post-types`)
  advertise:
  - `media-endpoint: https://tylerbutler.com/media`
  - `syndicate-to: [{ uid: "https://micro.blog/", name: "micro.blog" }]`
    (structured for future targets)
  - `post-types`: note, article, photo, reply, like, repost, bookmark, rsvp
- ✅ `NoteSlugInjectingStore` (subclass of `GitHubStore` in `netlify/config.js`)
  injects `slug: "<slug>"` into the frontmatter on commit, derived from the
  `notes/YYYY-MM-DD-<slug>.md` filename produced by `formatSlug`. This is
  required because `@benjifs/micropub` does not write a `slug` field, but
  the notes schema and `getNoteUrl` helper expect one.
- ✅ Defense in depth: the `slug` field on the notes schema is now optional
  (`src/content.config.ts`); `noteSlug()` in `src/lib/note-utils.ts`
  derives a fallback from the entry id when frontmatter `slug` is absent.
- ⚠️ **Slug collision policy: keep library default rejection.** The library
  throws `400 file exists` when two posts produce the same filename. The
  earlier plan called for client-side auto-suffixing (`-2`, `-3`), but
  implementing that correctly requires per-request state on the store
  (concurrency-fragile on Netlify) or a pre-flight that re-parses the
  request body (the library consumes the stream). Deferred as a follow-up.
  Realistic collision surface is small: `generateSlug` already prepends
  epoch seconds when no `mp-slug`/`name` is supplied, so collisions only
  happen when a client explicitly reuses an `mp-slug` on the same UTC day.

**Layer 5 — End-to-end verification (not started)**

- ❌ Expected — depends on Layer 4.

**Bonus work not in the original plan (already done)**

- Twitter and micro.blog archive migrations: `scripts/migrate-twitter-notes.ts`,
  `scripts/migrate-microblog-notes.sh`, plus 1000+ imported note files.
- `SHOW_DRAFTS` env var support for notes (centralized in `draft-utils.ts`).
- Pagination on `/notes/`.
- Source icon + permalink components.
- Note count utilities (`src/lib/note-counts.ts`) and note URL helpers
  (`src/lib/note-utils.ts`).

## Remaining work to finish the plan

1. **Schema**: ✅ done — Micropub fields added with kebab-case keys; camel-case
   array aliases derived; `postType` mirrors library logic.
2. **h-entry author + post-type rendering**: ✅ done — `HEntryAuthor.astro`
   added; `NoteCard.astro` renders all post-type contexts (reply/like/
   repost/bookmark/rsvp), `u-photo`, `u-syndication`, and `p-author h-card`.
3. **Feeds**: ✅ done — split feeds canonical; JSON Feeds added at
   `/feed.json` and `/notes/feed.json`; alternate `<link>` tags in
   `BaseLayout.astro`.
4. **Micropub `q=config`**: ✅ done — `config` block (media-endpoint,
   syndicate-to, post-types) added to `MicropubEndpoint` options.
   `NoteSlugInjectingStore` injects `slug:` into frontmatter on commit;
   schema makes `slug` optional with id-derived fallback in `note-utils`.
   Slug collision auto-suffix deferred (see Layer 4 caveat above).
5. **E2E**: round-trip plain note, photo note, and reply from Quill + a
   micro.blog client. Validate with indiewebify.me + microformats.io. Confirm
   micro.blog can subscribe to the notes feed.

## Original plan (kept for context)

## Problem

The site already exposes a Micropub endpoint (`/micropub`, backed by
`@benjifs/micropub` + `@benjifs/github-store`) and IndieAuth `<link>` tags, and a
`notes` content collection is defined. However the experience for posting and
consuming notes from micro.blog-compatible clients (Gluon, Sunlit, the official
micro.blog app, Quill, Indigenous, etc.) is incomplete:

- `src/content/notes/` is empty; there are no routes that render notes.
- `src/content.config.ts` `notes` schema is minimal — no support for photos,
  syndication targets, reply context, bookmark-of, like-of, etc.
- `src/pages/feed.xml.ts` only includes `articles`. micro.blog cannot pull notes
  in for cross-posting / following.
- No h-entry microformats markup is rendered on notes, so micro.blog (and other
  IndieWeb consumers) can't parse them.
- No verification that the current Micropub config actually round-trips a note
  posted from a real client (auth, slug format, frontmatter shape).

## Goal

Full IndieWeb notes experience: micro.blog/Micropub clients can post notes
(text, photos, replies, bookmarks) to this site; notes render at stable URLs
with h-entry markup; notes appear in a consumable feed; syndication targets are
declared so clients can offer cross-posting.

## Scope decisions (from clarifying Q&A)

- **Photos**: Leave current `public/uploads` config for now. Plan should not
  block on a CDN choice; just ensure uploaded paths render correctly in notes.
- **Goal**: Full IndieWeb notes experience, not just "minimum viable post."

## Non-goals

- Implementing a fully custom Micropub server. Continue using `@benjifs/micropub`.
- Webmention sending (out of scope; webmention.io receives, sending is separate).
- Migrating off IndieAuth.com to a self-hosted IndieAuth provider.

## Approach

Work in five layers, bottom-up:

### 1. Schema & content shape

Extend the `notes` collection schema in `src/content.config.ts` to cover
common Micropub properties that clients send. Translate via the
`@benjifs/micropub` `translateProps: true` option (already enabled), confirm
which property names that library emits, and align schema names to match.

Properties to support (all optional except `date`):

- `content` (note body — lives in markdown body, not frontmatter)
- `name` / `title` (optional; presence promotes a note to article-style)
- `summary`
- `category` → `tags` (already present)
- `photo` (single string or array of strings; URLs under `/uploads/...`)
- `in-reply-to` → `replyTo` (URL)
- `like-of` → `likeOf` (URL)
- `repost-of` → `repostOf` (URL)
- `bookmark-of` → `bookmarkOf` (URL)
- `mp-syndicate-to` → `syndicateTo` (array of target ids)
- `syndication` → `syndication` (array of URLs that the note was syndicated to)
- `location` (optional, lat/long string or geo URI)
- `published` → mapped onto existing `date`

Decide and document a "post type" derivation rule (note vs reply vs like vs
bookmark vs photo) — likely a `postType` derived field on `transform`, similar
to how `articles` derives `articleType`.

### 2. Rendering

- Add `src/pages/notes/index.astro` — chronological list of notes (most recent
  first), with permalinks.
- Add `src/pages/notes/[...slug].astro` — single-note page rendering markdown
  body, photo(s), reply/like/bookmark/repost context, and syndication links.
- Wrap each note (in both list and single views) in proper **h-entry**
  microformats:
  - `.h-entry` on the article element
  - `.e-content` on the body
  - `.dt-published` on the date (with `datetime` attribute)
  - `.u-url` on the permalink
  - `.p-author h-card` referencing site author (likely a shared partial)
  - `.p-category` on tag links
  - `.u-in-reply-to`, `.u-like-of`, `.u-repost-of`, `.u-bookmark-of` when present
  - `.u-photo` on photos
  - `.u-syndication` for syndication URLs
- Add a small `NoteCard.astro` component reused by index, tag pages, and
  potentially the homepage.

### 3. Feed

- Update `src/pages/feed.xml.ts` to merge `articles` and `notes`, sorted by date.
  Use the note's first ~280 chars or the full body for `description`. Include a
  `<title>` derived from `summary` or first line if no `name` is set
  (micro.blog's expected behavior for title-less posts).
- Consider an additional `feed.json` (JSON Feed) — micro.blog prefers it. If
  we add it, also add `<link rel="alternate" type="application/feed+json">` to
  `BaseLayout.astro`.
- Ensure `<link rel="alternate" type="application/rss+xml">` exists in
  `BaseLayout.astro` (verify, add if missing).

### 4. Micropub config & discovery

- Add a Micropub **config endpoint** response: clients query
  `GET /micropub?q=config` to discover `media-endpoint`, `syndicate-to` targets,
  and `post-types`. Verify what `@benjifs/micropub` returns by default; extend
  config in `netlify/config.js` to declare:
  - `media-endpoint: https://tylerbutler.com/media`
  - `syndicate-to`: at least one entry for `micro.blog` (uid + name); structure
    so adding Mastodon/Bluesky later is trivial.
  - `post-types`: note, article, photo, reply, like, repost, bookmark.
- Confirm `formatSlug` produces clean slugs for notes (current: date-prefixed).
  Decide whether note URLs should be date-based (`/notes/2026/04/25/<slug>`)
  or flat (`/notes/<slug>`). Recommendation: flat, with date in frontmatter.
  May require updating `formatSlug` in `netlify/config.js`.
- Document required env vars (`GITHUB_TOKEN` scope; IndieAuth me URL).

### 5. End-to-end verification

- Manual round-trip with at least two clients (e.g., **Quill** for browser-based,
  **Gluon** or the **micro.blog iOS app** for native). Verify:
  - IndieAuth login succeeds.
  - A plain text note posts, commits to repo, builds, and renders with h-entry.
  - A note with a photo uploads to `/media`, commits photo to `public/uploads`,
    and renders with `u-photo`.
  - A reply to an external URL renders reply context with `u-in-reply-to`.
  - `syndicate-to` shows micro.blog as an option in the client UI.
- Validate rendered pages with **indiewebify.me** and **microformats.io**.
- Confirm micro.blog can subscribe to the notes feed (JSON Feed preferred) and
  display posts.

## Files likely to change / create

- `src/content.config.ts` — extend `notes` schema, add `transform` for `postType`.
- `src/pages/notes/index.astro` — new.
- `src/pages/notes/[...slug].astro` — new.
- `src/components/NoteCard.astro` — new.
- `src/components/HEntryAuthor.astro` — new (shared `p-author h-card`).
- `src/pages/feed.xml.ts` — include notes.
- `src/pages/feed.json.ts` — new (JSON Feed; optional but recommended).
- `src/layouts/BaseLayout.astro` — add `<link rel="alternate">` for JSON Feed,
  verify RSS link present.
- `netlify/config.js` — extend Micropub config (syndicate-to, post-types,
  media-endpoint, possibly `formatSlug` rework).
- Possibly `src/pages/tags/[tag].astro` to also surface notes by tag.

## Open questions / risks

- `@benjifs/micropub` config surface: need to confirm whether it natively
  supports declaring `syndicate-to` and `post-types` in the `q=config` response,
  or whether we need to wrap/intercept. **Action: read the package source
  during implementation before designing around it.**
- Cross-posting to micro.blog: micro.blog typically pulls from a feed rather
  than receiving a syndication call; document the feed URL we'd give micro.blog
  and confirm it includes everything they need (post URL, content, photo).
- Photos in `public/uploads` will be committed to the repo on every photo post.
  Acceptable per scope decision, but flag repo-size growth as a future concern
  (revisit when CDN decision is made).
- Notes feed volume: if notes become high-frequency, splitting feeds (articles,
  notes, combined) may be desirable. Out of scope for this plan.

## Todos (tracked in SQL `todos` table)

1. `notes-schema` — Extend `notes` collection schema with Micropub fields and `postType` transform.
2. `notes-routes` — Create `/notes/index.astro` and `/notes/[...slug].astro` with h-entry markup.
3. `note-card` — Create reusable `NoteCard.astro` and `HEntryAuthor.astro`.
4. `feed-notes` — Merge notes into `feed.xml.ts`; add `feed.json.ts`; add JSON Feed `<link>` in `BaseLayout`.
5. `micropub-config` — Read `@benjifs/micropub` source; extend config for `syndicate-to`, `post-types`, `media-endpoint`; revisit `formatSlug` for flat note URLs.
6. `e2e-verify` — Round-trip post a note + photo + reply from at least two clients; validate with indiewebify.me and microformats.io; confirm micro.blog can consume the feed.

Dependencies: 2 depends on 1; 3 supports 2; 4 depends on 1; 6 depends on 2, 4, 5.
