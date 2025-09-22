"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react"
import Link from "next/link"

interface AuthFormProps {
  mode: "login" | "signup"
  language: "en" | "zh"
  onSubmit: (data: { email: string; password: string; name?: string }) => void
}

export function AuthForm({ mode, language, onSubmit }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const content = {
    en: {
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to your Voicerly account",
        submitButton: "Sign In",
        switchText: "Don't have an account?",
        switchLink: "Sign up",
        forgotPassword: "Forgot password?",
      },
      signup: {
        title: "Create Account",
        subtitle: "Sign up and get free credits to try Voicerly!",
        submitButton: "Create Account",
        switchText: "Already have an account?",
        switchLink: "Sign in",
        freeCredits: "Get 10 free credits when you sign up",
      },
      fields: {
        name: "Full Name",
        email: "Email Address",
        password: "Password",
        namePlaceholder: "Enter your full name",
        emailPlaceholder: "Enter your email address",
        passwordPlaceholder: "Enter your password",
      },
      validation: {
        nameRequired: "Name is required",
        emailRequired: "Email is required",
        emailInvalid: "Please enter a valid email",
        passwordRequired: "Password is required",
        passwordTooShort: "Password must be at least 8 characters",
      },
    },
    zh: {
      login: {
        title: "欢迎回来",
        subtitle: "登录您的Voicerly账户",
        submitButton: "登录",
        switchText: "还没有账户？",
        switchLink: "注册",
        forgotPassword: "忘记密码？",
      },
      signup: {
        title: "创建账户",
        subtitle: "注册即可获得免费积分，立即体验 Voicerly！",
        submitButton: "创建账户",
        switchText: "已有账户？",
        switchLink: "登录",
        freeCredits: "注册即可获得10个免费积分",
      },
      fields: {
        name: "姓名",
        email: "邮箱地址",
        password: "密码",
        namePlaceholder: "请输入您的姓名",
        emailPlaceholder: "请输入您的邮箱地址",
        passwordPlaceholder: "请输入您的密码",
      },
      validation: {
        nameRequired: "姓名为必填项",
        emailRequired: "邮箱为必填项",
        emailInvalid: "请输入有效的邮箱地址",
        passwordRequired: "密码为必填项",
        passwordTooShort: "密码至少需要8个字符",
      },
    },
  }

  const currentContent = content[language][mode]
  const { fields, validation } = content[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (mode === "signup" && !formData.name.trim()) {
      alert(validation.nameRequired)
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      alert(validation.emailRequired)
      setIsLoading(false)
      return
    }

    if (!formData.password.trim()) {
      alert(validation.passwordRequired)
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      alert(validation.passwordTooShort)
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onSubmit({
      email: formData.email,
      password: formData.password,
      ...(mode === "signup" && { name: formData.name }),
    })

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <h1 className="text-2xl font-bold">{currentContent.title}</h1>
        <p className="text-muted-foreground">{currentContent.subtitle}</p>
        {mode === "signup" && (
          <div className="mt-2 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">{currentContent.freeCredits}</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">{fields.name}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={fields.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{fields.email}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={fields.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{fields.password}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={fields.passwordPlaceholder}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === "en" ? "Please wait..." : "请稍候..."}
              </>
            ) : (
              currentContent.submitButton
            )}
          </Button>
        </form>

        {mode === "login" && (
          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              {currentContent.forgotPassword}
            </Link>
          </div>
        )}

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          {currentContent.switchText}{" "}
          <Link href={mode === "login" ? "/signup" : "/login"} className="text-primary hover:underline font-medium">
            {currentContent.switchLink}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
