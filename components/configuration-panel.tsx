"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { DownloadedAudio } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Volume2, Download, Play, Pause } from "lucide-react"

interface ConfigurationPanelProps {
  language: "en" | "zh"
  cfgValue: number
  setCfgValue: (value: number) => void
  inferenceSteps: number
  setInferenceSteps: (value: number) => void
  textNormalization: boolean
  setTextNormalization: (value: boolean) => void
  temperature: number
  setTemperature: (value: number) => void
  topP: number
  setTopP: (value: number) => void
  minLength: number
  setMinLength: (value: number) => void
  maxLength: number
  setMaxLength: (value: number) => void
  repetitionPenalty: number
  setRepetitionPenalty: (value: number) => void
  generatedAudio?: DownloadedAudio | null
}

export function ConfigurationPanel({
  language,
  cfgValue,
  setCfgValue,
  inferenceSteps,
  setInferenceSteps,
  textNormalization,
  setTextNormalization,
  temperature,
  setTemperature,
  topP,
  setTopP,
  minLength,
  setMinLength,
  maxLength,
  setMaxLength,
  repetitionPenalty,
  setRepetitionPenalty,
  generatedAudio = null,
}: ConfigurationPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const content = {
    en: {
      cfgTitle: "CFG Value (Guidance Scale)",
      cfgDescription: "Higher values increase adherence to prompt, lower values allow more creativity",
      inferenceTitle: "Inference Timesteps",
      inferenceDescription:
        "Number of inference timesteps for generation (higher values may improve quality but slower)",
      temperatureTitle: "Temperature",
      temperatureDescription: "Balances creativity vs. determinism (lower = more deterministic)",
      topPTitle: "Top P",
      topPDescription: "Controls nucleus sampling diversity (higher = more diverse)",
      minLengthTitle: "Min Length",
      minLengthDescription: "Minimum tokens to generate before stopping",
      maxLengthTitle: "Max Length",
      maxLengthDescription: "Maximum tokens allowed for the generated speech",
      repetitionPenaltyTitle: "Repetition Penalty",
      repetitionPenaltyDescription: "Penalizes repeating phrases; >1 discourages repetition",
      textNormTitle: "Text Normalization",
      textNormDescription: "We use wetext library to normalize the input text.",
      outputTitle: "Output Audio",
      downloadButton: "Download Audio",
      playButton: "Play Audio",
      noAudioMessage: "No audio generated yet",
      audioReady: "generated-voice.mp3",
      readyForDownload: "Ready for download",
    },
    zh: {
      cfgTitle: "CFG 值（引导尺度）",
      cfgDescription: "较高的值增加对提示的遵循度，较低的值允许更多创造性",
      inferenceTitle: "推理时间步",
      inferenceDescription: "生成的推理时间步数（较高的值可能提高质量但速度较慢）",
      temperatureTitle: "温度系数",
      temperatureDescription: "控制创意与确定性的平衡（值越低越稳定）",
      topPTitle: "Top P",
      topPDescription: "控制核采样多样性（值越高越多样）",
      minLengthTitle: "最小生成长度",
      minLengthDescription: "在停止前至少生成多少个 token",
      maxLengthTitle: "最大生成长度",
      maxLengthDescription: "生成语音允许的最大 token 数",
      repetitionPenaltyTitle: "重复惩罚",
      repetitionPenaltyDescription: "大于 1 时可降低重复句子的概率",
      textNormTitle: "文本标准化",
      textNormDescription: "我们使用 wetext 库来标准化输入文本。",
      outputTitle: "输出音频",
      downloadButton: "下载音频",
      playButton: "播放音频",
      noAudioMessage: "尚未生成音频",
      audioReady: "generated-voice.mp3",
      readyForDownload: "准备下载",
    },
  }

  const {
    cfgTitle,
    cfgDescription,
    inferenceTitle,
    inferenceDescription,
    temperatureTitle,
    temperatureDescription,
    topPTitle,
    topPDescription,
    minLengthTitle,
    minLengthDescription,
    maxLengthTitle,
    maxLengthDescription,
    repetitionPenaltyTitle,
    repetitionPenaltyDescription,
    textNormTitle,
    textNormDescription,
    outputTitle,
    downloadButton,
    playButton,
    noAudioMessage,
    audioReady,
    readyForDownload,
  } = content[language]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !generatedAudio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [generatedAudio])

  const hasGeneratedAudio = !!generatedAudio

  const handleDownload = () => {
    if (generatedAudio) {
      const a = document.createElement("a")
      a.href = generatedAudio.url
      a.download = generatedAudio.filename || "generated-voice.mp3"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const generateWaveformBars = () => {
    const bars = []
    for (let i = 0; i < 60; i++) {
      const height = Math.random() * 40 + 10
      const isActive = duration > 0 && i / 60 <= currentTime / duration
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`}
          style={{ height: `${height}px` }}
        />,
      )
    }
    return bars
  }

  const handleMinLengthChange = (value: number) => {
    const newValue = Math.round(value)
    setMinLength(newValue)
    if (newValue > maxLength) {
      setMaxLength(newValue)
    }
  }

  const handleMaxLengthChange = (value: number) => {
    const newValue = Math.round(value)
    setMaxLength(newValue)
    if (newValue < minLength) {
      setMinLength(newValue)
    }
  }

  return (
    <div className="space-y-6">
      {/* CFG Value */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{cfgTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{cfgValue}</span>
              <Badge variant="outline" className="text-xs">
                2
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{cfgDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[cfgValue]}
              onValueChange={(value) => setCfgValue(value[0])}
              max={3}
              min={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>3</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inference Timesteps */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{inferenceTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{inferenceSteps}</span>
              <Badge variant="outline" className="text-xs">
                10
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{inferenceDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[inferenceSteps]}
              onValueChange={(value) => setInferenceSteps(value[0])}
              max={30}
              min={4}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>4</span>
              <span>30</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Normalization */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <p className="text-xs text-muted-foreground mb-3">{textNormDescription}</p>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="text-normalization" 
              checked={textNormalization} 
              onCheckedChange={(checked) => setTextNormalization(checked === true)} 
            />
            <label
              htmlFor="text-normalization"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {textNormTitle}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Temperature */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{temperatureTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{temperature.toFixed(2)}</span>
              <Badge variant="outline" className="text-xs">
                0.7
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{temperatureDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(Number(value[0].toFixed(2)))}
              max={1.5}
              min={0.1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.1</span>
              <span>1.5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top P */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{topPTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{topP.toFixed(2)}</span>
              <Badge variant="outline" className="text-xs">
                0.9
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{topPDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[topP]}
              onValueChange={(value) => setTopP(Number(value[0].toFixed(2)))}
              max={1}
              min={0.1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.1</span>
              <span>1.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Min Length */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{minLengthTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{minLength}</span>
              <Badge variant="outline" className="text-xs">
                10
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{minLengthDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[minLength]}
              onValueChange={(value) => setMinLength(Math.round(value[0]))}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Max Length */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{maxLengthTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{maxLength}</span>
              <Badge variant="outline" className="text-xs">
                200
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{maxLengthDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[maxLength]}
              onValueChange={(value) => setMaxLength(Math.round(value[0]))}
              max={400}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50</span>
              <span>400</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repetition Penalty */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-primary">{repetitionPenaltyTitle}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{repetitionPenalty.toFixed(2)}</span>
              <Badge variant="outline" className="text-xs">
                1.1
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{repetitionPenaltyDescription}</p>
          <div className="space-y-2">
            <Slider
              value={[repetitionPenalty]}
              onValueChange={(value) => setRepetitionPenalty(Number(value[0].toFixed(2)))}
              max={2}
              min={0.5}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5</span>
              <span>2.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <h3 className="text-base font-medium text-primary mb-4">{outputTitle}</h3>
          <div className="space-y-4">
            {hasGeneratedAudio ? (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium">{generatedAudio?.filename || audioReady}</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        {readyForDownload}
                        {typeof generatedAudio?.size === "number" && generatedAudio.size > 0 && (
                          <> • {(generatedAudio.size / 1024 / 1024).toFixed(2)} MB</>
                        )}
                      </div>
                      {generatedAudio?.source && (
                        <div
                          className="text-[11px] text-muted-foreground/70 break-all whitespace-normal max-h-10 overflow-hidden"
                          title={generatedAudio.source}
                        >
                          {generatedAudio.source}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Waveform visualization */}
                <div className="mb-3">
                  <div className="flex items-end justify-center space-x-1 h-16 cursor-pointer" onClick={handleSeek}>
                    {generateWaveformBars()}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={togglePlayback} variant="outline" size="sm" className="flex-1 bg-transparent">
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {playButton}
                  </Button>
                  <Button onClick={handleDownload} variant="default" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    {downloadButton}
                  </Button>
                </div>

                <audio
                  ref={audioRef}
                  src={generatedAudio?.url || ""}
                  className="hidden"
                  onError={(e) => {
                    console.error("Audio loading error:", e)
                    console.log("Trying to load audio from:", generatedAudio)
                  }}
                  onLoadedData={() => {
                    console.log("Audio loaded successfully from:", generatedAudio)
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 bg-muted/30 rounded-lg border-border/50 border-2 border-dashed">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{noAudioMessage}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
