"use client"

import { Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
  language: "en" | "zh"
  error?: string
  disabled?: boolean
}

const TEXTS = {
  en: {
    label: "Email",
    placeholder: "name@example.com",
  },
  zh: {
    label: "邮箱地址",
    placeholder: "name@example.com",
  },
}

export function EmailInput({ value, onChange, language, error, disabled }: EmailInputProps) {
  const texts = TEXTS[language]

  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        {texts.label}
      </Label>
      <Input
        id="email"
        type="email"
        placeholder={texts.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? "border-destructive" : ""}
        autoComplete="email"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
