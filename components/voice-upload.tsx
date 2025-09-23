"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, RotateCcw, Loader2, Type } from "lucide-react"
import { recognizeVoice } from "@/lib/api-client"

interface VoiceUploadProps {
  language: "en" | "zh"
  onFileUpload: (file: File | null) => void
  uploadedFile: File | null
  speechEnhancement: boolean
  setSpeechEnhancement: (value: boolean) => void
  onTranscriptionUpdate?: (text: string) => void
}

export function VoiceUpload({
  language,
  onFileUpload,
  uploadedFile,
  speechEnhancement,
  setSpeechEnhancement,
  onTranscriptionUpdate,
}: VoiceUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const content = {
    en: {
      title: "Upload voice sample (5–10s)",
      subtitle: "Upload a 5-10 second audio file to clone your voice",
      dragText: "Drag and drop your audio file here, or click to browse",
      supportedFormats: "Supported formats: MP3, WAV, M4A (Max 10MB)",
      uploadButton: "Choose File",
      promptLabel: "Prompt Speech (Optional, or let VoxCPM Improvise)",
      replace: "Replace",
      remove: "Remove",
      enhancementLabel: "Prompt Speech Enhancement",
      enhancementDescription: "We use ZipEnhancer model to denoise the prompt audio.",
      transcribeButton: "Auto-transcribe",
      transcribing: "Transcribing...",
      transcriptionError: "Transcription failed",
    },
    zh: {
      title: "上传语音样本（5–10秒）",
      subtitle: "上传5-10秒的音频文件来克隆您的声音",
      dragText: "拖拽音频文件到此处，或点击浏览文件",
      supportedFormats: "支持格式：MP3, WAV, M4A（最大10MB）",
      uploadButton: "选择文件",
      promptLabel: "参考音频（可选，或交给 VoxCPM 自由演绎）",
      replace: "替换",
      remove: "移除",
      enhancementLabel: "参考音频增强",
      enhancementDescription: "我们使用 ZipEnhancer 模型对参考音频进行降噪处理。",
      transcribeButton: "自动转录",
      transcribing: "转录中...",
      transcriptionError: "转录失败",
    },
  }

  const {
    title,
    subtitle,
    dragText,
    supportedFormats,
    uploadButton,
    promptLabel,
    replace,
    remove,
    enhancementLabel,
    enhancementDescription,
    transcribeButton,
    transcribing,
    transcriptionError: transcriptionErrorText,
  } = content[language]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("audio/")) {
      onFileUpload(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeUploadedFile = () => {
    onFileUpload(null)
    setTranscriptionError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTranscribe = async () => {
    if (!uploadedFile || !onTranscriptionUpdate) return

    setIsTranscribing(true)
    setTranscriptionError(null)

    try {
      const result = await recognizeVoice(uploadedFile)
      onTranscriptionUpdate(result.text)
    } catch (error) {
      setTranscriptionError(error instanceof Error ? error.message : transcriptionErrorText)
      console.error('Voice recognition failed:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>

        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{dragText}</p>
            <Button onClick={() => fileInputRef.current?.click()}>{uploadButton}</Button>
            <p className="text-xs text-muted-foreground mt-4">{supportedFormats}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">{promptLabel}</p>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium">{uploadedFile.name}</div>
                  <div className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>

                <div className="flex items-center space-x-2">
                  {onTranscriptionUpdate && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTranscribe}
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Type className="w-4 h-4 mr-1" />
                      )}
                      {isTranscribing ? transcribing : transcribeButton}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {replace}
                  </Button>
                  <Button variant="outline" size="sm" onClick={removeUploadedFile}>
                    <X className="w-4 h-4 mr-1" />
                    {remove}
                  </Button>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-3">{enhancementDescription}</p>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="speech-enhancement" 
              checked={speechEnhancement} 
              onCheckedChange={(checked) => setSpeechEnhancement(checked === true)} 
            />
            <label
              htmlFor="speech-enhancement"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {enhancementLabel}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
