"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Globe, User, Mail, Save } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AccountSettingsProps {
  language: "en" | "zh"
  user: {
    name: string
    email: string
  }
  onLanguageChange: (lang: "en" | "zh") => void
  onUpdateProfile: (data: { name: string; email: string }) => void
}

export function AccountSettings({ language, user, onLanguageChange, onUpdateProfile }: AccountSettingsProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  })
  const [isLoading, setIsLoading] = useState(false)

  const content = {
    en: {
      title: "Account Settings",
      profileSection: "Profile Information",
      languageSection: "Language Preferences",
      name: "Full Name",
      email: "Email Address",
      currentLanguage: "Current Language",
      saveChanges: "Save Changes",
      saving: "Saving...",
      namePlaceholder: "Enter your full name",
      emailPlaceholder: "Enter your email address",
    },
    zh: {
      title: "账户设置",
      profileSection: "个人信息",
      languageSection: "语言偏好",
      name: "姓名",
      email: "邮箱地址",
      currentLanguage: "当前语言",
      saveChanges: "保存更改",
      saving: "保存中...",
      namePlaceholder: "请输入您的姓名",
      emailPlaceholder: "请输入您的邮箱地址",
    },
  }

  const {
    title,
    profileSection,
    languageSection,
    name,
    email,
    currentLanguage,
    saveChanges,
    saving,
    namePlaceholder,
    emailPlaceholder,
  } = content[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onUpdateProfile(formData)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">{profileSection}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{name}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? saving : saveChanges}
            </Button>
          </form>
        </div>

        <Separator />

        {/* Language Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4">{languageSection}</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label>{currentLanguage}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "en" ? "Choose your preferred language" : "选择您的首选语言"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === "en" ? "English" : "中文"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onLanguageChange("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLanguageChange("zh")}>中文</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
