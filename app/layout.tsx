import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://tiergods.jolexhive.com/"),
  title: "Tier Gods - AI-Generated Tier Lists",
  description: "Generate smart tier lists with AI, personalize your rankings, and share them with the world. Create custom tier lists for games, products, movies, and more.",
  keywords: [
    // Core Keywords
    "AI tier list generator",
    "AI tier lists",
    "smart tier lists",
    "custom rankings",
    "AI ranking tool",
    "AI-powered tier lists",
    "AI-generated tier list",
    "generate tier list AI",
    "personalized tier list",
    "intelligent tier list maker",
    "automated tier list creation",
    "AI tier list creator",
    "machine learning ranking tool",
    "AI ranking results",
  
    // Tier List Creation Keywords
    "create tier lists",
    "create tier list",
    "build tier list",
    "generate tier lists",
    "tier list creation",
    "online tier list maker",
    "tier list creator",
    "tier list generator",
    "tier list maker",
    "create tier list online",
    "tier list building tool",
    "rank with AI",
    "custom tier list builder",
    "automated ranking system",
    "easy tier list creation",
    "free online tier list generator",
  
    // Category-Specific Tier Lists
    "game tier lists",
    "movie tier lists",
    "TV show tier lists",
    "anime tier lists",
    "sports tier lists",
    "celebrity tier lists",
    "music tier lists",
    "character ranking tier lists",
    "meme tier lists",
    "food tier lists",
    "superhero tier lists",
    "video game character tier lists",
    "historical figure tier lists",
    "product ranking lists",
    "book ranking tier lists",
  
    // Brand & Unique Terms
    "Tier Gods",
    "divine ranking tool",
    "divine judgment tier list",
    "Tier Gods result",
    "ultimate tier list engine",
    "god-tier ranking system",
    "next-gen tier list generator",
  
    // Tier List Sharing & Viewing
    "tier list results",
    "final tier list",
    "view tier list",
    "share tier list",
    "download tier list image",
    "publish tier list online",
    "embed tier list in blog",
    "export tier list",
    "save your tier list",
    "tier list permalink generator",
  
    // Feature-Based Keywords
    "drag and drop tier list",
    "image-based tier list generator",
    "text-based tier list creator",
    "multi-category tier list tool",
    "visual ranking interface",
    "editable tier lists",
    "interactive ranking tool",
    "responsive tier list design",
    "AI rank suggestion",
    "smart sort ranking system",
  
    // Long-Tail & Question-Based SEO Keywords
    "how to create an AI tier list",
    "best AI tier list generator 2025",
    "what is the best tier list maker",
    "tools to build custom tier lists",
    "top AI tools for rankings",
    "rank items with artificial intelligence",
    "where to make tier lists online",
    "is there an AI for ranking items",
    "tier list generator with AI suggestions",
    "ranking things using AI models",
    "most accurate AI tier lists",
    "create tier lists fast with AI",
    "free AI-powered ranking tool",
    "tier list generator without login",
    "tier list app with smart rankings"
  ],
  authors: [{ name: "JolexHive", url: "https://jolexhive.com" }],
  robots: "index, follow",
  openGraph: {
    title: "Tier Gods - AI-Generated Tier Lists",
    description: "Generate smart tier lists with AI. Create custom rankings for games, movies, products, and more with ease.",
    type: "website",
    url: "https://tiergods.jolexhive.com",
    siteName: "Tier Gods",
    locale: "en_US",
    images: [
      {
        url: "https://tiergods.jolexhive.com/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tier Gods - AI-Generated Tier Lists",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tier Gods - AI-Generated Tier Lists",
    description: "Create smart tier lists using AI for games, products, movies, and more. Share your rankings with the world.",
    site: "@Jolex_Dev",
    creator: "@Jolex_Dev",
    images: ["https://tiergods.jolexhive.com/twitter-image.jpg"],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
