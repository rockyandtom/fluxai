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
  const handleMouseDown = () => {
    isDragging.current = true;
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
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove as any);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height, width }}
    >
      {/* 原始图片（左侧） */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={beforeImage}
          alt="Before"
          fill
          sizes="100vw"
          style={{ 
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* 生成图片（右侧） - 宽度由拖动位置控制 */}
      <div 
        className="absolute inset-0 h-full overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <Image
          src={afterImage}
          alt="After"
          fill
          sizes="100vw"
          style={{ 
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* 拖动滑块 */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ 
          left: `${position}%`,
          transform: 'translateX(-50%)',
          zIndex: 10
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* 圆形滑块手柄 */}
        <div 
          className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md flex items-center justify-center"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8L22 12L18 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 8L2 12L6 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
} 