"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Mail, ShieldCheck } from "lucide-react"
import { postJson } from "@/lib/http"
import { useToast } from "@/hooks/use-toast"

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SHOULD_USE_TURNSTILE = Boolean(SITE_KEY)

const TEXTS = {
  en: {
    title: "Email Login",
    subtitle: "Sign in or sign up with a one-time code.",
    emailLabel: "Email",
    emailPlaceholder: "name@example.com",
    codeLabel: "Verification Code",
    codePlaceholder: "6-digit code",
    sendButton: "Send Code",
    resendButton: (seconds: number) => `Resend (${seconds}s)`,
    verifyButton: "Verify & Continue",
    emailInvalid: "Please enter a valid email address.",
    codeInvalid: "Verification code must be 6 digits.",
    sendError: "Failed to send the verification code.",
    verifyError: "Verification failed, please try again.",
    sendSuccess: "Code sent successfully. Please check your inbox.",
    verifySuccess: "Verification successful. Redirecting...",
    turnstileLabel: "Security Check",
    turnstileError: "Please complete the security check.",
    altTitle: "Prefer password login?",
    altDescription: "You can still log in with your password below.",
  },
  zh: {
    title: "邮箱验证码登录",
    subtitle: "通过一次性验证码完成注册或登录。",
    emailLabel: "邮箱地址",
    emailPlaceholder: "name@example.com",
    codeLabel: "验证码",
    codePlaceholder: "6 位数字",
    sendButton: "发送验证码",
    resendButton: (seconds: number) => `重新发送 (${seconds}秒)`,
    verifyButton: "验证并登录",
    emailInvalid: "请输入有效的邮箱地址。",
    codeInvalid: "验证码需为 6 位数字。",
    sendError: "验证码发送失败，请稍后重试。",
    verifyError: "验证失败，请检查验证码。",
    sendSuccess: "验证码已发送，请查收邮件。",
    verifySuccess: "验证成功，即将跳转...",
    turnstileLabel: "安全校验",
    turnstileError: "请完成安全校验后再试。",
    altTitle: "想用密码登录？",
    altDescription: "您仍然可以在下方使用邮箱 + 密码登录。",
  },
}

interface EmailOtpFormProps {
  language: "en" | "zh"
  onSuccess?: (email: string) => void
  onError?: (message: string) => void
  defaultRedirect?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
        }
      ) => string
      reset: (id?: string) => void
    }
  }
}

export function EmailOtpForm({ language, onSuccess, onError, defaultRedirect }: EmailOtpFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const texts = useMemo(() => TEXTS[language], [language])

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [hasRequested, setHasRequested] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileReady, setTurnstileReady] = useState(!SHOULD_USE_TURNSTILE)
  const [turnstileId, setTurnstileId] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSendRef = useRef<number>(0)
  const widgetRef = useRef<HTMLDivElement | null>(null)

  const redirectPath = defaultRedirect || "/generate"

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (cooldown <= 0 || intervalRef.current) return

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

  useEffect(() => {
    if (!SHOULD_USE_TURNSTILE) return

    const renderWidget = () => {
      if (!widgetRef.current || !window.turnstile) return
      widgetRef.current.innerHTML = ""
      const id = window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY!,
        callback: (token) => {
          setTurnstileToken(token)
          setTurnstileReady(true)
          setError(null)
        },
        "error-callback": () => {
          setTurnstileReady(false)
          setError(texts.turnstileError)
        },
        "expired-callback": () => {
          setTurnstileReady(false)
          setTurnstileToken(null)
          if (window.turnstile && id) {
            window.turnstile.reset(id)
          }
        },
      })
      setTurnstileId(id)
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    const scriptId = "cf-turnstile-script"
    const existingScript = document.getElementById(scriptId)

    if (existingScript) {
      existingScript.addEventListener("load", renderWidget, { once: true })
      return () => existingScript.removeEventListener("load", renderWidget)
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.addEventListener("load", renderWidget, { once: true })
    document.head.appendChild(script)

    return () => {
      script.removeEventListener("load", renderWidget)
    }
  }, [texts.turnstileError])

  const emailRegex = useMemo(() => /(^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$)/i, [])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setError(null)
    setCode("")
    setHasRequested(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCooldown(0)
    if (SHOULD_USE_TURNSTILE && window.turnstile && turnstileId) {
      window.turnstile.reset(turnstileId)
      setTurnstileToken(null)
      setTurnstileReady(false)
    }
  }

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setCode(digits)
    setError(null)
  }

  const handleSend = async () => {
    const now = Date.now()
    if (now - lastSendRef.current < 800) {
      return
    }
    lastSendRef.current = now

    setError(null)

    if (!emailRegex.test(email)) {
      const message = texts.emailInvalid
      setError(message)
      onError?.(message)
      return
    }

    if (cooldown > 0 || isSending) {
      return
    }

    if (SHOULD_USE_TURNSTILE && (!turnstileReady || !turnstileToken)) {
      const message = texts.turnstileError
      setError(message)
      onError?.(message)
      return
    }

    setIsSending(true)
    try {
      const payload: Record<string, unknown> = { email }
      if (SHOULD_USE_TURNSTILE && turnstileToken) {
        payload.turnstileToken = turnstileToken
      }

      const result = await postJson<{ ok: boolean; error?: string }>("/api/send-otp", payload)

      if (!result.ok) {
        const message = result.error || texts.sendError
        setError(message)
        onError?.(message)
        if (SHOULD_USE_TURNSTILE && window.turnstile && turnstileId) {
          window.turnstile.reset(turnstileId)
          setTurnstileToken(null)
          setTurnstileReady(false)
        }
        return
      }

      toast({
        title: texts.sendSuccess,
      })

      setHasRequested(true)
      setCooldown(60)
    } catch (err: any) {
      const message = err?.message || texts.sendError
      setError(message)
      onError?.(message)
      if (SHOULD_USE_TURNSTILE && window.turnstile && turnstileId) {
        window.turnstile.reset(turnstileId)
        setTurnstileToken(null)
        setTurnstileReady(false)
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    setError(null)

    if (!emailRegex.test(email)) {
      const message = texts.emailInvalid
      setError(message)
      onError?.(message)
      return
    }

    if (code.length !== 6) {
      const message = texts.codeInvalid
      setError(message)
      onError?.(message)
      return
    }

    setIsVerifying(true)
    try {
      const result = await postJson<{ ok: boolean; error?: string }>("/api/verify-otp", { email, code })

      if (!result.ok) {
        const message = result.error || texts.verifyError
        setError(message)
        onError?.(message)
        return
      }

      toast({ title: texts.verifySuccess })

      onSuccess?.(email)
      router.push(redirectPath)
    } catch (err: any) {
      const message = err?.message || texts.verifyError
      setError(message)
      onError?.(message)
    } finally {
      setIsVerifying(false)
    }
  }

  const sendDisabled =
    isSending || cooldown > 0 || !email.trim() || !emailRegex.test(email) || (SHOULD_USE_TURNSTILE && !turnstileReady)

  const verifyDisabled = isVerifying || !hasRequested || code.length !== 6 || !emailRegex.test(email)

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <h2 className="text-2xl font-bold">{texts.title}</h2>
        <p className="text-muted-foreground">{texts.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {texts.emailLabel}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={texts.emailPlaceholder}
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-2">
              <Label htmlFor="code">{texts.codeLabel}</Label>
              <Input
                id="code"
                inputMode="numeric"
                placeholder={texts.codePlaceholder}
                value={code}
                onChange={(event) => handleCodeChange(event.target.value)}
                autoComplete="one-time-code"
                disabled={!hasRequested}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="sm:w-40"
              disabled={sendDisabled}
              onClick={handleSend}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {texts.sendButton}
                </>
              ) : cooldown > 0 ? (
                texts.resendButton(cooldown)
              ) : (
                texts.sendButton
              )}
            </Button>
          </div>

          {SHOULD_USE_TURNSTILE && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                <ShieldCheck className="h-4 w-4" />
                {texts.turnstileLabel}
              </Label>
              <div
                ref={widgetRef}
                className="rounded-md border bg-background p-2"
                data-testid="turnstile-widget"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={verifyDisabled}
            onClick={handleVerify}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {texts.verifyButton}
              </>
            ) : (
              texts.verifyButton
            )}
          </Button>
        </div>

        <Separator />

        <div className="text-sm text-center text-muted-foreground">
          <p className="font-medium">{texts.altTitle}</p>
          <p>{texts.altDescription}</p>
        </div>
      </CardContent>
    </Card>
  )
}


