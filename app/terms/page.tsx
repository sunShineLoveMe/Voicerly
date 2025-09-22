"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"

export default function TermsPage() {
  const { language, setLanguage } = useLanguage()

  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "Last updated: December 2024",
      intro:
        "Voicerly provides AI voice generation tools. Users must not use the service for illegal, infringing, deceptive, or harmful activities. All generated content is the user's responsibility.",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content:
            "By accessing and using Voicerly, you accept and agree to be bound by the terms and provision of this agreement.",
        },
        {
          title: "2. Use License",
          content:
            "Permission is granted to temporarily use Voicerly for personal and commercial purposes. This license shall automatically terminate if you violate any of these restrictions.",
        },
        {
          title: "3. User Responsibilities",
          content:
            "You are responsible for ensuring that you have the legal right to use any voice samples you upload. You must not use the service for illegal purposes, including but not limited to impersonation, fraud, or harassment. Label AI-generated content where required.",
        },
        {
          title: "4. Content Ownership",
          content:
            "All generated content is the responsibility of the user. Voicerly does not claim ownership of generated audio files, but reserves the right to remove content that violates these terms.",
        },
        {
          title: "5. Prohibited Uses",
          content:
            "You may not use Voicerly to create content that is illegal, harmful, threatening, abusive, defamatory, or violates any person's rights. This includes creating deepfakes or impersonating others without consent.",
        },
        {
          title: "6. Disclaimer",
          content:
            "Voicerly is provided 'as is' without any representations or warranties. We do not guarantee the accuracy, completeness, or quality of generated content.",
        },
      ],
    },
    zh: {
      title: "服务条款",
      lastUpdated: "最后更新：2024年12月",
      intro:
        "Voicerly 提供 AI 语音生成功能。用户不得将本服务用于违法、侵权、欺骗或有害用途。生成内容的法律责任由用户自行承担。",
      sections: [
        {
          title: "1. 条款接受",
          content: "通过访问和使用 Voicerly，您接受并同意受本协议条款和条件的约束。",
        },
        {
          title: "2. 使用许可",
          content: "授予您临时使用 Voicerly 进行个人和商业用途的权限。如果您违反任何这些限制，此许可将自动终止。",
        },
        {
          title: "3. 用户责任",
          content:
            "您有责任确保您拥有使用上传的任何语音样本的合法权利。您不得将服务用于非法目的，包括但不限于冒充、欺诈或骚扰。在需要时对 AI 生成内容进行标识。",
        },
        {
          title: "4. 内容所有权",
          content:
            "所有生成的内容由用户负责。Voicerly 不声称拥有生成的音频文件的所有权，但保留删除违反这些条款的内容的权利。",
        },
        {
          title: "5. 禁止用途",
          content:
            "您不得使用 Voicerly 创建非法、有害、威胁性、辱骂性、诽谤性或侵犯任何人权利的内容。这包括创建深度伪造或未经同意冒充他人。",
        },
        {
          title: "6. 免责声明",
          content: "Voicerly 按'现状'提供，不提供任何陈述或保证。我们不保证生成内容的准确性、完整性或质量。",
        },
      ],
    },
  }

  const { title, lastUpdated, intro, sections } = content[language]

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground mb-6">{lastUpdated}</p>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground leading-relaxed">{intro}</p>
            </div>
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
