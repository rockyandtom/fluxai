/** @type {import('next').NextConfig} */
const nextConfig = {
  // 关闭类型检查
  typescript: {
    // !! 警告: 仅在部署时使用
    ignoreBuildErrors: true,
  },
  // 启用转义字符规则检查
  eslint: {
    // 仅检查，不阻止构建
    ignoreDuringBuilds: true,
  },
  // 配置图片域名和优化选项
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rh-images.xiaoyaoyou.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.runninghub.cn',
        port: '',
        pathname: '/**',
      },
    ],
    // 禁用图片优化，直接使用原始图片
    unoptimized: true
  },
  
  // 允许eval和内联脚本，关闭CSP限制
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 