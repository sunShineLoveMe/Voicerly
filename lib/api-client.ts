/**
 * VoxCPM API 客户端
 * 封装与VoxCPM服务的所有API交互
 */

import { apiFetch, getExternalApiBase } from './api'
import { shouldPerformHealthCheck, getExternalApiUrl } from './flags'

export interface VoiceGenerationParams {
  text_input: string
  prompt_wav_path_input?: File | string | null
  prompt_text_input?: string
  cfg_value_input?: number
  inference_timesteps_input?: number
  do_normalize?: boolean
  denoise?: boolean
}

export interface VoiceGenerationResponse {
  filepath: string
}

export interface VoiceRecognitionResponse {
  text: string
}

export interface DownloadedAudio {
  url: string
  filename: string
  mimeType: string
  size: number
  source: string
}

export class VoxCPMClient {
  private baseUrl: string
  private client: any = null

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getExternalApiBase()
  }

  /**
   * 初始化Gradio客户端
   * 动态导入@gradio/client避免SSR问题
   */
  private async initClient() {
    if (this.client) return this.client

    try {
      // 动态导入Gradio客户端
      const { Client } = await import('@gradio/client')
      this.client = await Client.connect(this.baseUrl)
      return this.client
    } catch (error) {
      console.error('Failed to initialize Gradio client:', error)
      throw new Error('无法连接到VoxCPM服务。请确保服务正在运行。')
    }
  }

  /**
   * 语音合成API
   * 根据输入文本生成高质量的语音音频
   */
  async generateVoice(params: VoiceGenerationParams): Promise<VoiceGenerationResponse> {
    try {
      // 首先检查服务是否可用（仅在需要时执行健康检查）
      if (shouldPerformHealthCheck()) {
        const isHealthy = await this.checkHealth()
        if (!isHealthy) {
          throw new Error('VoxCPM服务不可用。请确保服务正在运行。')
        }
      }

      const client = await this.initClient()
      
      // 处理文件上传
      let processedAudioInput = params.prompt_wav_path_input
      if (params.prompt_wav_path_input instanceof File) {
        // 如果是File对象，需要转换为Gradio可以处理的格式
        processedAudioInput = params.prompt_wav_path_input
      }

      console.log('Calling VoxCPM API with params:', {
        text_input: params.text_input,
        prompt_wav_path_input: processedAudioInput ? 'File uploaded' : null,
        prompt_text_input: params.prompt_text_input,
        cfg_value_input: params.cfg_value_input || 2.0,
        inference_timesteps_input: params.inference_timesteps_input || 10,
        do_normalize: params.do_normalize || false,
        denoise: params.denoise || false
      })

      const result = await client.predict('/generate', {
        text_input: params.text_input,
        prompt_wav_path_input: processedAudioInput || null,
        prompt_text_input: params.prompt_text_input || null,
        cfg_value_input: params.cfg_value_input || 2.0,
        inference_timesteps_input: params.inference_timesteps_input || 10,
        do_normalize: params.do_normalize || false,
        denoise: params.denoise || false
      })

      console.log('VoxCPM API result:', result)

      if (!result?.data) {
        throw new Error('API返回数据格式错误: ' + JSON.stringify(result))
      }

      const filepath = this.extractFilepath(result.data)
      console.log('Generated audio filepath:', filepath)

      return {
        filepath: filepath
      }
    } catch (error) {
      console.error('Voice generation failed:', error)
      throw new Error(`语音生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private resolveFileUrl(rawFilepath: unknown): string {
    const filepath = typeof rawFilepath === 'string' ? rawFilepath : this.extractFilepath(rawFilepath)

    if (!filepath) {
      throw new Error('未收到有效的音频文件路径')
    }

    if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
      return filepath
    }

    // Gradio在macOS上可能返回 /private/var/.../T/gradio/**，该路径可通过 /tmp/ 访问
    let normalizedPath = filepath
    const macTempMatch = normalizedPath.match(/^\/private\/var\/folders\/.+?\/T\/(gradio\/.+)$/)
    if (macTempMatch && macTempMatch[1]) {
      normalizedPath = `/tmp/${macTempMatch[1]}`
    }

    // 如果已经是 /file= 开头，直接拼接
    if (normalizedPath.startsWith('/file=')) {
      return getExternalApiUrl(normalizedPath)
    }

    if (normalizedPath.startsWith('file=')) {
      return getExternalApiUrl(`/${normalizedPath}`)
    }

    const encodedPath = encodeURI(normalizedPath)
    return getExternalApiUrl(`/file=${encodedPath}`)
  }

  private extractFilepath(data: unknown): string {
    if (!data) {
      throw new Error('API未返回音频文件路径')
    }

    if (typeof data === 'string') {
      return data
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        try {
          const candidate = this.extractFilepath(item)
          if (candidate) {
            return candidate
          }
        } catch (error) {
          // continue scanning
        }
      }
      throw new Error('未能从数组中解析音频文件路径')
    }

    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>

      // Gradio通常只返回一个字符串路径，但为了兼容其他结构我们做递归检查
      const candidateKeys = ['url', 'name', 'path', 'file', 'filepath', 'data']
      for (const key of candidateKeys) {
        if (key in obj && obj[key]) {
          try {
            const candidate = this.extractFilepath(obj[key])
            if (candidate) {
              return candidate
            }
          } catch (error) {
            // 尝试其他键
          }
        }
      }

      // 如果对象本身包含典型的Gradio值
      if ('path' in obj && typeof obj.path === 'string') {
        return obj.path
      }
      if ('url' in obj && typeof obj.url === 'string') {
        return obj.url
      }
      if ('name' in obj && typeof obj.name === 'string') {
        return obj.name
      }
    }

    throw new Error(`无法解析音频文件路径: ${JSON.stringify(data)}`)
  }

  async downloadGeneratedAudio(filepath: unknown): Promise<DownloadedAudio> {
    try {
      const fileUrl = this.resolveFileUrl(filepath)
      console.log('Downloading generated audio from:', fileUrl)

      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`音频文件下载失败: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const mimeType = response.headers.get('content-type') || 'audio/mpeg'
      const size = blob.size
      const rawFilename = typeof filepath === 'string' ? filepath : this.extractFilepath(filepath)
      const filename = decodeURIComponent((rawFilename.split('/').pop() || 'generated-voice.wav').toString())

      if (typeof window === 'undefined') {
        throw new Error('音频下载需要在浏览器环境中执行')
      }

      const url = URL.createObjectURL(blob)

      return {
        url,
        filename,
        mimeType,
        size,
        source: filepath,
      }
    } catch (error) {
      console.error('Failed to download generated audio:', error)
      throw new Error(`音频文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 语音识别API
   * 识别上传的音频文件并返回识别的文本内容
   */
  async recognizeVoice(audioFile: File): Promise<VoiceRecognitionResponse> {
    try {
      const client = await this.initClient()

      const result = await client.predict('/prompt_wav_recognition', {
        prompt_wav: audioFile
      })

      if (!result?.data) {
        throw new Error('API返回数据格式错误')
      }

      return {
        text: String(result.data || "")
      }
    } catch (error) {
      console.error('Voice recognition failed:', error)
      throw new Error(`语音识别失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 检查服务健康状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      // 使用相对路径进行健康检查，通过 Next.js rewrites 代理
      const response = await apiFetch('')
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

// 创建默认客户端实例
export const voxcpmClient = new VoxCPMClient()

// 导出便捷函数
export const generateVoice = (params: VoiceGenerationParams) => voxcpmClient.generateVoice(params)
export const recognizeVoice = (audioFile: File) => voxcpmClient.recognizeVoice(audioFile)
export const checkVoxCPMHealth = () => voxcpmClient.checkHealth()
export const downloadGeneratedAudio = (filepath: unknown) => voxcpmClient.downloadGeneratedAudio(filepath)

