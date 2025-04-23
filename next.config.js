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
        hostname: 'www.runninghub.cn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rh-images.xiaoyaoyou.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'rh-images.xiaoyaoyou.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig; 