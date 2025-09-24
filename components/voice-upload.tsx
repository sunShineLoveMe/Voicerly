"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, RotateCcw, Loader2, Type, Play, Pause, Volume2, SkipBack, SkipForward, Repeat, Shuffle } from "lucide-react"
import { recognizeVoice, checkVoxCPMHealth } from "@/lib/api-client"

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
  
  // 音频播放相关状态
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // 服务健康状态
  const [serviceHealthy, setServiceHealthy] = useState<boolean | null>(null)

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
      recordButton: "Record",
      restart: "Restart",
      loop: "Loop",
      speed: "Speed",
      volumeLabel: "Volume",
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
      recordButton: "录音",
      restart: "重新开始",
      loop: "循环",
      speed: "速度",
      volumeLabel: "音量",
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
    recordButton,
    restart,
    loop,
    speed,
    volumeLabel,
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

  // 文件验证
  const validateFile = (file: File) => {
    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(mp3|wav|m4a)$/)) {
      return language === "en" 
        ? "Please upload an MP3, WAV, or M4A audio file."
        : "请上传MP3、WAV或M4A格式的音频文件。"
    }
    
    if (file.size > maxSize) {
      return language === "en"
        ? "File size must be less than 10MB."
        : "文件大小必须小于10MB。"
    }
    
    return null
  }

  const handleFileSelect = (file: File) => {
    setUploadError(null)
    
    const error = validateFile(file)
    if (error) {
      setUploadError(error)
      return
    }
    
    onFileUpload(file)
    processAudioFile(file)
  }

  // 处理音频文件，创建URL和生成波形数据
  const processAudioFile = async (file: File) => {
    setIsProcessingAudio(true)
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    
    console.log('Processing audio file:', file.name, file.type, file.size)
    
    try {
      // 使用Web Audio API生成真实的波形数据
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('AudioContext created, state:', audioContext.state)
      
      // 如果AudioContext被挂起，尝试恢复
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
        console.log('AudioContext resumed, new state:', audioContext.state)
      }
      
      const arrayBuffer = await file.arrayBuffer()
      console.log('ArrayBuffer length:', arrayBuffer.byteLength)
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      console.log('Audio decoded - duration:', audioBuffer.duration, 'channels:', audioBuffer.numberOfChannels, 'sample rate:', audioBuffer.sampleRate)
      
      // 提取音频数据并生成波形
      const channelData = audioBuffer.getChannelData(0) // 使用第一个声道
      const samples = 200 // 波形条数量
      const blockSize = Math.floor(channelData.length / samples)
      const waveform = []
      
      console.log('Channel data length:', channelData.length, 'Block size:', blockSize)
      
      for (let i = 0; i < samples; i++) {
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j] || 0)
        }
        const average = sum / blockSize
        // 改进缩放逻辑，确保波形可见
        waveform.push(Math.max(average * 300, 5)) // 至少5px高度，最大缩放300倍
      }
      
      console.log('Waveform data generated:', waveform.slice(0, 10), 'Total samples:', waveform.length)
      console.log('Waveform range:', Math.min(...waveform), 'to', Math.max(...waveform))
      
      setWaveformData(waveform)
      
      // 关闭AudioContext以释放资源
      await audioContext.close()
    } catch (error) {
      console.error('Error processing audio:', error)
      // 如果Web Audio API失败，使用备用的随机数据
      const fallbackData = Array.from({ length: 200 }, () => Math.random() * 40 + 10) // 10-50px高度
      console.log('Using fallback waveform data')
      setWaveformData(fallbackData)
    } finally {
      setIsProcessingAudio(false)
    }
  }

  // 清理音频URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // 检查VoxCPM服务健康状态
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const healthy = await checkVoxCPMHealth()
        setServiceHealthy(healthy)
      } catch (error) {
        console.error('Health check failed:', error)
        setServiceHealthy(false)
      }
    }
    
    checkServiceHealth()
  }, [])

  // 音频播放控制
  const togglePlayback = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // 重新开始播放
  const restartPlayback = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    setCurrentTime(0)
    if (!isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // 播放速度控制
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  // 音量控制
  const changeVolume = (vol: number) => {
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  // 循环播放控制
  const toggleLoop = () => {
    setIsLooping(!isLooping)
    if (audioRef.current) {
      audioRef.current.loop = !isLooping
    }
  }

  // 处理音频时间更新
  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  // 处理音频加载完成
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    const audioDuration = audioRef.current.duration
    setDuration(audioDuration)
    setEndTime(audioDuration)
    
    // 设置初始属性
    audioRef.current.playbackRate = playbackRate
    audioRef.current.volume = volume
    audioRef.current.loop = isLooping
  }

  // 处理音频播放结束
  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  // 跳转到指定时间
  const seekTo = (time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  // 格式化时间显示
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
    setUploadError(null)
    
    // 清理音频相关状态
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setWaveformData([])
    setStartTime(0)
    setEndTime(0)
    setPlaybackRate(1)
    setVolume(1)
    setIsLooping(false)
    setIsProcessingAudio(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleTranscribe = async () => {
    if (!uploadedFile || !onTranscriptionUpdate) return

    setIsTranscribing(true)
    setTranscriptionError(null)

    try {
      console.log('Starting transcription for file:', uploadedFile.name)
      const result = await recognizeVoice(uploadedFile)
      console.log('Transcription result:', result)
      onTranscriptionUpdate(result.text)
    } catch (error) {
      console.error('Voice recognition failed:', error)
      const errorMessage = error instanceof Error ? error.message : transcriptionErrorText
      setTranscriptionError(errorMessage)
      
      // 如果是网络错误，提供更友好的提示
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('无法连接')) {
        setTranscriptionError(
          language === "en" 
            ? "Cannot connect to VoxCPM service. Please ensure the service is running on localhost:7860"
            : "无法连接到VoxCPM服务。请确保服务在localhost:7860端口运行"
        )
      }
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
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : uploadError ? "border-red-500 bg-red-500/5" : "border-border"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{dragText}</p>
              <Button onClick={() => fileInputRef.current?.click()} aria-label={uploadButton}>
                {uploadButton}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">{supportedFormats}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="Select audio file"
              />
            </div>
            
            {/* 上传错误显示 */}
            {uploadError && (
              <div className="mt-3 p-3 bg-red-900/50 border border-red-600/50 rounded text-red-200 text-sm">
                <div className="font-medium">Upload Error:</div>
                <div>{uploadError}</div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">{promptLabel}</p>

            {/* 音频波形播放器 */}
            <div className="bg-slate-800 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center">
                  <Volume2 className="w-4 h-4 mr-2 text-blue-400" />
                  Prompt Speech (Optional, or let VoxCPM Improvise)
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeUploadedFile}
                  className="text-white hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* 波形显示区域 */}
              <div className="mb-4">
                <div className="bg-slate-900 rounded p-4">
                  <div 
                    className="relative h-16 mb-3 cursor-pointer bg-slate-800 rounded"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const clickX = e.clientX - rect.left
                      const newTime = (clickX / rect.width) * duration
                      seekTo(newTime)
                    }}
                  >
                    <div className="flex items-end justify-center h-full px-2 space-x-0.5">
                      {waveformData.length > 0 ? (
                        waveformData.map((height, index) => {
                          const normalizedHeight = Math.min(Math.max(height * 0.4, 8), 56) // 8px到56px之间
                          const progress = duration > 0 ? currentTime / duration : 0
                          const isPlayed = index / waveformData.length < progress
                          
                          return (
                            <div
                              key={index}
                              className="hover:opacity-80 transition-all duration-75 rounded-sm"
                              style={{ 
                                height: `${normalizedHeight}px`,
                                width: '3px',
                                backgroundColor: isPlayed ? '#3b82f6' : '#64748b',
                                boxShadow: isPlayed ? '0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
                              }}
                            />
                          )
                        })
                      ) : (
                        // 显示加载状态或占位符
                        <div className="flex items-center justify-center w-full h-full text-slate-500">
                          {isProcessingAudio ? (
                            <div className="animate-pulse flex items-center space-x-1">
                              <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <span className="ml-2 text-xs">Processing audio...</span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-600">
                              No waveform data
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 播放进度指示器 */}
                    {duration > 0 && (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-blue-400 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                    )}
                  </div>
                  
                  {/* 时间显示 */}
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* 播放控制 */}
              <div className="space-y-4">
                {/* 主要播放控制 */}
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700"
                    onClick={restartPlayback}
                    aria-label={restart}
                    title={restart}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700 w-12 h-12"
                    onClick={togglePlayback}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-slate-700"
                    onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                    aria-label="Skip forward 10s"
                    title="Skip forward 10s"
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* 二级控制 */}
                <div className="flex items-center justify-between text-xs">
                  {/* 播放速度 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">{speed}:</span>
                    <div className="flex space-x-1">
                      {[0.75, 1, 1.25, 1.5].map((rate) => (
                        <Button
                          key={rate}
                          variant="ghost"
                          size="sm"
                          className={`text-xs px-2 py-1 h-6 ${
                            playbackRate === rate 
                              ? 'bg-blue-600 text-white' 
                              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                          }`}
                          onClick={() => changePlaybackRate(rate)}
                          aria-label={`Set speed to ${rate}x`}
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* 循环播放 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs px-2 py-1 h-6 ${
                      isLooping 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                    onClick={toggleLoop}
                    aria-label={`Loop ${isLooping ? 'on' : 'off'}`}
                    title={`${loop}: ${isLooping ? 'On' : 'Off'}`}
                  >
                    <Repeat className="w-3 h-3 mr-1" />
                    {loop}
                  </Button>
                </div>

                {/* 音量控制 */}
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => changeVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer 
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-0
                        [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      aria-label={`${volumeLabel}: ${Math.round(volume * 100)}%`}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              {/* 转录错误显示 */}
              {transcriptionError && (
                <div className="mb-3 p-2 bg-red-900/50 border border-red-600/50 rounded text-red-200 text-xs">
                  <div className="font-medium">Transcription Error:</div>
                  <div>{transcriptionError}</div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="mt-4 pt-3 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {onTranscriptionUpdate && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTranscribe}
                        disabled={isTranscribing || serviceHealthy === false}
                        className="bg-transparent border-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
                        title={serviceHealthy === false ? "VoxCPM service is not available" : ""}
                        aria-label={transcribeButton}
                      >
                        {isTranscribing ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Type className="w-4 h-4 mr-1" />
                        )}
                        {isTranscribing ? transcribing : transcribeButton}
                        {serviceHealthy === false && (
                          <span className="ml-1 text-red-400">⚠</span>
                        )}
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled
                      className="bg-transparent border-slate-600 text-slate-500 cursor-not-allowed"
                      title="Recording feature coming soon"
                      aria-label={recordButton}
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      {recordButton}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-transparent border-slate-600 text-white hover:bg-slate-700"
                      aria-label={replace}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {replace}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={removeUploadedFile}
                      className="bg-transparent border-red-600 text-red-400 hover:bg-red-900/50"
                      aria-label={remove}
                    >
                      <X className="w-4 h-4 mr-1" />
                      {remove}
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-slate-400 text-center">
                  {uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            {/* 隐藏的音频元素 */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="hidden"
              />
            )}

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
