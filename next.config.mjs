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
    // 将 /api/* 代理到外部后端：由 NEXT_PUBLIC_API_BASE 指定
    // 例：NEXT_PUBLIC_API_BASE=https://your-tunnel-or-edge.example.com
    const base = process.env.NEXT_PUBLIC_API_BASE;
    
    if (!base) {
      console.warn('NEXT_PUBLIC_API_BASE not set, external API proxy disabled');
      return [];
    }
    
    console.log(`Setting up API proxy: /api/* -> ${base}/*`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${base}/:path*`,
      },
    ];
  },
}

export default nextConfig
