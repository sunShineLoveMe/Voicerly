"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FAQItem } from "@/components/faq-item"
import { useLanguage } from "@/hooks/use-language"

export default function FAQPage() {
  const { language, setLanguage } = useLanguage()

  const content = {
    en: {
      title: "Voicerly FAQ",
      subtitle:
        "We keep things simple for non-technical creators. Find answers to common questions about Voicerly voice generation service.",
      faqs: [
        {
          question: "How do credits work?",
          answer:
            "Each voice generation uses 1 credit. New users get 50 free credits upon registration. Credits never expire and can be used anytime. You can purchase additional credits or upgrade your plan at any time.",
        },
        {
          question: "What languages are supported?",
          answer:
            "Currently, we support English and Chinese (Mandarin) text input. The AI will generate speech in the same language as your uploaded voice sample. We're working on adding more languages soon.",
        },
        {
          question: "What audio formats are supported for upload?",
          answer:
            "We support MP3, WAV, and M4A formats for voice samples. Files should be 10-18 seconds long and under 10MB in size for best results. Longer samples provide better voice cloning quality.",
        },
        {
          question: "What audio format is generated?",
          answer:
            "We generate high-quality MP3 audio files by default. The output maintains the characteristics of your uploaded voice sample while delivering clear, natural-sounding speech.",
        },
        {
          question: "Can I clone any voice?",
          answer:
            "You can only clone voices that you have legal permission to use. This includes your own voice or voices where you have explicit consent from the speaker. Unauthorized voice cloning is strictly prohibited and violates our terms of service.",
        },
        {
          question: "How long can my generated audio be?",
          answer:
            "Generated audio length depends on your input text. Each credit allows up to 1000 characters of text, which typically results in 1-2 minutes of audio. Longer texts require more credits.",
        },
        {
          question: "How accurate is the voice cloning?",
          answer:
            "Our AI achieves high accuracy with clear, high-quality voice samples. For best results, upload a 10-18 second sample with clear speech, minimal background noise, and consistent tone. We use advanced ZipEnhancer technology for audio enhancement.",
        },
        {
          question: "How long does voice generation take?",
          answer:
            "Most voice generations complete within 30-60 seconds. Processing time may vary based on text length, audio quality, and current system load. You'll receive a notification when your audio is ready.",
        },
        {
          question: "Do I need to create an account?",
          answer:
            "Yes, you need to create an account to use Voicerly. Registration is free and gives you 50 credits to start. You can browse the interface without an account, but you'll need to sign up to upload audio samples and generate voice content.",
        },
        {
          question: "What is CFG Value and Inference Steps?",
          answer:
            "CFG Value (Guidance Scale) controls how closely the AI follows your prompt - higher values increase adherence, lower values allow more creativity. Inference Steps control generation quality - higher values may improve quality but take longer to process.",
        },
        {
          question: "Can I use the generated audio commercially?",
          answer:
            "Yes, you can use the generated audio for commercial purposes as long as you have the legal right to clone the original voice. However, you're responsible for ensuring compliance with local laws and regulations regarding voice cloning and AI-generated content.",
        },
        {
          question: "What if I'm not satisfied with the results?",
          answer:
            "We're committed to providing high-quality voice generation. If you're not satisfied with the results, try uploading a higher quality voice sample or adjusting the generation parameters. For technical issues, please contact our support team.",
        },
      ],
    },
    zh: {
      title: "Voicerly 常见问题",
      subtitle: "为非技术创作者提供简单易用的体验。查找关于 Voicerly 语音生成服务的常见问题答案。",
      faqs: [
        {
          question: "积分如何计算？",
          answer: "每次语音生成使用1个积分。新用户注册即可获得50个免费积分。积分永不过期，可随时使用。您可以随时购买额外积分或升级套餐。",
        },
        {
          question: "支持哪些语言？",
          answer: "目前我们支持英文和中文（普通话）文本输入。AI将以您上传的语音样本的语言生成语音。我们正在努力添加更多语言支持。",
        },
        {
          question: "支持哪些音频格式上传？",
          answer: "我们支持MP3、WAV和M4A格式的语音样本。文件应为10-18秒长度，大小在10MB以下以获得最佳效果。更长的样本能提供更好的语音克隆质量。",
        },
        {
          question: "输出音频是什么格式？",
          answer: "我们默认生成高质量的MP3音频文件。输出保持您上传语音样本的特征，同时提供清晰、自然的语音效果。",
        },
        {
          question: "我可以克隆任何声音吗？",
          answer:
            "您只能克隆您有合法使用权限的声音。这包括您自己的声音或您已获得说话者明确同意的声音。未经授权的语音克隆是被严格禁止的，违反我们的服务条款。",
        },
        {
          question: "生成的音频可以多长？",
          answer: "生成音频的长度取决于您的输入文本。每个积分允许最多1000个字符的文本，通常可生成1-2分钟的音频。更长的文本需要更多积分。",
        },
        {
          question: "语音克隆的准确度如何？",
          answer:
            "我们的AI在清晰、高质量的语音样本下可达到很高的准确度。为获得最佳效果，请上传10-18秒清晰语音、背景噪音最小且音调一致的样本。我们使用先进的ZipEnhancer技术进行音频增强。",
        },
        {
          question: "语音生成需要多长时间？",
          answer: "大多数语音生成在30-60秒内完成。处理时间可能因文本长度、音频质量和当前系统负载而有所不同。音频准备就绪时您会收到通知。",
        },
        {
          question: "我需要创建账户吗？",
          answer: "是的，您需要创建账户才能使用Voicerly。注册是免费的，并为您提供50个积分开始使用。您可以无需账户浏览界面，但需要注册才能上传音频样本和生成语音内容。",
        },
        {
          question: "CFG值和推理步数是什么？",
          answer: "CFG值（引导尺度）控制AI对您提示的遵循程度 - 较高的值增加遵循度，较低的值允许更多创造性。推理步数控制生成质量 - 较高的值可能提高质量但处理时间更长。",
        },
        {
          question: "我可以将生成的音频用于商业用途吗？",
          answer: "是的，只要您有合法权利克隆原始声音，就可以将生成的音频用于商业目的。但是，您有责任确保遵守当地关于语音克隆和AI生成内容的法律法规。",
        },
        {
          question: "如果我对结果不满意怎么办？",
          answer: "我们致力于提供高质量的语音生成服务。如果您对结果不满意，请尝试上传更高质量的语音样本或调整生成参数。如有技术问题，请联系我们的支持团队。",
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
