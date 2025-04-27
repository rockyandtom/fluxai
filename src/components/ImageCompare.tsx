'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [beforeLoaded, setBeforeLoaded] = useState(false);
  const [afterLoaded, setAfterLoaded] = useState(false);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);

  // 在组件挂载时，打印图片路径以进行调试
  useEffect(() => {
    console.log('ImageCompare 图片路径:', { beforeImage, afterImage });
  }, [beforeImage, afterImage]);

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

  // 图片加载状态
  const areImagesLoaded = beforeLoaded && afterLoaded;
  const hasImageError = beforeError || afterError;

  // 处理图片加载
  const handleBeforeImageLoad = () => {
    console.log('✅ 前图片加载成功:', beforeImage);
    setBeforeLoaded(true);
  };

  const handleAfterImageLoad = () => {
    console.log('✅ 后图片加载成功:', afterImage);
    setAfterLoaded(true);
  };

  const handleBeforeImageError = () => {
    console.error('❌ 前图片加载失败:', beforeImage);
    setBeforeError(true);
  };

  const handleAfterImageError = () => {
    console.error('❌ 后图片加载失败:', afterImage);
    setAfterError(true);
  };

  // 调试信息
  const debugInfo = {
    beforeImage,
    afterImage,
    beforeLoaded,
    afterLoaded,
    beforeError,
    afterError
  };
  console.log('ImageCompare Debug:', debugInfo);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ height, width }}
    >
      {/* 加载状态指示器 */}
      {(!areImagesLoaded && !hasImageError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20">
          <div className="text-white text-sm">Loading...</div>
        </div>
      )}
      
      {/* 错误状态指示器 */}
      {hasImageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-50 z-20 p-2">
          <div className="text-white text-sm mb-1">Image loading failed</div>
          {beforeError && <div className="text-red-300 text-xs mb-1">Before: {beforeImage}</div>}
          {afterError && <div className="text-red-300 text-xs">After: {afterImage}</div>}
        </div>
      )}

      {/* 使用简单的HTML结构和普通img标签 */}
      <div className="relative w-full h-full">
        {/* 背景图（左侧原始图片） */}
        <img
          src={beforeImage}
          alt="Before"
          className="absolute top-0 left-0 w-full h-full object-cover"
          onLoad={handleBeforeImageLoad}
          onError={handleBeforeImageError}
        />
        
        {/* 前景图（右侧处理后图片） */}
        <div 
          className="absolute top-0 h-full overflow-hidden"
          style={{ 
            left: `${100 - position}%`, 
            right: 0,
            width: `${position}%`
          }}
        >
          <img
            src={afterImage}
            alt="After"
            className="absolute top-0 right-0 h-full object-cover"
            style={{ width: '100vw', right: 0 }}
            onLoad={handleAfterImageLoad}
            onError={handleAfterImageError}
          />
        </div>
        
        {/* 分隔线 - 只在图片加载成功时显示 */}
        {areImagesLoaded && !hasImageError && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
            style={{
              left: `${100 - position}%`,
              zIndex: 15,
              boxShadow: '0 0 4px rgba(0, 0, 0, 0.7)'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* 手柄 */}
            <div
              className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg flex items-center justify-center"
              style={{ boxShadow: '0 0 8px rgba(0, 0, 0, 0.8)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8L22 12L18 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 8L2 12L6 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 