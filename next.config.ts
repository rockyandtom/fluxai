/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rh-images.xiaoyaoyou.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
