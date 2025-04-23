'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoGalleryProps {
  images: string[];
  title?: string;
}

export default function DemoGallery({ images, title }: DemoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative aspect-square cursor-pointer rounded-xl overflow-hidden group"
            onClick={() => setSelectedImage(image)}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <Image
              src={image}
              alt={`Demo ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <p className="text-sm font-medium">View full size</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 大图预览模态框 */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              className="relative max-w-5xl max-h-[90vh] w-full rounded-xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-square sm:aspect-auto sm:h-[80vh]">
                <Image
                  src={selectedImage}
                  alt="Demo preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              <motion.button
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              <motion.a
                href={selectedImage}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 