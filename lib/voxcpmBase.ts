/**
 * VoxCPM API 基础地址管理
 * 统一管理服务端和客户端的 API 基础地址
 */

/**
 * 获取服务端 VoxCPM 基础地址
 * 仅在 Node 环境使用，返回绝对 URL
 */
export function getServerVoxcpmBase(): string {
  // 仅在 Node 环境使用
  const base = process.env.VOXCPM_BASE_URL
  if (!base) throw new Error('VOXCPM_BASE_URL is not set')
  return base.replace(/\/+$/, '')
}

/**
 * 获取客户端 VoxCPM 绝对基础地址
 * 将相对路径转换为绝对 URL，避免 Gradio 报 Invalid URL
 */
export function getClientVoxcpmAbsBase(): string {
  const base = process.env.NEXT_PUBLIC_VOXCPM_BASE || '/api/voxcpm'
  // 转为绝对 URL，避免 Gradio 报 Invalid URL
  const abs = new URL(base, window.location.origin).toString()
  return abs.replace(/\/+$/, '')
}

/**
 * 获取客户端 VoxCPM 相对基础地址
 * 用于 fetch 请求等场景
 */
export function getClientVoxcpmBase(): string {
  return process.env.NEXT_PUBLIC_VOXCPM_BASE || '/api/voxcpm'
}
