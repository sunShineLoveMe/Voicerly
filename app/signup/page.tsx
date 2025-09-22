"use client"

import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthForm } from "@/components/auth-form"
import { useLanguage } from "@/hooks/use-language"

export default function SignupPage() {
  const { language, setLanguage } = useLanguage()
  const router = useRouter()

  const handleSignup = (data: { email: string; password: string; name?: string }) => {
    // In a real app, this would create account with a backend
    console.log("Signup attempt:", data)

    // Simulate successful signup with free credits
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: data.email,
        name: data.name,
        credits: 10, // Free trial credits
        isNewUser: true,
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
          <AuthForm mode="signup" language={language} onSubmit={handleSignup} />
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
