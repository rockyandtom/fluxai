import { ImageResponse } from 'next/og';

// 路由段配置
export const runtime = 'edge';
export const revalidate = 86400; // 24小时重新验证一次

// 图片元数据
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

// 生成图片函数
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #1a0036, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Flux<span style={{ color: '#a855f7' }}>AI</span>
        </div>
        
        <div
          style={{
            display: 'flex',
            fontSize: '40px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          AI IMAGE GENERATOR
        </div>
        
        <div
          style={{
            display: 'flex',
            fontSize: '24px',
            color: '#d1d5db',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Transform your images with cutting-edge AI technology
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 