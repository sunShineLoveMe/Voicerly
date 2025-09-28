import { getClientVoxcpmBase, getServerVoxcpmBase } from '@/lib/voxcpmBase';
/**
 * 统一的 API 请求封装
 * 自动处理相对路径和错误状态
 */

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * 统一的 API 请求函数
 * @param path API 路径，会自动添加 /api 前缀
 * @param init fetch 配置选项
 * @returns Promise<Response>
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // 确保路径以 /api 开头
  const url = path.startsWith('/api/') ? path : `/api/${path.replace(/^\/+/, '')}`;
  
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * 带 JSON 解析的 API 请求
 * @param path API 路径
 * @param init fetch 配置选项
 * @returns Promise<ApiResponse<T>>
 */
export async function apiRequest<T = any>(
  path: string, 
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await apiFetch(path, init);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 获取外部后端基础 URL
 * 用于需要直接访问外部后端 URL 的场景（如文件下载）
 */
export function getExternalApiBase(): string {
  // 浏览器环境：/api/voxcpm（再转绝对）
  if (typeof window !== 'undefined') {
    return getClientVoxcpmBase()
  }
  // 服务器环境：直接用隧道域名
  return getServerVoxcpmBase()
}
