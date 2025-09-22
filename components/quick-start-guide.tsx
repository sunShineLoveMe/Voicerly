"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Type, Play, Lightbulb, Settings, Zap } from "lucide-react"

interface QuickStartGuideProps {
  language: "en" | "zh"
}

export function QuickStartGuide({ language }: QuickStartGuideProps) {
  const content = {
    en: {
      title: "How to Use",
      steps: [
        { icon: Upload, text: "Upload a short audio prompt" },
        { icon: Type, text: "Enter reference text" },
        { icon: Play, text: "Click Generate" },
      ],
      tipsTitle: "Pro Tips",
      tips: [
        { icon: Settings, text: "Enable speech enhancement for noisy audio." },
        { icon: Zap, text: "Adjust CFG value for more natural or more expressive tone." },
        { icon: Lightbulb, text: "Increase timesteps for better quality, lower for faster results." },
      ],
    },
    zh: {
      title: "使用说明",
      steps: [
        { icon: Upload, text: "上传一段短音频" },
        { icon: Type, text: "输入参考文本" },
        { icon: Play, text: "点击生成" },
      ],
      tipsTitle: "小技巧",
      tips: [
        { icon: Settings, text: "若音频嘈杂，请开启降噪。" },
        { icon: Zap, text: "调整 CFG 值获得更自然或更有表现力的声音。" },
        { icon: Lightbulb, text: "步数越高音质越好，但速度更慢。" },
      ],
    },
  }

  const { title, steps, tipsTitle, tips } = content[language]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <step.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tipsTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <tip.icon className="w-4 h-4 text-accent-foreground" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
