"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  language: "en" | "zh"
  disabled?: boolean
}

const TEXTS = {
  en: {
    label: "Verification Code",
    placeholder: "6-digit code",
  },
  zh: {
    label: "验证码",
    placeholder: "6 位数字",
  },
}

export function OtpInput({ value, onChange, language, disabled }: OtpInputProps) {
  const texts = TEXTS[language]

  const handleChange = (input: string) => {
    // 只允许数字，最多6位
    const digits = input.replace(/\D/g, "").slice(0, 6)
    onChange(digits)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="otp">{texts.label}</Label>
      <Input
        id="otp"
        type="text"
        inputMode="numeric"
        placeholder={texts.placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        maxLength={6}
        autoComplete="one-time-code"
      />
    </div>
  )
}
