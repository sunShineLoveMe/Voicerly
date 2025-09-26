"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, LogIn, UserPlus, Gift } from "lucide-react"

interface AuthDialogProps {
  language: "en" | "zh"
  isOpen: boolean
  onClose: () => void
  trigger?: string // What action triggered this dialog
}

export function AuthDialog({ language, isOpen, onClose, trigger }: AuthDialogProps) {
  const router = useRouter()

  const content = {
    en: {
      title: "Login Required",
      description: trigger 
        ? `To ${trigger}, please sign in or create an account.`
        : "Please sign in or create an account to continue.",
      loginButton: "Login",
      signupButton: "Sign Up",
      benefits: [
        "Get 50 free credits when you sign up",
        "Save your generated audio files",
        "Access your generation history",
        "No credit card required"
      ],
      trialNote: "You're currently using trial credits. Sign up to get more!"
    },
    zh: {
      title: "需要登录",
      description: trigger 
        ? `要${trigger}，请登录或注册账户。`
        : "请登录或注册账户以继续使用。",
      loginButton: "登录",
      signupButton: "注册",
      benefits: [
        "注册即可获得50个免费积分",
        "保存您生成的音频文件",
        "查看生成历史记录",
        "无需信用卡"
      ],
      trialNote: "您正在使用试用积分。注册可获得更多积分！"
    }
  }

  const currentContent = content[language]

  const handleLogin = () => {
    onClose()
    router.push("/login")
  }

  const handleSignup = () => {
    onClose()
    router.push("/signup")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-orange-600" />
            </div>
            <DialogTitle className="text-lg">{currentContent.title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {currentContent.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Trial note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Gift className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{currentContent.trialNote}</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {language === "en" ? "Benefits of signing up:" : "注册的好处："}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentContent.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col space-y-2 pt-2">
            <Button 
              onClick={handleSignup}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {currentContent.signupButton}
            </Button>
            <Button 
              onClick={handleLogin}
              className="w-full"
              variant="outline"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {currentContent.loginButton}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
