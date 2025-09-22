"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PricingCard } from "@/components/pricing-card"
import { Card, CardContent } from "@/components/ui/card"
import { Gift } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export default function PricingPage() {
  const { language, setLanguage } = useLanguage()

  const content = {
    en: {
      title: "Choose a plan that grows with you.",
      subtitle: "Clear, credit-based pricing. No surprises. Made for creators: bloggers, podcasters, and video makers.",
      freeTrialTitle: "New users get free trial credits",
      freeTrialDesc: "Get 10 free credits when you sign up. No credit card required.",
      plans: [
        {
          name: "Starter",
          credits: 100,
          price: 9.99,
          features: [
            "100 credits",
            "High-quality AI voice cloning",
            "Support for English & Chinese",
            "MP3 & WAV export formats",
            "Email support",
          ],
        },
        {
          name: "Pro",
          credits: 500,
          price: 39.99,
          popular: true,
          features: [
            "500 credits",
            "Priority processing",
            "High-quality AI voice cloning",
            "Support for English & Chinese",
            "MP3 & WAV export formats",
            "Priority email support",
            "Bulk generation tools",
          ],
        },
        {
          name: "Enterprise",
          credits: 1000,
          price: 69.99,
          features: [
            "1000+ credits",
            "Fastest processing speed",
            "High-quality AI voice cloning",
            "Support for English & Chinese",
            "All export formats",
            "Dedicated support",
            "API access",
            "Custom voice training",
          ],
        },
      ],
    },
    zh: {
      title: "选择适合你的方案",
      subtitle: "透明的积分计费，没有隐藏费用。为创作者而生：博主、播客、视频制作者。",
      freeTrialTitle: "新用户可获免费试用积分",
      freeTrialDesc: "注册即可获得10个免费积分，无需信用卡。",
      plans: [
        {
          name: "Starter",
          credits: 100,
          price: 9.99,
          features: ["100 积分", "高质量AI语音克隆", "支持中英文", "MP3和WAV导出格式", "邮件支持"],
        },
        {
          name: "Pro",
          credits: 500,
          price: 39.99,
          popular: true,
          features: [
            "500 积分",
            "优先处理",
            "高质量AI语音克隆",
            "支持中英文",
            "MP3和WAV导出格式",
            "优先邮件支持",
            "批量生成工具",
          ],
        },
        {
          name: "Enterprise",
          credits: 1000,
          price: 69.99,
          features: [
            "1000+ 积分",
            "最快处理速度",
            "高质量AI语音克隆",
            "支持中英文",
            "所有导出格式",
            "专属支持",
            "API访问",
            "自定义语音训练",
          ],
        },
      ],
    },
  }

  const { title, subtitle, freeTrialTitle, freeTrialDesc, plans } = content[language]

  const handlePurchase = (plan: any) => {
    // In a real app, this would redirect to payment processing
    console.log("Purchasing plan:", plan)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-balance mb-4">{title}</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">{subtitle}</p>
          </div>

          {/* Free Trial Banner */}
          <Card className="mb-12 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-4">
                <Gift className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-1">{freeTrialTitle}</h3>
                  <p className="text-muted-foreground">{freeTrialDesc}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} language={language} onPurchase={handlePurchase} />
            ))}
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
