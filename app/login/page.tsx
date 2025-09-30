"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/hooks/use-language"
import { AuthSwitcher } from "@/components/auth/auth-switcher"
import { OtpLoginCard } from "@/components/auth/otp-login-card"
import { PasswordLoginCard } from "@/components/auth/password-login-card"

const TEXTS = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to your Voicerly account",
    tabOtp: "Email Code",
    tabPassword: "Password",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
  },
  zh: {
    title: "欢迎回来",
    subtitle: "登录您的 Voicerly 账户",
    tabOtp: "验证码登录",
    tabPassword: "密码登录",
    noAccount: "还没有账户？",
    signUp: "注册",
  },
}

export default function LoginPage() {
  const { language, setLanguage } = useLanguage()
  const texts = TEXTS[language]

  const enablePassword = process.env.NEXT_PUBLIC_ENABLE_PASSWORD !== "false"

  const tabs = enablePassword
    ? [
        {
          value: "otp",
          label: texts.tabOtp,
          content: <OtpLoginCard language={language} />,
        },
        {
          value: "password",
          label: texts.tabPassword,
          content: <PasswordLoginCard language={language} />,
        },
      ]
    : [
        {
          value: "otp",
          label: texts.tabOtp,
          content: <OtpLoginCard language={language} />,
        },
      ]

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
              <AuthSwitcher tabs={tabs} defaultTab="otp" />

              <Separator className="my-6" />

              <div className="text-center text-sm text-muted-foreground">
                {texts.noAccount}{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  {texts.signUp}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}