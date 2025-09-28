/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // 注意：现在使用专门的 /api/voxcpm/* 代理，而不是通用的 /api/* 代理
    // VoxCPM 相关的请求会通过 pages/api/voxcpm/[...path].ts 或 app/api/voxcpm/[...path]/route.ts 处理
    // 其他 /api/* 请求（如 /api/auth/*, /api/rpc/* 等）仍然由 Next.js API 路由处理
    
    // 如果需要其他外部 API 代理，可以在这里添加
    const base = process.env.NEXT_PUBLIC_API_BASE;
    
    if (!base) {
      console.log('NEXT_PUBLIC_API_BASE not set, using internal API routes only');
      return [];
    }
    
    console.log(`Setting up additional API proxy: /api/external/* -> ${base}/*`);
    
    return [
      {
        source: '/api/external/:path*',
        destination: `${base}/:path*`,
      },
    ];
  },
}

export default nextConfig
