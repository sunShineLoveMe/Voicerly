"use client"

import { User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NameInputProps {
  value: string
  onChange: (value: string) => void
  language: "en" | "zh"
  error?: string
  disabled?: boolean
}

const TEXTS = {
  en: {
    label: "Full Name",
    placeholder: "Enter your full name",
  },
  zh: {
    label: "姓名",
    placeholder: "请输入您的姓名",
  },
}

export function NameInput({ value, onChange, language, error, disabled }: NameInputProps) {
  const texts = TEXTS[language]

  return (
    <div className="space-y-2">
      <Label htmlFor="name" className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        {texts.label}
      </Label>
      <Input
        id="name"
        type="text"
        placeholder={texts.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? "border-destructive" : ""}
        autoComplete="name"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
