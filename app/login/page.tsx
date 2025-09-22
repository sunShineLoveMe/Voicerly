"use client"

import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthForm } from "@/components/auth-form"
import { useLanguage } from "@/hooks/use-language"

export default function LoginPage() {
  const { language, setLanguage } = useLanguage()
  const router = useRouter()

  const handleLogin = (data: { email: string; password: string }) => {
    // In a real app, this would authenticate with a backend
    console.log("Login attempt:", data)

    // Simulate successful login
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: data.email,
        credits: 50,
        name: "User",
      }),
    )

    // Redirect to dashboard
    router.push("/generate")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <AuthForm mode="login" language={language} onSubmit={handleLogin} />
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
