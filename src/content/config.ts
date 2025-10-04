import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
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
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    url: z.string().optional(),
    github: z.string().optional(),
  }),
});

export const collections = { articles, projects };