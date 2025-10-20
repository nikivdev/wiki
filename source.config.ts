import { defineDocs, defineConfig, frontmatterSchema } from "fumadocs-mdx/config"
import { z } from "zod"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      draft: z.boolean().optional(),
    }),
  },
})

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
})
