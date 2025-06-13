import { ImageResponse } from 'next/og';
import { getToolById } from '@/config/tools';

// 路由段配置
export const runtime = 'edge';
export const revalidate = 3600; // 1小时重新验证一次

// 图片元数据
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

// 生成图片函数
export default async function Image({ params }: { params: { toolId: string } }) {
  const { toolId } = params;
  const tool = getToolById(toolId);
  
  // 如果工具不存在，使用默认标题
  const title = tool ? tool.name : 'FluxAI Image Generator';
  const description = tool ? tool.description : 'Transform your images with AI';

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
            fontSize: '60px',
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
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {title}
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
          {description}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
} 