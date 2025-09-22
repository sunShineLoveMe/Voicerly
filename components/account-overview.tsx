"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Zap, TrendingUp } from "lucide-react"

interface AccountOverviewProps {
  language: "en" | "zh"
  user: {
    name: string
    email: string
    credits: number
    totalGenerated: number
    joinDate: string
  }
  onBuyCredits: () => void
}

export function AccountOverview({ language, user, onBuyCredits }: AccountOverviewProps) {
  const content = {
    en: {
      title: "Account Overview",
      creditsRemaining: "Credits balance",
      totalGenerated: "Total Generated",
      memberSince: "Member Since",
      buyCredits: "Buy more credits",
      voiceGenerations: "voice generations",
    },
    zh: {
      title: "账户概览",
      creditsRemaining: "积分余额",
      totalGenerated: "总生成数",
      memberSince: "注册时间",
      buyCredits: "购买更多积分",
      voiceGenerations: "次语音生成",
    },
  }

  const { title, creditsRemaining, totalGenerated, memberSince, buyCredits, voiceGenerations } = content[language]

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.credits}</div>
            <div className="text-sm text-muted-foreground">{creditsRemaining}</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold">{user.totalGenerated}</div>
            <div className="text-sm text-muted-foreground">{totalGenerated}</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-lg font-semibold">{user.joinDate}</div>
            <div className="text-sm text-muted-foreground">{memberSince}</div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={onBuyCredits} size="lg">
            <CreditCard className="w-4 h-4 mr-2" />
            {buyCredits}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
