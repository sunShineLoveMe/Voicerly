"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AccountOverview } from "@/components/account-overview"
import { UsageHistory } from "@/components/usage-history"
import { AccountSettings } from "@/components/account-settings"

export default function AccountPage() {
  const [language, setLanguage] = useState<"en" | "zh">("en")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Mock usage history data
  const mockHistory = [
    {
      id: "1",
      date: "2024-12-15",
      textSnippet: "Welcome to Voicerly AI voice generation service. This is a sample text...",
      status: "completed" as const,
      downloadUrl: "/mock-audio-1.mp3",
    },
    {
      id: "2",
      date: "2024-12-14",
      textSnippet: "Hello world, this is another test of the voice generation system...",
      status: "completed" as const,
      downloadUrl: "/mock-audio-2.mp3",
    },
    {
      id: "3",
      date: "2024-12-13",
      textSnippet: "Processing this longer text to demonstrate the voice cloning capabilities...",
      status: "processing" as const,
    },
  ]

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser({
        ...parsedUser,
        totalGenerated: 15,
        joinDate: "Dec 2024",
      })
    } else {
      // Redirect to login if not authenticated
      router.push("/login")
    }
  }, [router])

  const handleBuyCredits = () => {
    router.push("/pricing")
  }

  const handleUpdateProfile = (data: { name: string; email: string }) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const pageTitle = {
    en: "My Voicerly Account",
    zh: "我的 Voicerly 账户",
  }

  const pageSubtitle = {
    en: "Manage your account, view usage history, and update preferences",
    zh: "管理您的账户，查看使用历史，更新偏好设置",
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{language === "en" ? "Loading account..." : "加载账户信息..."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{pageTitle[language]}</h1>
            <p className="text-muted-foreground">{pageSubtitle[language]}</p>
          </div>

          <div className="grid gap-8">
            {/* Account Overview */}
            <AccountOverview language={language} user={user} onBuyCredits={handleBuyCredits} />

            {/* Usage History */}
            <UsageHistory language={language} history={mockHistory} />

            {/* Account Settings */}
            <AccountSettings
              language={language}
              user={user}
              onLanguageChange={setLanguage}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
