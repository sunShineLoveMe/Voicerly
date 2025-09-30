"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { postJson } from "@/lib/http"
import { useAuth } from "@/hooks/use-auth"
import { FormMessage } from "./form-message"

interface PasswordSignupCardProps {
  language: "en" | "zh"
  defaultEmail?: string
}

const TEXTS = {
  en: {
    title: "Create Account",
    subtitle: "Sign up and get free credits to try Voicerly!",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your full name",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 8 characters",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Enter password again",
    signupButton: "Create Account",
    signingUp: "Creating...",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    invalidEmail: "Please enter a valid email address",
    passwordTooShort: "Password must be at least 8 characters",
    passwordMismatch: "Passwords do not match",
    passwordWeak: "Password must contain letters and numbers",
  },
  zh: {
    title: "创建账户",
    subtitle: "注册即可获得免费积分，立即体验 Voicerly！",
    nameLabel: "姓名",
    namePlaceholder: "请输入您的姓名",
    emailLabel: "邮箱地址",
    emailPlaceholder: "name@example.com",
    passwordLabel: "密码",
    passwordPlaceholder: "至少8个字符",
    confirmPasswordLabel: "确认密码",
    confirmPasswordPlaceholder: "再次输入密码",
    signupButton: "创建账户",
    signingUp: "创建中...",
    haveAccount: "已有账户？",
    signIn: "登录",
    invalidEmail: "请输入有效的邮箱地址",
    passwordTooShort: "密码至少需要8个字符",
    passwordMismatch: "两次密码输入不一致",
    passwordWeak: "密码必须包含字母和数字",
  },
}

export function PasswordSignupCard({ language, defaultEmail = "" }: PasswordSignupCardProps) {
  const texts = TEXTS[language]
  const router = useRouter()
  const { login } = useAuth()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [code, setCode] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    // 至少8位，包含字母和数字
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendOtp = async () => {
    setError("")

    const trimmedEmail = email.trim().toLowerCase()

    if (!validateEmail(trimmedEmail)) {
      setError(texts.invalidEmail)
      return
    }

    if (cooldown > 0 || isSendingOtp) return

    setIsSendingOtp(true)
    try {
      const result = await postJson<{ ok: boolean; error?: string }>("/api/send-otp", { email: trimmedEmail })
      if (!result.ok) {
        setError(result.error || "Failed to send verification code")
        return
      }
      setIsOtpSent(true)
      setCooldown(60)
    } catch (err: any) {
      setError(err.message || "Failed to send verification code")
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()
    const trimmedConfirmPassword = confirmPassword.trim()
    const trimmedName = displayName.trim()
    const trimmedCode = code.trim()

    if (!validateEmail(trimmedEmail)) {
      setError(texts.invalidEmail)
      return
    }

    if (!isOtpSent) {
      setError(language === "en" ? "Please send verification code first" : "请先发送验证码")
      return
    }

    if (trimmedCode.length !== 6 || !/\d{6}/.test(trimmedCode)) {
      setError(language === "en" ? "Please enter a valid 6-digit code" : "请输入6位数字验证码")
      return
    }

    if (trimmedPassword.length < 8) {
      setError(texts.passwordTooShort)
      return
    }

    if (!validatePassword(trimmedPassword)) {
      setError(texts.passwordWeak)
      return
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError(texts.passwordMismatch)
      return
    }

    setIsLoading(true)
    try {
      const result = await postJson<{ ok: boolean; user?: any }>("/api/password-signup", {
        email: trimmedEmail,
        password: trimmedPassword,
        displayName: trimmedName || undefined,
        code: trimmedCode,
      })

      if (result.ok && result.user) {
        router.push("/login?tab=password")
      }
    } catch (err: any) {
      setError(err.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormMessage type="error" message={error} />}

      <div className="space-y-2">
        <Label htmlFor="signup-name" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {texts.nameLabel}
        </Label>
        <Input
          id="signup-name"
          type="text"
          placeholder={texts.namePlaceholder}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isLoading}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {texts.emailLabel}
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder={texts.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          {texts.passwordLabel}
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder={texts.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="pr-10"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          {texts.confirmPasswordLabel}
        </Label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={texts.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="pr-10"
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-code" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {language === "en" ? "Verification Code" : "验证码"}
        </Label>
        <div className="flex gap-2">
          <Input
            id="signup-code"
            type="text"
            placeholder={language === "en" ? "6-digit code" : "6位数字"}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={isLoading}
            autoComplete="one-time-code"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSendOtp}
            disabled={isSendingOtp || cooldown > 0 || isLoading}
          >
            {isSendingOtp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : cooldown > 0 ? (
              `${language === "en" ? "Resend" : "重新发送"}(${cooldown}s)`
            ) : (
              language === "en" ? "Send Code" : "发送验证码"
            )}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? texts.signingUp : texts.signupButton}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        {texts.haveAccount}{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          {texts.signIn}
        </Link>
      </div>
    </form>
  )
}
