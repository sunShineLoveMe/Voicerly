"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  const [language, setLanguage] = useState<"en" | "zh">("en")

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: December 2024",
      sections: [
        {
          title: "Information We Collect",
          content:
            "We collect information you provide directly to us, such as when you create an account, upload voice samples, or contact us for support. This includes your email address, voice samples, and generated content.",
        },
        {
          title: "How We Use Your Information",
          content:
            "We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about your account and our services.",
        },
        {
          title: "Voice Sample Processing",
          content:
            "Voice samples are processed using AI technology to generate speech. We do not store voice samples longer than necessary for processing and do not use them for any other purpose without your consent.",
        },
        {
          title: "Data Security",
          content:
            "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
        },
        {
          title: "Data Retention",
          content:
            "We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. Voice samples are automatically deleted after processing.",
        },
        {
          title: "Your Rights",
          content:
            "You have the right to access, update, or delete your personal information. You may also request that we stop processing your data in certain circumstances.",
        },
      ],
    },
    zh: {
      title: "隐私政策",
      lastUpdated: "最后更新：2024年12月",
      sections: [
        {
          title: "我们收集的信息",
          content:
            "我们收集您直接提供给我们的信息，例如当您创建账户、上传语音样本或联系我们寻求支持时。这包括您的电子邮件地址、语音样本和生成的内容。",
        },
        {
          title: "我们如何使用您的信息",
          content: "我们使用收集的信息来提供、维护和改进我们的服务，处理交易，并就您的账户和我们的服务与您沟通。",
        },
        {
          title: "语音样本处理",
          content:
            "语音样本使用AI技术处理以生成语音。我们不会将语音样本存储超过处理所需的时间，也不会在未经您同意的情况下将其用于任何其他目的。",
        },
        {
          title: "数据安全",
          content: "我们实施适当的安全措施来保护您的个人信息免受未经授权的访问、更改、披露或销毁。",
        },
        {
          title: "数据保留",
          content: "我们仅在提供服务和遵守法律义务所需的时间内保留您的个人信息。语音样本在处理后会自动删除。",
        },
        {
          title: "您的权利",
          content: "您有权访问、更新或删除您的个人信息。在某些情况下，您也可以要求我们停止处理您的数据。",
        },
      ],
    },
  }

  const { title, lastUpdated, sections } = content[language]

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground">{lastUpdated}</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
