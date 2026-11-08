import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { noteSchema } from "./lib/note-schema";

const articles = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/articles",
  }),
  schema: z
    .object({
      title: z.string(),
      subtitle: z.string().optional(),
      date: z.coerce.date(),
      tags: z.array(z.string()).optional(),
      slug: z.string().optional(),
      excerpt: z.string().optional(),
      ogImage: z.string().optional(),
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
  schema: noteSchema,
});

/**
 * Named sections on the projects listing. The markdown body is the section
 * description; the logo represents the whole group, so member cards suppress
 * their own.
 */
const projectGroups = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/project-groups",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      logo: image().optional(),
      // Ascending. Values are spaced so a new group can slot in without
      // renumbering the others.
      order: z.number().default(100),
      draft: z.boolean().default(false),
    }),
});

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
      npm: z.string().optional(),
      crate: z.string().optional(),
      hex: z.string().optional(),
      hexDocs: z.string().optional(),
      programmingLanguage: z.string().optional(),
      license: z.string().optional(),
      maturity: z
        .enum(["stable", "unpublished", "experimental", "archived"])
        .optional(),
      logo: image().optional(),
      group: reference("projectGroups").optional(),
      dependsOn: z.array(reference("projects")).default([]),
    }),
});

export const collections = { articles, notes, projects, projectGroups };
