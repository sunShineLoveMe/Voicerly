"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface TextInputProps {
  language: "en" | "zh"
  text: string
  onTextChange: (text: string) => void
  placeholder?: string
  title?: string
}

export function TextInput({ language, text, onTextChange, placeholder, title }: TextInputProps) {
  const [charCount, setCharCount] = useState(text.length)
  const maxChars = 1000

  const content = {
    en: {
      defaultTitle: "Prompt Text",
      subtitle: "Enter the text you want to convert to speech",
      defaultPlaceholder:
        "Please enter the prompt text. Automatic recognition is supported, and you can correct the results yourself.",
      charactersUsed: "characters used",
    },
    zh: {
      defaultTitle: "提示文本",
      subtitle: "输入您想要转换为语音的文本",
      defaultPlaceholder: "请输入提示文本。支持自动识别，您可以自行修正结果。",
      charactersUsed: "已使用字符",
    },
  }

  const { defaultTitle, subtitle, defaultPlaceholder, charactersUsed } = content[language]

  const handleTextChange = (value: string) => {
    if (value.length <= maxChars) {
      onTextChange(value)
      setCharCount(value.length)
    }
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-base font-medium text-primary mb-2">{title || defaultTitle}</h3>
        </div>

        <div className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={placeholder || defaultPlaceholder}
            className="min-h-32 resize-none bg-muted/30 border-border/50"
            maxLength={maxChars}
          />
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              {charCount}/{maxChars} {charactersUsed}
            </Badge>
            {charCount > maxChars * 0.9 && (
              <p className="text-xs text-muted-foreground">
                {language === "en" ? "Approaching character limit" : "接近字符限制"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
