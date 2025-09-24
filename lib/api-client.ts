/**
 * VoxCPM API 客户端
 * 封装与VoxCPM服务的所有API交互
 */

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

export class VoxCPMClient {
  private baseUrl: string
  private client: any = null

  constructor(baseUrl: string = 'http://localhost:7860') {
    this.baseUrl = baseUrl
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
      // 首先检查服务是否可用
      const isHealthy = await this.checkHealth()
      if (!isHealthy) {
        throw new Error('VoxCPM服务不可用。请确保服务正在localhost:7860运行。')
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

      // 根据API文档，返回的应该是文件路径
      const filepath = Array.isArray(result.data) ? result.data[0] : result.data
      console.log('Generated audio filepath:', filepath)

      return {
        filepath: filepath
      }
    } catch (error) {
      console.error('Voice generation failed:', error)
      throw new Error(`语音生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
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
      const response = await fetch(this.baseUrl)
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
