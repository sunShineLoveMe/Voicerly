"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { PasswordSignupCard } from "@/components/auth/password-signup-card"
import { useSearchParams } from "next/navigation"

const TEXTS = {
  en: {
    title: "Create Account",
    subtitle: "Sign up and get free credits to try Voicerly!",
    bonus: "🎁 Get 10 free credits when you sign up",
  },
  zh: {
    title: "创建账户",
    subtitle: "注册即可获得免费积分，立即体验 Voicerly！",
    bonus: "🎁 注册即可获得10个免费积分",
  },
}

export default function SignupPage() {
  const { language, setLanguage } = useLanguage()
  const texts = TEXTS[language]
  const searchParams = useSearchParams()
  const prefillEmail = searchParams?.get("email") ?? ""

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{texts.title}</CardTitle>
              <CardDescription>{texts.subtitle}</CardDescription>
              <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">{texts.bonus}</p>
              </div>
            </CardHeader>
            <CardContent>
              <PasswordSignupCard language={language} defaultEmail={prefillEmail} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}