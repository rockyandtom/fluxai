'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ResultDisplayProps {
  imageUrl: string;
}

export default function ResultDisplay({ imageUrl }: ResultDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理图片下载
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      
      // 通过fetch获取图片并转换为blob
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // 创建blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // 创建一个标签并模拟点击
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // 从URL中提取文件名，如果提取不到则使用时间戳
      const fileName = imageUrl.split('/').pop() || `fluxai-${Date.now()}.png`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 释放blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      // 显示下载动画
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setError(error instanceof Error ? error.message : '下载失败');
    }
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-xl">
        <div className="relative w-full aspect-square">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <Image 
            src={imageUrl} 
            alt="AI Generated Image" 
            fill
            className="object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError('图片加载失败');
            }}
            quality={100}
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={true}
          />
        </div>
        
        <div className="p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">AI Generated Result</h3>
            <p className="text-sm text-gray-400">Ready to download</p>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          
          <motion.button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors ${isDownloading ? 'opacity-75' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
          </svg>
          View full size
        </a>
      </div>
    </motion.div>
  );
} 