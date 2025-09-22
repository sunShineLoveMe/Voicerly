"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface FAQItemProps {
  question: string
  answer: string
  defaultOpen?: boolean
}

export function FAQItem({ question, answer, defaultOpen = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="overflow-hidden">
      <button className="w-full p-6 text-left hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg pr-4">{question}</h3>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>
      {isOpen && (
        <CardContent className="px-6 pb-6 pt-0">
          <div className="text-muted-foreground leading-relaxed">{answer}</div>
        </CardContent>
      )}
    </Card>
  )
}
