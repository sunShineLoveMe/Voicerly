import { getClientVoxcpmBase, getServerVoxcpmBase } from '@/lib/voxcpmBase';
/**
 * 环境标志和配置
 * 用于控制不同环境下的功能开关
 */

export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';

// 健康检查开关
export const ENABLE_HEALTH_CHECK = process.env.NEXT_PUBLIC_ENABLE_HEALTH_CHECK === '1';

// 外部 API 基础 URL
export const EXTERNAL_API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// 是否启用调试模式
export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === '1' || isDev;

/**
 * 检查是否应该执行健康检查
 * 生产环境默认关闭，可通过环境变量开启
 */
export function shouldPerformHealthCheck(): boolean {
  return !isProd || ENABLE_HEALTH_CHECK;
}

/**
 * 获取外部 API 完整 URL
 * @param path API 路径
 * @returns 完整的 API URL
 */
export function getExternalApiUrl(path: string): string {
  const base = typeof window === 'undefined'
    ? getServerVoxcpmBase()
    : getClientVoxcpmBase()
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
