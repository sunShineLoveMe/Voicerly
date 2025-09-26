"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const { language, setLanguage } = useLanguage()
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const content = {
    en: {
      title: "Forgot Password",
      subtitle: "Enter your email address and we'll send you a link to reset your password.",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email address",
      sendButton: "Send Reset Link",
      backToLogin: "Back to Login",
      successTitle: "Check Your Email",
      successMessage: "We've sent a password reset link to your email address.",
      resendButton: "Resend Email"
    },
    zh: {
      title: "忘记密码",
      subtitle: "输入您的邮箱地址，我们将发送重置密码的链接。",
      emailLabel: "邮箱地址",
      emailPlaceholder: "请输入您的邮箱地址",
      sendButton: "发送重置链接",
      backToLogin: "返回登录",
      successTitle: "请检查您的邮箱",
      successMessage: "我们已向您的邮箱发送了密码重置链接。",
      resendButton: "重新发送"
    }
  }

  const currentContent = content[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: language === "en" ? "Validation Error" : "验证错误",
        description: language === "en" ? "Please enter your email address." : "请输入您的邮箱地址。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // TODO: Implement actual password reset API call
      // For now, simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      
      setIsEmailSent(true)
      toast({
        title: currentContent.successTitle,
        description: currentContent.successMessage,
      })
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "错误",
        description: language === "en" ? "Failed to send reset email. Please try again." : "发送重置邮件失败，请重试。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    
    try {
      // TODO: Implement actual resend API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast({
        title: language === "en" ? "Email Sent" : "邮件已发送",
        description: language === "en" ? "Reset link sent again." : "重置链接已重新发送。",
      })
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "错误",
        description: language === "en" ? "Failed to resend email." : "重新发送失败。",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{currentContent.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {currentContent.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEmailSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{currentContent.emailLabel}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={currentContent.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {language === "en" ? "Sending..." : "发送中..."}
                      </>
                    ) : (
                      currentContent.sendButton
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{currentContent.successTitle}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentContent.successMessage}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={handleResend} variant="outline" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          {language === "en" ? "Sending..." : "发送中..."}
                        </>
                      ) : (
                        currentContent.resendButton
                      )}
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/login">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {currentContent.backToLogin}
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
