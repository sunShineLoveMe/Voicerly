"use client"

import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AuthForm } from "@/components/auth-form"
import { EmailOtpForm } from "@/components/auth/email-otp-form"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
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

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      // Call Supabase login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Login failed')
      }

      // Login successful, update auth state
      login(result.user)
      
      // Show success message
      toast({
        title: language === "en" ? "Login Successful" : "登录成功",
        description: language === "en" ? "Welcome back!" : "欢迎回来！",
      })
      
      // Redirect to generate page
      router.push("/generate")
    } catch (err: any) {
      console.error('Login error:', err)
      toast({
        title: language === "en" ? "Login Failed" : "登录失败",
        description: err.message || (language === "en" ? "Please check your credentials." : "请检查您的凭据。"),
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

          <AuthForm mode="login" language={language} onSubmit={handleLogin} />
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
