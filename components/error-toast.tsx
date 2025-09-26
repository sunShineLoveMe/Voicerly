"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"

interface ErrorToastProps {
  type?: "error" | "success" | "warning" | "info"
  title?: string
  description?: string
  duration?: number
}

export function ErrorToast({ 
  type = "error", 
  title, 
  description, 
  duration = 5000 
}: ErrorToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    const iconMap = {
      error: <XCircle className="h-4 w-4 text-red-500" />,
      success: <CheckCircle className="h-4 w-4 text-green-500" />,
      warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      info: <Info className="h-4 w-4 text-blue-500" />
    }

    const variantMap = {
      error: "destructive",
      success: "default",
      warning: "default", 
      info: "default"
    } as const

    toast({
      title: title || (type === "error" ? "Error" : type === "success" ? "Success" : type === "warning" ? "Warning" : "Info"),
      description,
      variant: variantMap[type],
      duration,
    })
  }, [toast, type, title, description, duration])

  return null
}

// 便捷的错误提示函数
export function showErrorToast(error: string | Error, title?: string) {
  const message = typeof error === "string" ? error : error.message
  return (
    <ErrorToast
      type="error"
      title={title || "Login Error"}
      description={message}
    />
  )
}

// 便捷的成功提示函数
export function showSuccessToast(message: string, title?: string) {
  return (
    <ErrorToast
      type="success"
      title={title || "Success"}
      description={message}
    />
  )
}
