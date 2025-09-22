"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FAQItem } from "@/components/faq-item"

export default function FAQPage() {
  const [language, setLanguage] = useState<"en" | "zh">("en")

  const content = {
    en: {
      title: "Voicerly FAQ",
      subtitle:
        "We keep things simple for non-technical creators. Find answers to common questions about Voicerly voice generation service.",
      faqs: [
        {
          question: "How do credits work?",
          answer:
            "Each voice generation uses 1 credit. Credits never expire and can be used anytime. You can purchase additional credits or upgrade your plan at any time.",
        },
        {
          question: "What languages are supported?",
          answer:
            "Currently, we support English and Chinese (Mandarin) text input. The AI will generate speech in the same language as your uploaded voice sample.",
        },
        {
          question: "What audio format is generated?",
          answer:
            "We generate high-quality MP3 and WAV audio files. You can choose your preferred format when downloading your generated voice.",
        },
        {
          question: "Can I clone any voice?",
          answer:
            "You can only clone voices that you have legal permission to use. This includes your own voice or voices where you have explicit consent from the speaker. Unauthorized voice cloning is prohibited.",
        },
        {
          question: "What audio formats are supported for upload?",
          answer:
            "We support MP3, WAV, and M4A formats for voice samples. Files should be 5-10 seconds long and under 10MB in size for best results.",
        },
        {
          question: "How long can my generated audio be?",
          answer:
            "Generated audio length depends on your input text. Each credit allows up to 1000 characters of text, which typically results in 1-2 minutes of audio.",
        },
        {
          question: "How accurate is the voice cloning?",
          answer:
            "Our AI achieves high accuracy with clear, high-quality voice samples. For best results, upload a 5-10 second sample with clear speech and minimal background noise.",
        },
        {
          question: "How long does voice generation take?",
          answer:
            "Most voice generations complete within 30-60 seconds. Processing time may vary based on text length and current system load.",
        },
      ],
    },
    zh: {
      title: "Voicerly 常见问题",
      subtitle: "为非技术创作者提供简单易用的体验。查找关于 Voicerly 语音生成服务的常见问题答案。",
      faqs: [
        {
          question: "积分如何计算？",
          answer: "每次语音生成使用1个积分。积分永不过期，可随时使用。您可以随时购买额外积分或升级套餐。",
        },
        {
          question: "支持哪些语言？",
          answer: "目前我们支持英文和中文（普通话）文本输入。AI将以您上传的语音样本的语言生成语音。",
        },
        {
          question: "输出音频是什么格式？",
          answer: "我们生成高质量的MP3和WAV音频文件。您可以在下载生成的语音时选择首选格式。",
        },
        {
          question: "我可以克隆任何声音吗？",
          answer:
            "您只能克隆您有合法使用权限的声音。这包括您自己的声音或您已获得说话者明确同意的声音。未经授权的语音克隆是被禁止的。",
        },
        {
          question: "支持哪些音频格式上传？",
          answer: "我们支持MP3、WAV和M4A格式的语音样本。文件应为5-10秒长度，大小在10MB以下以获得最佳效果。",
        },
        {
          question: "生成的音频可以多长？",
          answer: "生成音频的长度取决于您的输入文本。每个积分允许最多1000个字符的文本，通常可生成1-2分钟的音频。",
        },
        {
          question: "语音克隆的准确度如何？",
          answer:
            "我们的AI在清晰、高质量的语音样本下可达到很高的准确度。为获得最佳效果，请上传5-10秒清晰语音且背景噪音最小的样本。",
        },
        {
          question: "语音生成需要多长时间？",
          answer: "大多数语音生成在30-60秒内完成。处理时间可能因文本长度和当前系统负载而有所不同。",
        },
      ],
    },
  }

  const { title, subtitle, faqs } = content[language]

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-balance mb-4">{title}</h1>
            <p className="text-xl text-muted-foreground text-pretty">{subtitle}</p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} defaultOpen={index === 0} />
            ))}
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
