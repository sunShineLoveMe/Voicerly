"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  language: "en" | "zh"
  label?: string
  error?: string
  disabled?: boolean
  showStrength?: boolean
}

const TEXTS = {
  en: {
    label: "Password",
    placeholder: "Enter your password",
    show: "Show",
    hide: "Hide",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  },
  zh: {
    label: "密码",
    placeholder: "请输入密码",
    show: "显示",
    hide: "隐藏",
    weak: "弱",
    medium: "中",
    strong: "强",
  },
}

function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  if (password.length < 8) return "weak"
  if (password.length < 12 && /[a-zA-Z]/.test(password) && /\d/.test(password)) return "medium"
  if (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^a-zA-Z\d]/.test(password)
  )
    return "strong"
  return "medium"
}

export function PasswordInput({
  value,
  onChange,
  language,
  label,
  error,
  disabled,
  showStrength = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const texts = TEXTS[language]
  const strength = showStrength && value ? getPasswordStrength(value) : null

  const strengthColor = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-muted-foreground" />
        {label || texts.label}
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={texts.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={error ? "border-destructive pr-10" : "pr-10"}
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
          <span className="sr-only">{showPassword ? texts.hide : texts.show}</span>
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {showStrength && value && strength && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${strengthColor[strength]}`}
              style={{
                width: strength === "weak" ? "33%" : strength === "medium" ? "66%" : "100%",
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {strength === "weak" ? texts.weak : strength === "medium" ? texts.medium : texts.strong}
          </span>
        </div>
      )}
    </div>
  )
}
