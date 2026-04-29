import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/articles",
  }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      slug: z.string().optional(),
      excerpt: z.string().optional(),
      draft: z.boolean().default(false),
      link: z.string().optional(),
      via: z.string().optional(),
      vialink: z.string().optional(),
      headingStartLevel: z.number().optional(), // Override for heading normalization
      type: z.enum(["guide", "standard"]).optional(), // Article type (guide for ToC, standard otherwise)
    })
    .transform((data) => ({
      ...data,
      // Auto-infer article type based on presence of external link
      articleType: data.link ? ("link" as const) : ("standard" as const),
    })),
});

const notes = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/notes",
    // Derive id from filename. The default uses frontmatter `slug`, which
    // collides across notes that share a slug on different dates.
    generateId: ({ entry }) => entry.replace(/\.[^.]+$/, ""),
  }),
  schema: z
    .object({
      date: z.coerce.date(),
      lastmod: z.coerce.date().optional(),
      // `updated` is written by @benjifs/micropub when an existing post is
      // edited (via mp-action=update); kept distinct from `lastmod` which
      // is hand-authored.
      updated: z.coerce.date().optional(),
      // Optional in frontmatter; derived from the entry id (filename) when
      // absent so notes posted via Micropub (which doesn't write a slug
      // field) still validate. Always a string after transform.
      slug: z.string().optional(),
      title: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().default(false),
      summary: z.string().optional(),
      originalUrl: z.string().optional(),
      // Micropub / Microformats2 fields. Keys are kebab-case to match what
      // @benjifs/micropub writes to frontmatter (translateProps only renames
      // name/category/published; everything else passes through unchanged).
      photo: z.union([z.string(), z.array(z.string())]).optional(),
      "in-reply-to": z.union([z.string(), z.array(z.string())]).optional(),
      "like-of": z.union([z.string(), z.array(z.string())]).optional(),
      "repost-of": z.union([z.string(), z.array(z.string())]).optional(),
      "bookmark-of": z.union([z.string(), z.array(z.string())]).optional(),
      "mp-syndicate-to": z.union([z.string(), z.array(z.string())]).optional(),
      syndication: z.union([z.string(), z.array(z.string())]).optional(),
      location: z.string().optional(),
      rsvp: z.enum(["yes", "no", "maybe", "interested"]).optional(),
      client_id: z.string().optional(),
    })
    .transform((data) => ({
      ...data,
      source: inferNoteSource(data.originalUrl),
      postType: derivePostType(data),
      // Camel-case, always-array aliases for ergonomic template access.
      // Originals (kebab-case) are preserved for h-entry serialization
      // fidelity, but components should prefer these.
      photos: toArray(data.photo),
      replyTo: toArray(data["in-reply-to"]),
      likeOf: toArray(data["like-of"]),
      repostOf: toArray(data["repost-of"]),
      bookmarkOf: toArray(data["bookmark-of"]),
      syndicateTo: toArray(data["mp-syndicate-to"]),
      syndicationUrls: toArray(data.syndication),
    })),
});

function toArray<T>(v: T | T[] | undefined): T[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

export type NotePostType =
  | "rsvp"
  | "reply"
  | "repost"
  | "like"
  | "bookmark"
  | "photo"
  | "article"
  | "note";

// Mirrors @benjifs/micropub's postTypes() derivation, operating on our
// kebab-case schema fields. Kept here (rather than re-exported from the
// library) because the library does not persist the derived type in
// frontmatter, so we re-derive at content-load time.
function derivePostType(data: {
  rsvp?: string;
  "in-reply-to"?: string | string[];
  "repost-of"?: string | string[];
  "like-of"?: string | string[];
  "bookmark-of"?: string | string[];
  photo?: string | string[];
  title?: string;
}): NotePostType {
  if (
    data.rsvp &&
    ["yes", "no", "maybe", "interested"].includes(data.rsvp) &&
    data["in-reply-to"]
  ) {
    return "rsvp";
  }
  if (data["in-reply-to"]) return "reply";
  if (data["repost-of"]) return "repost";
  if (data["like-of"]) return "like";
  if (data["bookmark-of"]) return "bookmark";
  if (data.photo) return "photo";
  if (data.title) return "article";
  return "note";
}

function inferNoteSource(
  originalUrl: string | undefined,
): "twitter" | "microblog" | undefined {
  if (!originalUrl) return undefined;
  if (originalUrl.startsWith("https://twitter.com/")) return "twitter";
  if (originalUrl.startsWith("/")) return "microblog";
  return undefined;
}

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      url: z.string().optional(),
      github: z.string().optional(),
      draft: z.boolean().default(false),
      crate: z.string().optional(),
      hex: z.string().optional(),
      hexDocs: z.string().optional(),
      programmingLanguage: z.string().optional(),
      license: z.string().optional(),
      maturity: z.enum(["stable", "unpublished", "experimental"]).optional(),
      logo: image().optional(),
    }),
});

export const collections = { articles, notes, projects };
