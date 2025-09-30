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
import { OtpInput } from "@/components/auth/otp-input"
import { OtpSendButton } from "@/components/auth/otp-send-button"
import { PasswordInput } from "@/components/auth/password-input"
import { NameInput } from "@/components/auth/name-input"
import Link from "next/link"

const TEXTS = {
  en: {
    title: "Email Login",
    subtitle: "Sign in or sign up with a one-time code.",
    verifyButton: "Verify & Continue",
    otpSent: "Code sent successfully. Please check your inbox.",
    otpError: "Failed to send verification code.",
    verifyError: "Verification failed, please try again.",
    createTitle: "Create Account",
    createSubtitle: "Sign up and get free credits to try Voicerly!",
    freeCredits: "Get 10 free credits when you sign up",
    createButton: "Create Account",
    creating: "Creating...",
    signupSuccess: "Account created successfully!",
    signupError: "Failed to create account.",
    passwordLogin: "Prefer password login?",
    passwordLoginDesc: "You can still log in with your password below.",
    switchToLogin: "Already have an account?",
    loginLink: "Sign in",
  },
  zh: {
    title: "邮箱验证码登录",
    subtitle: "通过一次性验证码完成注册或登录。",
    verifyButton: "验证并继续",
    otpSent: "验证码已发送，请查收邮件。",
    otpError: "验证码发送失败，请稍后重试。",
    verifyError: "验证失败，请检查验证码。",
    createTitle: "创建账户",
    createSubtitle: "注册即可获得免费积分，立即体验 Voicerly！",
    freeCredits: "注册即可获得10个免费积分",
    createButton: "创建账户",
    creating: "创建中...",
    signupSuccess: "账户创建成功！",
    signupError: "账户创建失败。",
    passwordLogin: "想用密码登录？",
    passwordLoginDesc: "您仍然可以在下方使用邮箱 + 密码登录。",
    switchToLogin: "已有账户？",
    loginLink: "登录",
  },
}

export default function SignupPage() {
  const { language, setLanguage } = useLanguage()
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const texts = TEXTS[language]

  // OTP 流程状态
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // 注册表单状态
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSendOtp = async () => {
    const result = await postJson<{ ok: boolean; error?: string }>("/api/send-otp", { email })

    if (!result.ok) {
      toast({
        title: texts.otpError,
        description: result.error,
        variant: "destructive",
      })
      throw new Error(result.error)
    }

    toast({ title: texts.otpSent })
  }

  const handleVerifyOtp = async () => {
    if (code.length !== 6) return

    setIsVerifying(true)
    try {
      const result = await postJson<{ ok: boolean; error?: string }>("/api/verify-otp", {
        email,
        code,
      })

      if (!result.ok) {
        toast({
          title: texts.verifyError,
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setIsOtpVerified(true)
      toast({
        title: language === "en" ? "Verification successful" : "验证成功",
      })
    } catch (error: any) {
      toast({
        title: texts.verifyError,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !password || password.length < 8) {
      toast({
        title: language === "en" ? "Validation Error" : "验证错误",
        description:
          language === "en"
            ? "Please fill in all fields. Password must be at least 8 characters."
            : "请填写所有字段。密码至少需要8个字符。",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // 调用后端创建账户
      const signupResult = await postJson<{ ok: boolean; user?: any; error?: string }>(
        "/api/auth/signup",
        {
          email,
          password,
          displayName: name,
        }
      )

      if (!signupResult.ok) {
        toast({
          title: texts.signupError,
          description: signupResult.error,
          variant: "destructive",
        })
        return
      }

      // 注册成功后自动登录（使用密码登录）
      const loginResult = await postJson<{ ok: boolean; user?: any; error?: string }>(
        "/api/auth/login-with-password",
        {
          email,
          password,
        }
      )

      if (loginResult.ok && loginResult.user) {
        login({
          ...loginResult.user,
          access_token: "", // 可选，如果使用 token 认证
        })

        toast({ title: texts.signupSuccess })
        router.push("/account")
      }
    } catch (error: any) {
      toast({
        title: texts.signupError,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Email OTP Section */}
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{texts.title}</CardTitle>
              <CardDescription>{texts.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmailInput
                value={email}
                onChange={(val) => {
                  setEmail(val)
                  setIsOtpVerified(false)
                  setCode("")
                }}
                language={language}
                disabled={isOtpVerified}
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <OtpInput
                    value={code}
                    onChange={setCode}
                    language={language}
                    disabled={!email || isOtpVerified}
                  />
                </div>
                <OtpSendButton
                  email={email}
                  onSend={handleSendOtp}
                  language={language}
                  disabled={isOtpVerified}
                />
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={code.length !== 6 || isVerifying || isOtpVerified}
              >
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {texts.verifyButton}
              </Button>

              <Separator />

              <div className="text-sm text-center text-muted-foreground">
                <p className="font-medium">{texts.passwordLogin}</p>
                <p>{texts.passwordLoginDesc}</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm uppercase tracking-wide text-muted-foreground">
            {language === "en" ? "OR CONTINUE WITH PASSWORD" : "或使用密码继续"}
          </div>

          {/* Create Account Section */}
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{texts.createTitle}</CardTitle>
              <CardDescription>{texts.createSubtitle}</CardDescription>
              <div className="mt-2 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">{texts.freeCredits}</p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <NameInput
                  value={name}
                  onChange={setName}
                  language={language}
                  disabled={!isOtpVerified}
                />

                <EmailInput
                  value={email}
                  onChange={setEmail}
                  language={language}
                  disabled={true}
                />

                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  language={language}
                  disabled={!isOtpVerified}
                  showStrength={true}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!isOtpVerified || isCreating}
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreating ? texts.creating : texts.createButton}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="text-center text-sm text-muted-foreground">
                {texts.switchToLogin}{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  {texts.loginLink}
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