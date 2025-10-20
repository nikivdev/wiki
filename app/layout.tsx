import "./global.css"
import { RootProvider } from "fumadocs-ui/provider/next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import type { Metadata } from "next"

const inter = Inter({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "wiki.nikiv.dev | Personal wiki",
    template: "%s | wiki.nikiv.dev",
  },
  description: "Personal wiki",
  metadataBase: new URL("https://wiki.nikiv.dev"),
  // TODO: not sure if this is applied
  openGraph: {
    title: "wiki.nikiv.dev",
    description: "Personal wiki",
    url: "https://wiki.nikiv.dev",
    siteName: "wiki.nikiv.dev",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "wiki",
    "nikiv",
    "nikivdev",
    "nikita voloboev",
    "personal wiki",
    "docs",
  ],
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
