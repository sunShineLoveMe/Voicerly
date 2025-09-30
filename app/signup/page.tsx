"use client"

import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthForm } from "@/components/auth-form"
import { EmailOtpForm } from "@/components/auth/email-otp-form"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const { language, setLanguage } = useLanguage()
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleOtpSuccess = (otpEmail: string) => {
    toast({
      title: language === "en" ? "Verification successful" : "验证成功",
      description:
        language === "en"
          ? "You are now signed in with your email."
          : "您已通过邮箱验证码登录。",
    })
  }

  const handleOtpError = (message: string) => {
    toast({
      title: language === "en" ? "Verification failed" : "验证失败",
      description: message,
      variant: "destructive",
    })
  }

  const handleSignup = async (data: { email: string; password: string; name?: string }) => {
    try {
      // Call Supabase create user API
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          display_name: data.name,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Signup failed')
      }

      // Create user successful, now login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const loginResult = await loginResponse.json()

      if (!loginResponse.ok) {
        throw new Error(loginResult.error?.message || 'Auto-login failed')
      }

      // Login successful, update auth state
      login(loginResult.user)
      
      // Show success message
      toast({
        title: language === "en" ? "Account Created" : "账户创建成功",
        description: language === "en" ? "Welcome to Voicerly!" : "欢迎使用 Voicerly！",
      })
      
      // Redirect to generate page
      router.push("/generate")
    } catch (err: any) {
      console.error('Signup error:', err)
      toast({
        title: language === "en" ? "Signup Failed" : "注册失败",
        description: err.message || (language === "en" ? "Please try again." : "请重试。"),
        variant: "destructive",
      })
      // Re-throw error to let AuthForm handle loading state
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <EmailOtpForm
            language={language}
            onSuccess={handleOtpSuccess}
            onError={handleOtpError}
            defaultRedirect="/generate"
          />

          <div className="relative flex items-center justify-center">
            <span className="px-4 text-sm uppercase tracking-wide text-muted-foreground">
              {language === "en" ? "Or continue with password" : "或使用密码继续"}
            </span>
          </div>

          <AuthForm mode="signup" language={language} onSubmit={handleSignup} />
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
