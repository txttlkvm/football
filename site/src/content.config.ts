import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(), date: z.coerce.date(), categories: z.array(z.string()).default([]), tags: z.array(z.string()).default([]), image: z.string().optional(), excerpt: z.string().default(''),
    description: z.string().optional(), draft: z.boolean().default(false), publishDate: z.coerce.date().optional(), featured: z.boolean().default(false), imageFocus: z.string().optional(),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(), description: z.string().optional(), image: z.string().optional(), showRegisterCta: z.boolean().default(false), draft: z.boolean().default(false),
    layout: z.enum(['article', 'blocks']).default('article'), blocks: z.array(z.record(z.string(), z.any())).default([]),
  }),
});
export const collections = { posts, pages };
