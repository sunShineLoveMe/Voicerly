"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, LogIn, UserPlus } from "lucide-react"

interface AuthPromptProps {
  language: "en" | "zh"
}

export function AuthPrompt({ language }: AuthPromptProps) {
  const router = useRouter()

  const content = {
    en: {
      title: "Please Login to Continue",
      description: "You need to be logged in to use the voice generation feature. Please sign in or create an account to get started.",
      loginButton: "Login",
      signupButton: "Sign Up",
      benefits: [
        "Get 50 free credits when you sign up",
        "Access to voice generation features",
        "Save your generated audio files",
        "Track your usage history"
      ]
    },
    zh: {
      title: "请先登录",
      description: "您需要登录才能使用语音生成功能。请登录或注册账户开始使用。",
      loginButton: "登录",
      signupButton: "注册",
      benefits: [
        "注册即可获得50个免费积分",
        "使用语音生成功能",
        "保存您生成的音频文件",
        "查看使用历史记录"
      ]
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">{currentContent.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {currentContent.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {language === "en" ? "Benefits of signing up:" : "注册的好处："}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentContent.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              onClick={() => router.push("/login")}
              className="w-full"
              variant="outline"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {currentContent.loginButton}
            </Button>
            <Button 
              onClick={() => router.push("/signup")}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {currentContent.signupButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
