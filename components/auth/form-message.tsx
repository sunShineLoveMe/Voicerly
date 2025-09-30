"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormMessageProps {
  type: "error" | "success" | "info"
  message: string
  className?: string
}

export function FormMessage({ type, message, className }: FormMessageProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg p-3 text-sm",
        {
          "bg-destructive/10 text-destructive": type === "error",
          "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400": type === "success",
          "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400": type === "info",
        },
        className
      )}
    >
      {type === "error" && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      {type === "success" && <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      <p className="flex-1">{message}</p>
    </div>
  )
}
