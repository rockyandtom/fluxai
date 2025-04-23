'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ExampleResult {
  imageUrl: string;
  timestamp: number;
}

interface ExampleResultsProps {
  toolId: string;
}

export default function ExampleResults({ toolId }: ExampleResultsProps) {
  const [results, setResults] = useState<ExampleResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载保存的图片结果
  useEffect(() => {
    async function loadResults() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/saveImage?toolId=${toolId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to get results: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setResults(data.images || []);
        } else {
          throw new Error(data.error || 'Failed to get results');
        }
      } catch (error) {
        console.error('Failed to load saved image results:', error);
        setError(error instanceof Error ? error.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadResults();
  }, [toolId]);

  // 展示时间格式化
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Inspiration comes true</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 border border-gray-800 rounded-xl bg-gray-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">No example images yet</p>
          <p className="text-gray-600 text-sm mt-2">Generate some images to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((result, index) => (
            <motion.div
              key={`${result.imageUrl}-${index}`}
              className="rounded-xl overflow-hidden bg-gray-900 border border-gray-800 shadow-md relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-square relative">
                <Image
                  src={result.imageUrl}
                  alt={`AI Generated Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  unoptimized={true}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-gray-300 opacity-70">
                  {formatTime(result.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 