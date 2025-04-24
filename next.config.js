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
  // 配置图片域名
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
  },
  // 暂时禁用内容安全策略，以便开发测试期间可以正常加载所有资源
  // 在生产环境应该重新配置更严格的CSP规则
  /*
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://rh-images.xiaoyaoyou.com https://www.runninghub.cn; connect-src 'self' https://rh-images.xiaoyaoyou.com https://www.runninghub.cn"
          }
        ]
      }
    ];
  }
  */
};

module.exports = nextConfig; 