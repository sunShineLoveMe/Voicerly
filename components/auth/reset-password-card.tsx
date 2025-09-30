"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { postJson } from "@/lib/http"
import { FormMessage } from "./form-message"

interface ResetPasswordCardProps {
  language: "en" | "zh"
}

const TEXTS = {
  en: {
    title: "Reset Password",
    subtitle: "Enter your email to receive a verification code",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    codeLabel: "Verification Code",
    codePlaceholder: "6-digit code",
    passwordLabel: "New Password",
    passwordPlaceholder: "At least 8 characters",
    sendCode: "Send Code",
    resend: (sec: number) => `Resend (${sec}s)`,
    resetButton: "Reset Password",
    resetting: "Resetting...",
    backToLogin: "Back to Login",
    codeSent: "Verification code sent successfully!",
    resetSuccess: "Password reset successfully! Redirecting to login...",
    invalidEmail: "Please enter a valid email address",
    invalidCode: "Please enter a 6-digit code",
    passwordTooShort: "Password must be at least 8 characters",
    passwordWeak: "Password must contain letters and numbers",
  },
  zh: {
    title: "重置密码",
    subtitle: "输入邮箱以接收验证码",
    emailLabel: "邮箱地址",
    emailPlaceholder: "name@example.com",
    codeLabel: "验证码",
    codePlaceholder: "6位数字",
    passwordLabel: "新密码",
    passwordPlaceholder: "至少8个字符",
    sendCode: "发送验证码",
    resend: (sec: number) => `重新发送 (${sec}秒)`,
    resetButton: "重置密码",
    resetting: "重置中...",
    backToLogin: "返回登录",
    codeSent: "验证码已发送！",
    resetSuccess: "密码重置成功！正在跳转到登录页...",
    invalidEmail: "请输入有效的邮箱地址",
    invalidCode: "请输入6位数字验证码",
    passwordTooShort: "密码至少需要8个字符",
    passwordWeak: "密码必须包含字母和数字",
  },
}

export function ResetPasswordCard({ language }: ResetPasswordCardProps) {
  const texts = TEXTS[language]
  const router = useRouter()

  const [step, setStep] = useState<"email" | "reset">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cooldown])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
  }

  const handleSendCode = async () => {
    setError("")
    setSuccess("")

    const trimmedEmail = email.trim().toLowerCase()
    if (!validateEmail(trimmedEmail)) {
      setError(texts.invalidEmail)
      return
    }

    setIsSending(true)
    try {
      await postJson<{ ok: boolean }>("/api/send-otp", { email: trimmedEmail })
      setSuccess(texts.codeSent)
      setCooldown(60)
      setStep("reset")
    } catch (err: any) {
      setError(err.message || "Failed to send code")
    } finally {
      setIsSending(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedCode = code.trim()
    const trimmedPassword = newPassword.trim()

    if (!validateEmail(trimmedEmail)) {
      setError(texts.invalidEmail)
      return
    }

    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      setError(texts.invalidCode)
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

    setIsResetting(true)
    try {
      await postJson<{ ok: boolean }>("/api/reset-password", {
        email: trimmedEmail,
        code: trimmedCode,
        newPassword: trimmedPassword,
      })
      
      setSuccess(texts.resetSuccess)
      setTimeout(() => {
        router.push("/login?tab=password")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Reset failed")
    } finally {
      setIsResetting(false)
    }
  }

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setCode(digits)
  }

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text")
    const digits = paste.replace(/\D/g, "").slice(0, 6)
    setCode(digits)
  }

  return (
    <div className="space-y-4">
      {error && <FormMessage type="error" message={error} />}
      {success && <FormMessage type="success" message={success} />}

      {step === "email" ? (
        // Step 1: Email + Send Code
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {texts.emailLabel}
            </Label>
            <Input
              id="reset-email"
              type="email"
              placeholder={texts.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              autoComplete="email"
            />
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleSendCode}
            disabled={isSending || cooldown > 0 || !email.trim()}
          >
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cooldown > 0 ? texts.resend(cooldown) : texts.sendCode}
          </Button>
        </div>
      ) : (
        // Step 2: Code + New Password
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email-display" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {texts.emailLabel}
            </Label>
            <Input
              id="reset-email-display"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="reset-code">{texts.codeLabel}</Label>
              <Input
                id="reset-code"
                type="text"
                inputMode="numeric"
                placeholder={texts.codePlaceholder}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onPaste={handleCodePaste}
                disabled={isResetting}
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendCode}
              disabled={isSending || cooldown > 0}
              className="w-full sm:w-auto"
            >
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cooldown > 0 ? texts.resend(cooldown) : texts.sendCode}
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              {texts.passwordLabel}
            </Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                placeholder={texts.passwordPlaceholder}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isResetting}
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

          <Button type="submit" className="w-full" disabled={isResetting || code.length !== 6}>
            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isResetting ? texts.resetting : texts.resetButton}
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm text-primary hover:underline inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {texts.backToLogin}
        </Link>
      </div>
    </div>
  )
}
