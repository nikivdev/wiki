import type { ReactNode } from "react"
import { baseOptions } from "@/app/layout.config"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { source } from "@/lib/source"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      sidebar={{
        defaultOpenLevel: 2,
      }}
    >
      {children}
    </DocsLayout>
  )
}
