"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { postJson } from "@/lib/http"
import { EmailInput } from "@/components/auth/email-input"
import { PasswordInput } from "@/components/auth/password-input"
import { EmailOtpForm } from "@/components/auth/email-otp-form"
import Link from "next/link"

const TEXTS = {
  en: {
    title: "Welcome Back",
    subtitle: "Sign in to your Voicerly account",
    loginButton: "Sign In",
    loggingIn: "Signing in...",
    loginSuccess: "Login successful!",
    loginError: "Invalid email or password",
    forgotPassword: "Forgot password?",
    switchToSignup: "Don't have an account?",
    signupLink: "Sign up",
    orContinue: "OR SIGN IN WITH EMAIL CODE",
  },
  zh: {
    title: "欢迎回来",
    subtitle: "登录您的 Voicerly 账户",
    loginButton: "登录",
    loggingIn: "登录中...",
    loginSuccess: "登录成功！",
    loginError: "邮箱或密码错误",
    forgotPassword: "忘记密码？",
    switchToSignup: "还没有账户？",
    signupLink: "注册",
    orContinue: "或使用邮箱验证码登录",
  },
}

export default function LoginPage() {
  const { language, setLanguage } = useLanguage()
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const texts = TEXTS[language]

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: language === "en" ? "Validation Error" : "验证错误",
        description:
          language === "en"
            ? "Please enter your email and password."
            : "请输入邮箱和密码。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await postJson<{ ok: boolean; user?: any; error?: string }>(
        "/api/auth/login-with-password",
        {
          email,
          password,
        }
      )

      if (!result.ok) {
        toast({
          title: texts.loginError,
          description: result.error,
          variant: "destructive",
        })
        return
      }

      if (result.user) {
        login({
          ...result.user,
          access_token: "",
        })

        toast({ title: texts.loginSuccess })
        router.push("/account")
      }
    } catch (error: any) {
      toast({
        title: texts.loginError,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSuccess = (otpEmail: string) => {
    toast({
      title: language === "en" ? "Verification successful" : "验证成功",
      description:
        language === "en"
          ? "You are now signed in with your email."
          : "您已通过邮箱验证码登录。",
    })
    router.push("/account")
  }

  const handleOtpError = (message: string) => {
    toast({
      title: language === "en" ? "Verification failed" : "验证失败",
      description: message,
      variant: "destructive",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Email OTP Login */}
          <EmailOtpForm
            language={language}
            onSuccess={handleOtpSuccess}
            onError={handleOtpError}
            defaultRedirect="/account"
          />

          <div className="text-center text-sm uppercase tracking-wide text-muted-foreground">
            {texts.orContinue}
          </div>

          {/* Password Login */}
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{texts.title}</CardTitle>
              <CardDescription>{texts.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <EmailInput value={email} onChange={setEmail} language={language} />

                <PasswordInput value={password} onChange={setPassword} language={language} />

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {texts.forgotPassword}
                  </Link>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? texts.loggingIn : texts.loginButton}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center text-sm text-muted-foreground">
                {texts.switchToSignup}{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  {texts.signupLink}
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