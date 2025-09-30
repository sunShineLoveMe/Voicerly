"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { postJson } from "@/lib/http"
import { useAuth } from "@/hooks/use-auth"
import { FormMessage } from "./form-message"

interface OtpLoginCardProps {
  language: "en" | "zh"
}

const TEXTS = {
  en: {
    title: "Sign in with Email Code",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    codeLabel: "Verification Code",
    codePlaceholder: "6-digit code",
    sendCode: "Send Code",
    resend: (sec: number) => `Resend (${sec}s)`,
    verifyButton: "Verify & Sign In",
    verifying: "Verifying...",
    codeSent: "Verification code sent successfully!",
    invalidEmail: "Please enter a valid email address",
    invalidCode: "Please enter a 6-digit code",
  },
  zh: {
    title: "验证码登录",
    emailLabel: "邮箱地址",
    emailPlaceholder: "name@example.com",
    codeLabel: "验证码",
    codePlaceholder: "6位数字",
    sendCode: "发送验证码",
    resend: (sec: number) => `重新发送 (${sec}秒)`,
    verifyButton: "验证并登录",
    verifying: "验证中...",
    codeSent: "验证码已发送！",
    invalidEmail: "请输入有效的邮箱地址",
    invalidCode: "请输入6位数字验证码",
  },
}

export function OtpLoginCard({ language }: OtpLoginCardProps) {
  const texts = TEXTS[language]
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
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
    } catch (err: any) {
      setError(err.message || "Failed to send code")
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedCode = code.trim()

    if (!validateEmail(trimmedEmail)) {
      setError(texts.invalidEmail)
      return
    }

    if (trimmedCode.length !== 6 || !/^\d{6}$/.test(trimmedCode)) {
      setError(texts.invalidCode)
      return
    }

    setIsVerifying(true)
    try {
      const result = await postJson<{ ok: boolean }>("/api/verify-otp", {
        email: trimmedEmail,
        code: trimmedCode,
      })

      if (result.ok) {
        router.push(`/signup?email=${encodeURIComponent(trimmedEmail)}`)
      }
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // 只允许数字，最多6位
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
    <form onSubmit={handleVerify} className="space-y-4">
      {error && <FormMessage type="error" message={error} />}
      {success && <FormMessage type="success" message={success} />}

      <div className="space-y-2">
        <Label htmlFor="otp-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {texts.emailLabel}
        </Label>
        <Input
          id="otp-email"
          type="email"
          placeholder={texts.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSending || isVerifying}
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="otp-code">{texts.codeLabel}</Label>
          <Input
            id="otp-code"
            type="text"
            inputMode="numeric"
            placeholder={texts.codePlaceholder}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onPaste={handleCodePaste}
            disabled={isSending || isVerifying}
            maxLength={6}
            autoComplete="one-time-code"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleSendCode}
          disabled={isSending || cooldown > 0 || !email.trim()}
          className="w-full sm:w-auto"
        >
          {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {cooldown > 0 ? texts.resend(cooldown) : texts.sendCode}
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isVerifying || code.length !== 6}>
        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isVerifying ? texts.verifying : texts.verifyButton}
      </Button>
    </form>
  )
}
