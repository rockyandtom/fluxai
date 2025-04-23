import type { Metadata } from 'next';
import { getToolById } from '@/config/tools';

// 类型定义兼容Next.js 15
interface LayoutProps {
  params: { toolId: string } | Promise<{ toolId: string }>;
}

// 为每个工具页面生成动态元数据
export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  // 在Next.js 15中，params是一个Promise，需要先await
  const resolvedParams = await Promise.resolve(params);
  const toolId = resolvedParams.toolId;
  const tool = getToolById(toolId);
  
  if (!tool) {
    return {
      title: 'Not Found | FluxAI',
      description: 'The requested tool could not be found',
    };
  }
  
  return {
    title: `${tool.name} | FluxAI`,
    description: tool.description,
    keywords: ['ai', 'image generator', 'image effects', tool.id, tool.name.toLowerCase()],
    openGraph: {
      title: `${tool.name} | FluxAI`,
      description: tool.description,
      url: `https://fluxai.life/${tool.id}`,
      siteName: 'FluxAI',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} | FluxAI`,
      description: tool.description,
    },
  };
}

export default function ToolLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="tool-layout">
      {children}
    </div>
  );
} 