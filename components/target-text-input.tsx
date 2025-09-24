"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface TargetTextInputProps {
  language: "en" | "zh"
  targetText: string
  onTargetTextChange: (text: string) => void
}

export function TargetTextInput({ language, targetText, onTargetTextChange }: TargetTextInputProps) {
  const maxChars = 500

  const content = {
    en: {
      title: "Target Text",
      placeholder: "Enter the text you want to synthesize into speech...",
      description: "This is the text that will be converted to speech using the uploaded voice characteristics.",
      limitHint: "For the best results, keep the target text under 500 characters.",
      charactersUsed: "characters used",
    },
    zh: {
      title: "目标文本",
      placeholder: "输入您想要合成为语音的文本...",
      description: "这是将使用上传的语音特征转换为语音的文本。",
      limitHint: "为获得更佳体验，建议目标文本控制在 500 个字符以内。",
      charactersUsed: "字符已使用",
    },
  }

  const { title, placeholder, description, limitHint, charactersUsed } = content[language]

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6">
        <h3 className="text-base font-medium text-primary mb-2">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        <Textarea
          value={targetText}
          onChange={(e) => {
            const value = e.target.value
            if (value.length <= maxChars) {
              onTargetTextChange(value)
            }
          }}
          placeholder={placeholder}
          className="min-h-[120px] bg-background border-border/50 text-sm resize-none"
          maxLength={maxChars}
        />
        <div className="flex justify-between items-center mt-2">
          <Badge variant="secondary" className="text-xs">
            {targetText.length}/{maxChars} {charactersUsed}
          </Badge>
          <span className="text-xs text-muted-foreground">{limitHint}</span>
        </div>
      </CardContent>
    </Card>
  )
}
