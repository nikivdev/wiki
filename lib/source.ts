import { docs } from "@/.source"
import { loader } from "fumadocs-core/source"

export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
})

const hideDrafts = process.env.NODE_ENV === "production"

if (hideDrafts) {
  const getPageOriginal = source.getPage.bind(source)
  const getPagesOriginal = source.getPages.bind(source)
  const getLanguagesOriginal = source.getLanguages.bind(source)
  const getNodePageOriginal = source.getNodePage.bind(source)
  const getPageTreeOriginal = source.getPageTree.bind(source)
  const generateParamsOriginal = source.generateParams.bind(source)

  const isDraftPage = (page: unknown): boolean => {
    const data = (page as { data?: Record<string, unknown> } | undefined)?.data
    const draft = (data as { draft?: unknown } | undefined)?.draft
    return draft === true
  }

  function removeDanglingSeparators(nodes: any[]): any[] {
    const cleaned: any[] = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node?.type === "separator") {
        const hasPrev = cleaned.some((item) => item?.type !== "separator")
        const hasNext = nodes.slice(i + 1).some((item) => item?.type !== "separator")
        if (!hasPrev || !hasNext) continue
      }
      cleaned.push(node)
    }
    return cleaned
  }

  function filterChildren(children: any[], locale?: string): any[] {
    const filtered: any[] = []
    for (const child of children) {
      const result = filterNode(child, locale)
      if (result) filtered.push(result)
    }
    return removeDanglingSeparators(filtered)
  }

  function filterNode(node: any, locale?: string): any {
    if (!node) return null
    if (node.type === "page") {
      const page = getNodePageOriginal(node, locale)
      return isDraftPage(page) ? null : node
    }
    if (node.type === "folder") {
      const index = filterNode(node.index, locale) ?? undefined
      const children = filterChildren(node.children ?? [], locale)
      if (!index && children.length === 0) return null

      const filteredFolder: any = {
        ...node,
        children,
      }

      if (index) filteredFolder.index = index
      else delete filteredFolder.index

      return filteredFolder
    }
    if (node.type === "separator") return node
    return node
  }

  function filterRoot(root: any, locale?: string): any {
    const children = filterChildren(root.children ?? [], locale)
    const fallback = root.fallback ? filterRoot(root.fallback, locale) : undefined
    const filteredRoot: any = {
      ...root,
      children,
    }

    if (fallback) filteredRoot.fallback = fallback
    else delete filteredRoot.fallback

    return filteredRoot
  }

  source.getPage = (slugs, language) => {
    const page = getPageOriginal(slugs, language)
    return isDraftPage(page) ? undefined : page
  }

  source.getNodePage = (node, language) => {
    const page = getNodePageOriginal(node, language)
    return isDraftPage(page) ? undefined : page
  }

  source.getPages = (language) =>
    getPagesOriginal(language).filter((page) => !isDraftPage(page))

  source.getLanguages = () =>
    getLanguagesOriginal()
      .map((entry) => ({
        ...entry,
        pages: entry.pages.filter((page) => !isDraftPage(page)),
      }))
      .filter((entry) => entry.pages.length > 0)

  source.generateParams = (slug, lang) => {
    const slugKey = (slug ?? "slug") as string
    const langKey = (lang ?? "lang") as string

    return generateParamsOriginal(slug, lang).filter((entry) => {
      const record = entry as Record<string, unknown>
      const slugs = record[slugKey]
      if (!Array.isArray(slugs)) return false
      const locale = lang ? (record[langKey] as string | undefined) : undefined
      const page = getPageOriginal(slugs as string[], locale)
      return !isDraftPage(page)
    })
  }

  source.getPageTree = (locale) => filterRoot(getPageTreeOriginal(locale), locale)

  const pageTreeDescriptor = Object.getOwnPropertyDescriptor(source, "pageTree")
  if (pageTreeDescriptor?.get) {
    Object.defineProperty(source, "pageTree", {
      configurable: true,
      enumerable: true,
      get() {
        const tree = pageTreeDescriptor.get!.call(source)
        return filterRoot(tree)
      },
      set(value) {
        pageTreeDescriptor.set?.call(source, value)
      },
    })
  }
}
