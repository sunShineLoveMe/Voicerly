"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { ResetPasswordCard } from "@/components/auth/reset-password-card"

const TEXTS = {
  en: {
    title: "Reset Password",
    subtitle: "Enter your email to receive a verification code",
  },
  zh: {
    title: "重置密码",
    subtitle: "输入邮箱以接收验证码",
  },
}

export default function ForgotPasswordPage() {
  const { language, setLanguage } = useLanguage()
  const texts = TEXTS[language]

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{texts.title}</CardTitle>
              <CardDescription>{texts.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordCard language={language} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}