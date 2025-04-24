'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  height?: string | number;
  width?: string | number;
  className?: string;
}

export default function ImageCompare({
  beforeImage,
  afterImage,
  height = '100%',
  width = '100%',
  className = '',
}: ImageCompareProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 处理拖动逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止拖动时选中文本
    isDragging.current = true;
    
    // 在鼠标按下时立即更新位置
    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;
      const newPosition = Math.max(0, Math.min(100, (x / containerWidth) * 100));
      setPosition(newPosition);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // 注意：不再调用e.preventDefault()，以允许点击链接
    isDragging.current = true;
    
    // 在触摸开始时立即更新位置
    if (containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const containerWidth = rect.width;
      const newPosition = Math.max(0, Math.min(100, (x / containerWidth) * 100));
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // 计算鼠标位置相对于容器的百分比
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    const newPosition = Math.max(0, Math.min(100, (x / containerWidth) * 100));
    
    setPosition(newPosition);
  };

  const handleTouchMove = (e: TouchEvent) => {
    // 只有在拖动状态下才阻止默认行为
    if (isDragging.current) {
      e.preventDefault();
    }
    
    if (!isDragging.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // 计算触摸位置相对于容器的百分比
    const x = e.touches[0].clientX - rect.left;
    const containerWidth = rect.width;
    const newPosition = Math.max(0, Math.min(100, (x / containerWidth) * 100));
    
    setPosition(newPosition);
  };

  // 添加和移除事件监听器
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // 将touchmove事件设置为被动模式，以提高性能
    document.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    document.addEventListener('touchend', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none touch-none ${className}`}
      style={{ height, width }}
    >
      {/* 调试显示 */}
      <div className="absolute top-0 left-0 z-50 text-xs text-white bg-black bg-opacity-50 p-1" style={{ pointerEvents: 'none' }}>
        Current: {position.toFixed(0)}%
      </div>
      
      {/* 原始图片（左侧） */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={beforeImage}
          alt="Before"
          fill
          sizes="100vw"
          priority={true}
          style={{ 
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* 生成图片（右侧） - 宽度由拖动位置控制 */}
      <div 
        className="absolute inset-0 h-full overflow-hidden"
        style={{ 
          left: `${position}%`,
          right: 0,
          width: `${100 - position}%`
        }}
      >
        <div className="absolute inset-0" style={{ 
          left: `${-position * 100 / (100 - position)}%`,
          width: '100vw'
        }}>
          <Image
            src={afterImage}
            alt="After"
            fill
            sizes="100vw"
            priority={true}
            style={{ 
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
      
      {/* 拖动分界线 */}
      <div
        className="absolute top-0 bottom-0 w-2 bg-white cursor-ew-resize"
        style={{ 
          left: `${position}%`,
          transform: 'translateX(-50%)',
          zIndex: 10,
          boxShadow: '0 0 6px rgba(0, 0, 0, 0.8)'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* 圆形滑块手柄 */}
        <div 
          className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-xl flex items-center justify-center"
          style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8L22 12L18 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 8L2 12L6 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
} 