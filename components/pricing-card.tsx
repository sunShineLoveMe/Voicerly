"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface PricingPlan {
  name: string
  credits: number
  price: number
  popular?: boolean
  features: string[]
}

interface PricingCardProps {
  plan: PricingPlan
  language: "en" | "zh"
  onPurchase: (plan: PricingPlan) => void
}

export function PricingCard({ plan, language, onPurchase }: PricingCardProps) {
  const content = {
    en: {
      buyNow: "Buy Now",
      credits: "credits",
      popular: "Most Popular",
      perCredit: "per credit",
    },
    zh: {
      buyNow: "立即购买",
      credits: "积分",
      popular: "最受欢迎",
      perCredit: "每积分",
    },
  }

  const { buyNow, credits, popular, perCredit } = content[language]

  return (
    <Card className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          {popular}
        </Badge>
      )}
      <CardHeader className="text-center pb-4">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <div className="text-muted-foreground mt-1">
            {plan.credits} {credits}
          </div>
          <div className="text-sm text-muted-foreground">
            ${(plan.price / plan.credits).toFixed(3)} {perCredit}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          size="lg"
          variant={plan.popular ? "default" : "outline"}
          onClick={() => onPurchase(plan)}
        >
          {buyNow}
        </Button>
      </CardContent>
    </Card>
  )
}
