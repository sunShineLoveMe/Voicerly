"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AdvancedSettingsProps {
  language: "en" | "zh"
  speechEnhancement: boolean
  setSpeechEnhancement: (value: boolean) => void
  promptText: string
  setPromptText: (value: string) => void
  cfgValue: number
  setCfgValue: (value: number) => void
  inferenceSteps: number
  setInferenceSteps: (value: number) => void
  textNormalization: boolean
  setTextNormalization: (value: boolean) => void
}

export function AdvancedSettings({
  language,
  speechEnhancement,
  setSpeechEnhancement,
  promptText,
  setPromptText,
  cfgValue,
  setCfgValue,
  inferenceSteps,
  setInferenceSteps,
  textNormalization,
  setTextNormalization,
}: AdvancedSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const content = {
    en: {
      title: "Advanced Settings (optional)",
      enhancementLabel: "Enable ZipEnhancer (noise reduction)",
      enhancementHelp: "Use to clean background noise and improve prompt audio clarity.",
      promptTextLabel: "Prompt Text",
      promptTextPlaceholder: "(Optional) Enter transcript of the uploaded prompt.",
      promptTextHelp: "Used to help the model better align the prompt voice.",
      cfgLabel: "CFG Value (Guidance Scale)",
      cfgTooltip: "Higher = closer to prompt, lower = more creative.",
      stepsLabel: "Inference Timesteps",
      stepsTooltip: "Higher = better quality but slower.",
      normalizationLabel: "Enable text normalization",
      normalizationHelp: "Normalize punctuation, numbers, and common patterns.",
    },
    zh: {
      title: "高级设置（可选）",
      enhancementLabel: "开启 ZipEnhancer（降噪处理）",
      enhancementHelp: "清理背景噪声，提升参考音频清晰度。",
      promptTextLabel: "参考文本",
      promptTextPlaceholder: "（可选）输入已上传参考音频的文本转写。",
      promptTextHelp: "用于提升参考音色与文本对齐效果。",
      cfgLabel: "CFG 值（引导强度）",
      cfgTooltip: "数值高→更贴近参考；数值低→更具自由度。",
      stepsLabel: "推理步数",
      stepsTooltip: "步数越高音质越好但速度更慢。",
      normalizationLabel: "开启文本标准化",
      normalizationHelp: "规范标点、数字与常见文本格式。",
    },
  }

  const {
    title,
    enhancementLabel,
    enhancementHelp,
    promptTextLabel,
    promptTextPlaceholder,
    promptTextHelp,
    cfgLabel,
    cfgTooltip,
    stepsLabel,
    stepsTooltip,
    normalizationLabel,
    normalizationHelp,
  } = content[language]

  return (
    <Card>
      <CardContent className="p-6">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between p-0 h-auto font-semibold text-lg"
        >
          {title}
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>

        {isExpanded && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Speech Enhancement */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="speech-enhancement" checked={speechEnhancement} onCheckedChange={setSpeechEnhancement} />
                  <Label htmlFor="speech-enhancement" className="text-sm font-medium">
                    {enhancementLabel}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">{enhancementHelp}</p>
              </div>

              {/* Prompt Text */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{promptTextLabel}</Label>
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={promptTextPlaceholder}
                  className="min-h-20 resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">{promptTextHelp}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* CFG Value */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">{cfgLabel}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{cfgTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="px-2">
                  <Slider
                    value={[cfgValue]}
                    onValueChange={(value) => setCfgValue(value[0])}
                    min={1}
                    max={3}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1.0</span>
                    <span className="font-medium">{cfgValue}</span>
                    <span>3.0</span>
                  </div>
                </div>
              </div>

              {/* Inference Steps */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm font-medium">{stepsLabel}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{stepsTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="px-2">
                  <Slider
                    value={[inferenceSteps]}
                    onValueChange={(value) => setInferenceSteps(value[0])}
                    min={4}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>4</span>
                    <span className="font-medium">{inferenceSteps}</span>
                    <span>30</span>
                  </div>
                </div>
              </div>

              {/* Text Normalization */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="text-normalization" checked={textNormalization} onCheckedChange={setTextNormalization} />
                  <Label htmlFor="text-normalization" className="text-sm font-medium">
                    {normalizationLabel}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">{normalizationHelp}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
