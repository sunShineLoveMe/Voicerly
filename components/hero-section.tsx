"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Type, Download } from "lucide-react"

interface HeroSectionProps {
  language: "en" | "zh"
}

export function HeroSection({ language }: HeroSectionProps) {
  const content = {
    en: {
      title: "Voicerly",
      subtitle: "Turn your words into voice, instantly.",
      cta: "Start Free Trial – Get Free Credits",
      stepsTitle: "How it works",
      steps: [
        { icon: Upload, title: "Upload Voice Sample", desc: "Upload voice sample" },
        { icon: Type, title: "Enter Text", desc: "Enter text" },
        { icon: Download, title: "Generate and Download", desc: "Generate and download" },
      ],
    },
    zh: {
      title: "Voicerly",
      subtitle: "让你的文字开口说话，随时随地",
      cta: "开始免费试用 – 获取免费积分",
      stepsTitle: "使用方法",
      steps: [
        { icon: Upload, title: "上传语音样本", desc: "上传语音样本" },
        { icon: Type, title: "输入文字", desc: "输入文字" },
        { icon: Download, title: "一键合成并下载", desc: "一键合成并下载" },
      ],
    },
  }

  const { title, subtitle, cta, stepsTitle, steps } = content[language]

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6 leading-tight">{title}</h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">{subtitle}</p>
          <Button size="lg" className="text-lg px-8 py-6 h-auto">
            {cta}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold">{stepsTitle}</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-12 md:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex md:flex-col items-center md:items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-18 md:h-18 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Icon className="w-9 h-9 text-primary" />
                    </div>
                    <div className="md:hidden flex-1 h-px bg-border" />
                  </div>
                  <div className="text-left md:text-center">
                    <h3 className="text-lg font-semibold mb-1 md:mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="md:block hidden w-24 h-px bg-border" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            {language === "en"
              ? "Made for creators: bloggers, podcasters, and video makers."
              : "为创作者而生：博主、播客、视频制作者。"}
          </p>
        </div>
      </div>
    </section>
  )
}
