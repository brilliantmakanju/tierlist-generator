"use client"

import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900 dark:text-white">Tier Gods</span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {!isHomePage && (
          <Link href="/">
            <span className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Home
            </span>
          </Link>
        )}
        <ModeToggle />
      </div>
    </header>
  )
}
