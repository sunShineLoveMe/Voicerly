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

        {/* Three-Step Process */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-border -translate-x-1/2" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
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
