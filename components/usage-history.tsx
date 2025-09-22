"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Play, Calendar } from "lucide-react"

interface UsageHistoryProps {
  language: "en" | "zh"
  history: Array<{
    id: string
    date: string
    textSnippet: string
    status: "completed" | "processing" | "failed"
    downloadUrl?: string
  }>
}

export function UsageHistory({ language, history }: UsageHistoryProps) {
  const content = {
    en: {
      title: "Usage History",
      noHistory: "No voice generations yet",
      noHistoryDesc: "Your generated voices will appear here",
      date: "Date",
      text: "Text",
      status: "Status",
      actions: "Actions",
      download: "Download",
      play: "Play",
      completed: "Completed",
      processing: "Processing",
      failed: "Failed",
    },
    zh: {
      title: "使用历史",
      noHistory: "暂无语音生成记录",
      noHistoryDesc: "您生成的语音将显示在这里",
      date: "日期",
      text: "文本",
      status: "状态",
      actions: "操作",
      download: "下载",
      play: "播放",
      completed: "已完成",
      processing: "处理中",
      failed: "失败",
    },
  }

  const {
    title,
    noHistory,
    noHistoryDesc,
    date,
    text,
    status,
    actions,
    download,
    play,
    completed,
    processing,
    failed,
  } = content[language]

  const getStatusBadge = (itemStatus: string) => {
    const statusMap = {
      completed: { label: completed, variant: "default" as const },
      processing: { label: processing, variant: "secondary" as const },
      failed: { label: failed, variant: "destructive" as const },
    }
    return statusMap[itemStatus as keyof typeof statusMap] || statusMap.completed
  }

  const handleDownload = (url: string, id: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = `voice-generation-${id}.mp3`
    link.click()
  }

  const handlePlay = (url: string) => {
    // In a real app, this would play the audio
    console.log("Playing audio:", url)
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{title}</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{noHistory}</h3>
            <p className="text-muted-foreground">{noHistoryDesc}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{title}</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => {
            const statusInfo = getStatusBadge(item.status)
            return (
              <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{item.textSnippet}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {item.status === "completed" && item.downloadUrl && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlay(item.downloadUrl!)}
                        className="hidden sm:flex"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {play}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(item.downloadUrl!, item.id)}>
                        <Download className="w-4 h-4 mr-1" />
                        {download}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
