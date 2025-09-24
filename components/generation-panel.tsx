"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wand2, Loader2, AlertCircle } from "lucide-react"
import { generateVoice, downloadGeneratedAudio, type VoiceGenerationParams, type DownloadedAudio } from "@/lib/api-client"

interface GenerationPanelProps {
  language: "en" | "zh"
  canGenerate: boolean
  credits: number
  onGenerate: () => void
  // 新增API相关参数
  uploadedFile?: File | null
  promptText?: string
  targetText?: string
  cfgValue?: number
  inferenceSteps?: number
  textNormalization?: boolean
  speechEnhancement?: boolean
  // 音频生成回调
  onAudioGenerated?: (audio: DownloadedAudio | null) => void
}

export function GenerationPanel({ 
  language, 
  canGenerate, 
  credits, 
  onGenerate,
  uploadedFile,
  promptText,
  targetText,
  cfgValue = 2,
  inferenceSteps = 10,
  textNormalization = false,
  speechEnhancement = false,
  onAudioGenerated
}: GenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const content = {
    en: {
      generateButton: "Generate Speech",
      generating: "Generating...",
      creditsUsed: "Credits will be used: 1",
      processingSteps: ["Analyzing voice sample...", "Processing text...", "Generating audio...", "Finalizing..."],
      errorTitle: "Generation Failed",
      retryButton: "Retry Generation",
    },
    zh: {
      generateButton: "生成语音",
      generating: "生成中...",
      creditsUsed: "将使用积分：1",
      processingSteps: ["分析语音样本...", "处理文本...", "生成音频...", "完成中..."],
      errorTitle: "生成失败",
      retryButton: "重新生成",
    },
  }

  const {
    generateButton,
    generating,
    creditsUsed,
    processingSteps,
    errorTitle,
    retryButton,
  } = content[language]

  const handleGenerate = async () => {
    if (!targetText) {
      setError(language === "en" ? "Target text is required" : "目标文本不能为空")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError(null)
    onAudioGenerated?.(null)

    let progressInterval: ReturnType<typeof setInterval> | null = null

    try {
      // 检查服务状态
      console.log('Checking VoxCPM service health...')
      const { checkVoxCPMHealth } = await import('@/lib/api-client')
      const isHealthy = await checkVoxCPMHealth()
      if (!isHealthy) {
        throw new Error('VoxCPM服务未运行。请确保服务在localhost:7860端口启动。')
      }
      // 模拟进度更新
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      // 调用VoxCPM API
      const params: VoiceGenerationParams = {
        text_input: targetText,
        prompt_wav_path_input: uploadedFile,
        prompt_text_input: promptText || null,
        cfg_value_input: cfgValue,
        inference_timesteps_input: inferenceSteps,
        do_normalize: textNormalization,
        denoise: speechEnhancement
      }

      console.log('Generation Panel - calling generateVoice with params:', {
        ...params,
        prompt_wav_path_input: uploadedFile ? `File: ${uploadedFile.name}` : null
      })

      const result = await generateVoice(params)
      console.log('Generation Panel - received result:', result)

      const audioData = await downloadGeneratedAudio(result.filepath)
      console.log('Generation Panel - downloaded audio metadata:', audioData)
      
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setProgress(100)
      
      // 通过回调传递生成的音频Blob URL
      onAudioGenerated?.(audioData)
      setIsGenerating(false)
      onGenerate()
      
    } catch (error) {
      setIsGenerating(false)
      setProgress(0)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      console.error('Voice generation failed:', error)
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }


  const currentStep = Math.floor((progress / 100) * processingSteps.length)

  return (
    <div className="space-y-4">
      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive text-sm">{errorTitle}</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || credits < 1}
              size="sm"
              variant="outline"
              className="mt-3 w-full border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              {retryButton}
            </Button>
          </CardContent>
        </Card>
      )}

      {canGenerate && !isGenerating && !error && (
        <p className="text-xs text-muted-foreground text-center">{creditsUsed}</p>
      )}

      {!isGenerating && !error && (
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
