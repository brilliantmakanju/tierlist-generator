import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
  <div className="max-w-3xl mx-auto space-y-6">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-50">
    Enter the Realm of the Tier Gods
    </h1>
    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
    Step into the realm of the gods. Present your choices, and let the Tier Gods, guided by AI, pass their divine judgment. Your list will be ranked, and only one truth will rise to S-tier.
    </p>
    <div className="pt-4">
      <Link href="/create">
        <Button size="lg" className="h-12 px-8 text-base bg-[#3b82f6] hover:bg-[#2563eb]">
          Consult the Tier Gods
        </Button>
      </Link>
    </div>
    <div className="pt-12 pb-8">
      <div className="relative mx-auto max-w-3xl rounded-lg overflow-hidden shadow-lg">
        <img src="/hero.png" alt="Tier list summoning scene" className="w-full h-auto" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
    </div>
  </div>
</main>

      <Footer />
    </div>
  )
}


