"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wand2, Download, Play, Pause, Loader2 } from "lucide-react"

interface GenerationPanelProps {
  language: "en" | "zh"
  canGenerate: boolean
  credits: number
  onGenerate: () => void
}

export function GenerationPanel({ language, canGenerate, credits, onGenerate }: GenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const content = {
    en: {
      generateButton: "Generate Speech",
      generating: "Generating...",
      creditsUsed: "Credits will be used: 1",
      downloadAudioLabel: "Download Audio",
      playAudioLabel: "Play Audio",
      pauseAudioLabel: "Pause",
      processingSteps: ["Analyzing voice sample...", "Processing text...", "Generating audio...", "Finalizing..."],
    },
    zh: {
      generateButton: "生成语音",
      generating: "生成中...",
      creditsUsed: "将使用积分：1",
      downloadAudioLabel: "下载音频",
      playAudioLabel: "播放音频",
      pauseAudioLabel: "暂停",
      processingSteps: ["分析语音样本...", "处理文本...", "生成音频...", "完成中..."],
    },
  }

  const {
    generateButton,
    generating,
    creditsUsed,
    downloadAudioLabel,
    playAudioLabel,
    pauseAudioLabel,
    processingSteps,
  } = content[language]

  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulate generation process
    for (let i = 0; i < processingSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setProgress(((i + 1) / processingSteps.length) * 100)
    }

    // Simulate generated audio
    setGeneratedAudio("/placeholder-audio.mp3")
    setIsGenerating(false)
    onGenerate()
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // In a real app, this would control audio playback
  }

  const downloadAudio = () => {
    // In a real app, this would trigger audio download
    const link = document.createElement("a")
    link.href = generatedAudio || ""
    link.download = "generated-voice.mp3"
    link.click()
  }

  const currentStep = Math.floor((progress / 100) * processingSteps.length)

  return (
    <div className="space-y-4">
      {canGenerate && !isGenerating && !generatedAudio && (
        <p className="text-xs text-muted-foreground text-center">{creditsUsed}</p>
      )}

      {!isGenerating && !generatedAudio && (
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || credits < 1}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          {generateButton}
        </Button>
      )}

      {isGenerating && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="font-medium">{generating}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {processingSteps[currentStep] || processingSteps[processingSteps.length - 1]}
                </p>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {generatedAudio && !isGenerating && (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">generated-voice.mp3</p>
                    <p className="text-xs text-muted-foreground">Ready for download</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? pauseAudioLabel : playAudioLabel}
                  </Button>
                  <Button size="sm" onClick={downloadAudio}>
                    <Download className="w-4 h-4 mr-2" />
                    {downloadAudioLabel}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {credits < 1 && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            {language === "en"
              ? "Insufficient credits. Please purchase more credits to continue."
              : "积分不足。请购买更多积分以继续。"}
          </p>
        </div>
      )}
    </div>
  )
}
