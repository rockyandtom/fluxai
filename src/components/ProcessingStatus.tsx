'use client';

import { useState, useEffect } from 'react';
import { RotatingLines } from 'react-loader-spinner';
import { motion } from 'framer-motion';

interface ProcessingStatusProps {
  status: 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
  progress: number;
  errorMessage?: string;
}

export default function ProcessingStatus({ status, progress, errorMessage }: ProcessingStatusProps) {
  const [progressColor, setProgressColor] = useState('#9333ea'); // Purple
  
  useEffect(() => {
    // 根据进度更改颜色
    if (progress < 30) {
      setProgressColor('#9333ea'); // Purple
    } else if (progress < 70) {
      setProgressColor('#3b82f6'); // Blue
    } else {
      setProgressColor('#10b981'); // Green
    }
  }, [progress]);

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {status === 'IDLE' && (
        <div className="text-center text-gray-400 py-8">
          <p>Upload an image to get started</p>
        </div>
      )}
      
      {status === 'UPLOADING' && (
        <div className="flex flex-col items-center justify-center py-8">
          <RotatingLines
            strokeColor="#9333ea"
            strokeWidth="3"
            animationDuration="0.8"
            width="40"
            visible={true}
          />
          <p className="mt-4 text-gray-300">Uploading image...</p>
        </div>
      )}
      
      {status === 'PROCESSING' && (
        <div className="flex flex-col items-center justify-center py-8">
          <RotatingLines
            strokeColor={progressColor}
            strokeWidth="3"
            animationDuration="0.8"
            width="40"
            visible={true}
          />
          <p className="mt-4 text-gray-300">Processing image...</p>
          
          <div className="w-full max-w-md mt-3 bg-gray-700 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                backgroundColor: progressColor
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-1">{progress}%</p>
        </div>
      )}
      
      {status === 'ERROR' && (
        <div className="text-center py-8">
          <div className="bg-red-900 bg-opacity-30 rounded-lg p-4 max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-medium">Processing failed</p>
            {errorMessage && (
              <p className="text-sm text-gray-300 mt-2">{errorMessage}</p>
            )}
            <p className="text-xs text-gray-400 mt-3">Please try again with a different image</p>
          </div>
        </div>
      )}
    </motion.div>
  );
} 