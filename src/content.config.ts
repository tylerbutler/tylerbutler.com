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
      slug: z.string(),
      title: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().default(false),
      summary: z.string().optional(),
      originalUrl: z.string().optional(),
    })
    .transform((data) => ({
      ...data,
      source: inferNoteSource(data.originalUrl),
    })),
});

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
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    url: z.string().optional(),
    github: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, notes, projects };
