'use client';

import Link from 'next/link';
import { ToolConfig } from '@/config/tools';
import ImageCompare from './ImageCompare';

interface ToolCardProps {
  tool: ToolConfig;
}

// 默认占位图路径
const DEFAULT_BEFORE_IMAGE = '/thumbnails/before-placeholder.jpg';
const DEFAULT_AFTER_IMAGE = '/thumbnails/after-placeholder.jpg';

export default function ToolCard({ tool }: ToolCardProps) {
  // 确保始终有前后图片
  const beforeImage = tool.beforeImage || DEFAULT_BEFORE_IMAGE;
  const afterImage = tool.afterImage || DEFAULT_AFTER_IMAGE;

  return (
    <div className="h-full">
      <Link href={`/${tool.id}`} className="block h-full">
        <div style={{
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          transition: 'all 0.3s ease',
        }}>
          {/* 图片区域 - 使用分屏比较组件 */}
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            paddingTop: '65%', 
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 5
            }}>
              {/* 使用普通的HTML img标签来显示图片 - 仅用于调试 */}
              <div className="relative w-full h-full">
                <img src={beforeImage} className="absolute left-0 top-0 w-1/2 h-full object-cover" alt={tool.name} />
                <img src={afterImage} className="absolute right-0 top-0 w-1/2 h-full object-cover" alt={tool.name} />
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white z-10" style={{transform: 'translateX(-50%)'}}></div>
              </div>
              
              {/* 当分屏组件修复后再使用
              <ImageCompare
                beforeImage={beforeImage}
                afterImage={afterImage}
                height="100%"
                width="100%"
              />
              */}
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              color: 'white',
              zIndex: 20,
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                margin: 0,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                {tool.name}
              </h3>
            </div>
          </div>
          
          {/* 文字描述区域 */}
          <div style={{ 
            padding: '12px', 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <p style={{ 
              fontSize: '13px', 
              color: 'rgb(209, 213, 219)', 
              marginBottom: '8px',
              flexGrow: 1
            }}>
              {tool.description}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                fontSize: '13px',
                color: 'rgb(167, 139, 250)',
                fontWeight: 500
              }}>
                Try Now
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '14px', width: '14px', marginLeft: '4px' }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 