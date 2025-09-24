"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { VoiceUpload } from "@/components/voice-upload"
import { TextInput } from "@/components/text-input"
import { TargetTextInput } from "@/components/target-text-input"
import { GenerationPanel } from "@/components/generation-panel"
import { Badge } from "@/components/ui/badge"
import { ConfigurationPanel } from "@/components/configuration-panel"
import { useLanguage } from "@/hooks/use-language"

export default function GeneratePage() {
  const { language, setLanguage } = useLanguage()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [promptText, setPromptText] = useState<string>("")
  const [targetText, setTargetText] = useState<string>("")
  const [credits, setCredits] = useState(50)

  const [speechEnhancement, setSpeechEnhancement] = useState(true)
  const [textNormalization, setTextNormalization] = useState(false)
  const [cfgValue, setCfgValue] = useState(2)
  const [inferenceSteps, setInferenceSteps] = useState(10)
  
  // 添加生成音频的状态管理
  const [generatedAudio, setGeneratedAudio] = useState<{ url: string; filename: string; mimeType: string; size: number; source: string } | null>(null)

  const canGenerate = Boolean(
    uploadedFile && 
    (typeof promptText === 'string' && promptText.trim().length > 0) && 
    (typeof targetText === 'string' && targetText.trim().length > 0)
  )

  const handleGenerate = () => {
    if (canGenerate && credits > 0) {
      setCredits(credits - 1)
    }
  }

  const pageTitle = {
    en: "Generate with Voicerly",
    zh: "使用 Voicerly 生成",
  }

  const creditsLabel = {
    en: "Credits",
    zh: "积分余额",
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation language={language} onLanguageChange={setLanguage} />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{pageTitle[language]}</h1>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {creditsLabel[language]}: {credits}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Audio Upload and Text Inputs */}
            <div className="space-y-6">
              <VoiceUpload
                language={language}
                onFileUpload={setUploadedFile}
                uploadedFile={uploadedFile}
                speechEnhancement={speechEnhancement}
                setSpeechEnhancement={setSpeechEnhancement}
                onTranscriptionUpdate={setPromptText}
              />

              <TextInput
                language={language}
                text={promptText}
                onTextChange={setPromptText}
                placeholder={
                  language === "en"
                    ? "Enter the text that corresponds to your uploaded audio file. This helps the AI understand the voice characteristics."
                    : "输入与您上传的音频文件对应的文本。这有助于AI理解语音特征。"
                }
                title={language === "en" ? "Prompt Text" : "提示文本"}
              />

              <TargetTextInput language={language} targetText={targetText} onTargetTextChange={setTargetText} />

              <GenerationPanel
                language={language}
                canGenerate={canGenerate}
                credits={credits}
                onGenerate={handleGenerate}
                uploadedFile={uploadedFile}
                promptText={promptText}
                targetText={targetText}
                cfgValue={cfgValue}
                inferenceSteps={inferenceSteps}
                textNormalization={textNormalization}
                speechEnhancement={speechEnhancement}
                onAudioGenerated={setGeneratedAudio}
              />
            </div>

            {/* Right Column - Configuration Controls Only */}
            <div className="space-y-6">
              <ConfigurationPanel
                language={language}
                cfgValue={cfgValue}
                setCfgValue={setCfgValue}
                inferenceSteps={inferenceSteps}
                setInferenceSteps={setInferenceSteps}
                textNormalization={textNormalization}
                setTextNormalization={setTextNormalization}
                generatedAudio={generatedAudio}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  )
}
