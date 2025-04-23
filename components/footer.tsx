import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full py-4 px-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm text-gray-500 dark:text-gray-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>© {new Date().getFullYear()} TierGenius. All rights reserved.</p>
        </div>
        <div className="flex space-x-6">
          <Link href="/about" className="hover:text-gray-900 dark:hover:text-white">
            About
          </Link>
          <Link href="/faq" className="hover:text-gray-900 dark:hover:text-white">
            FAQ
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
