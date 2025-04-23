'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  className?: string;
}

export default function ImageUploader({ onImageSelected, className = '' }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragging(false);
    setError(null);
    
    // 处理被拒绝的文件
    if (rejectedFiles && rejectedFiles.length > 0) {
      if (rejectedFiles[0].errors[0].code === 'file-too-large') {
        setError('File is too large. Maximum size is 5MB.');
      } else if (rejectedFiles[0].errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a JPG, PNG or WEBP image.');
      } else {
        setError(rejectedFiles[0].errors[0].message || 'Invalid file');
      }
      return;
    }
    
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        setPreview(reader.result as string);
        onImageSelected(file);
      };
      
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    noClick: false
  });

  return (
    <motion.div 
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer text-center transition-all duration-300 min-h-[240px] flex flex-col items-center justify-center
          ${isDragging || isDragActive 
            ? 'border-purple-500 bg-purple-900/10' 
            : 'border-gray-600 hover:border-gray-400 hover:bg-gray-900/30'}
          ${error ? 'border-red-500 bg-red-900/10' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative w-full h-[240px] overflow-hidden rounded">
            <Image 
              src={preview} 
              alt="Preview" 
              fill
              className="object-contain"
            />
            <div className="absolute inset-0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-4 transition-colors duration-300 mr-2"
              >
                Change Image
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 px-4 transition-colors duration-300"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-300 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium mb-2">Drag & drop an image here</p>
            <p className="text-base text-gray-400 mb-4">or click to browse files</p>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 px-6 transition-colors duration-300 mb-4"
            >
              Select Image
            </button>
            
            <p className="text-xs text-gray-500">Supports JPG, PNG, WEBP (max 5MB)</p>
            
            {error && (
              <p className="text-red-500 mt-3 text-sm bg-red-900/20 px-3 py-1 rounded-md">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}