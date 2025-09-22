"use client"

import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/hooks/use-language"

export default function HomePage() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />
      <main>
        <HeroSection language={language} />
      </main>
      <Footer language={language} />
    </div>
  )
}
