"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface OtpSendButtonProps {
  email: string
  onSend: () => Promise<void>
  language: "en" | "zh"
  disabled?: boolean
  cooldownSeconds?: number
}

const TEXTS = {
  en: {
    send: "Send Code",
    resend: (sec: number) => `Resend (${sec}s)`,
  },
  zh: {
    send: "发送验证码",
    resend: (sec: number) => `重新发送 (${sec}秒)`,
  },
}

export function OtpSendButton({
  email,
  onSend,
  language,
  disabled,
  cooldownSeconds = 60,
}: OtpSendButtonProps) {
  const [cooldown, setCooldown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const texts = TEXTS[language]

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
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

  const handleSend = async () => {
    if (isLoading || cooldown > 0 || disabled) return

    setIsLoading(true)
    try {
      await onSend()
      setCooldown(cooldownSeconds)
    } catch (error) {
      // 错误由父组件处理
      console.error("OTP send error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = isLoading || cooldown > 0 || disabled || !email

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSend}
      disabled={isDisabled}
      className="w-full sm:w-auto"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {cooldown > 0 ? texts.resend(cooldown) : texts.send}
    </Button>
  )
}
