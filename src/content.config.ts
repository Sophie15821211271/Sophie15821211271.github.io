import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({base: "./src/content/posts", pattern: "**/*.md"}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).optional().default([]),
    cover: z.string().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional()
  })
});
export const collections = {posts};
