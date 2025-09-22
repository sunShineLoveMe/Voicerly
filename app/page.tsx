"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "zh">("en")

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
