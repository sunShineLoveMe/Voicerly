"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { postJson } from "@/lib/http"
import { useAuth } from "@/hooks/use-auth"
import { FormMessage } from "./form-message"

interface PasswordLoginCardProps {
  language: "en" | "zh"
}

const TEXTS = {
  en: {
    title: "Sign in with Password",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Sign In",
    loggingIn: "Signing in...",
    forgotPassword: "Forgot password?",
    invalidEmail: "Please enter a valid email address",
    invalidPassword: "Please enter your password",
  },
  zh: {
    title: "密码登录",
    emailLabel: "邮箱地址",
    emailPlaceholder: "name@example.com",
    passwordLabel: "密码",
    passwordPlaceholder: "请输入密码",
    loginButton: "登录",
    loggingIn: "登录中...",
    forgotPassword: "忘记密码？",
    invalidEmail: "请输入有效的邮箱地址",
    invalidPassword: "请输入密码",
  },
}

export function PasswordLoginCard({ language }: PasswordLoginCardProps) {
  const texts = TEXTS[language]
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!validateEmail(trimmedEmail)) {
      setError(texts.invalidEmail)
      return
    }

    if (!trimmedPassword) {
      setError(texts.invalidPassword)
      return
    }

    setIsLoading(true)
    try {
      const result = await postJson<{ ok: boolean; user?: any }>("/api/password-login", {
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (result.ok && result.user) {
        login({
          ...result.user,
          access_token: "",
        })
        router.push("/account")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormMessage type="error" message={error} />}

      <div className="space-y-2">
        <Label htmlFor="pwd-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {texts.emailLabel}
        </Label>
        <Input
          id="pwd-email"
          type="email"
          placeholder={texts.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pwd-password" className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          {texts.passwordLabel}
        </Label>
        <div className="relative">
          <Input
            id="pwd-password"
            type={showPassword ? "text" : "password"}
            placeholder={texts.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="pr-10"
            autoComplete="current-password"
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

      <div className="text-right">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          {texts.forgotPassword}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? texts.loggingIn : texts.loginButton}
      </Button>
    </form>
  )
}
