"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useToast } from "@/hooks/use-toast"
import { postJson } from "@/lib/http"
import { EmailInput } from "@/components/auth/email-input"
import { OtpInput } from "@/components/auth/otp-input"
import { OtpSendButton } from "@/components/auth/otp-send-button"
import { PasswordInput } from "@/components/auth/password-input"
import Link from "next/link"

const TEXTS = {
  en: {
    title: "Forgot Password",
    subtitle: "Enter your email address and we'll send you a verification code.",
    verifyButton: "Verify & Continue",
    resetButton: "Reset Password",
    resetting: "Resetting...",
    otpSent: "Code sent successfully. Please check your inbox.",
    otpError: "Failed to send verification code.",
    verifyError: "Verification failed, please try again.",
    resetSuccess: "Password reset successful!",
    resetError: "Failed to reset password.",
    backToLogin: "Back to Login",
    newPassword: "New Password",
  },
  zh: {
    title: "忘记密码",
    subtitle: "输入您的邮箱地址，我们将发送验证码。",
    verifyButton: "验证并继续",
    resetButton: "重置密码",
    resetting: "重置中...",
    otpSent: "验证码已发送，请查收邮件。",
    otpError: "验证码发送失败，请稍后重试。",
    verifyError: "验证失败，请检查验证码。",
    resetSuccess: "密码重置成功！",
    resetError: "密码重置失败。",
    backToLogin: "返回登录",
    newPassword: "新密码",
  },
}

export default function ForgotPasswordPage() {
  const { language, setLanguage } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const texts = TEXTS[language]

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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
        description:
          language === "en"
            ? "Please enter your new password."
            : "请输入您的新密码。",
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 8) {
      toast({
        title: language === "en" ? "Validation Error" : "验证错误",
        description:
          language === "en"
            ? "Password must be at least 8 characters."
            : "密码至少需要8个字符。",
        variant: "destructive",
      })
      return
    }

    setIsResetting(true)
    try {
      const result = await postJson<{ ok: boolean; error?: string }>(
        "/api/auth/reset-password",
        {
          email,
          newPassword,
        }
      )

      if (!result.ok) {
        toast({
          title: texts.resetError,
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: texts.resetSuccess,
        description:
          language === "en"
            ? "You can now log in with your new password."
            : "您现在可以使用新密码登录。",
      })

      router.push("/login")
    } catch (error: any) {
      toast({
        title: texts.resetError,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

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
            <CardContent className="space-y-4">
              {/* Step 1: Email + OTP Verification */}
              {!isOtpVerified ? (
                <>
                  <EmailInput
                    value={email}
                    onChange={(val) => {
                      setEmail(val)
                      setCode("")
                    }}
                    language={language}
                  />

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <div className="flex-1">
                      <OtpInput value={code} onChange={setCode} language={language} />
                    </div>
                    <OtpSendButton email={email} onSend={handleSendOtp} language={language} />
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={code.length !== 6 || isVerifying}
                  >
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {texts.verifyButton}
                  </Button>
                </>
              ) : (
                /* Step 2: Reset Password */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <EmailInput value={email} onChange={() => {}} language={language} disabled />

                  <PasswordInput
                    value={newPassword}
                    onChange={setNewPassword}
                    language={language}
                    label={texts.newPassword}
                    showStrength={true}
                  />

                  <Button type="submit" className="w-full" disabled={isResetting}>
                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isResetting ? texts.resetting : texts.resetButton}
                  </Button>
                </form>
              )}

              <Separator />

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {texts.backToLogin}
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