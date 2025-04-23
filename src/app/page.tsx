'use client';

import { motion } from 'framer-motion';
import ToolCard from '@/components/ToolCard';
import { tools } from '@/config/tools';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-20 pt-10 md:pt-16">
        <h1 
          className="text-white"
          style={{ 
            fontSize: '100px', 
            fontWeight: 900, 
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          AI IMAGE GENERATOR
        </h1>
        
        <motion.p 
          className="mt-8 text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Transform your images with cutting-edge AI technology
        </motion.p>
        
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <a 
            href="#tools" 
            className="inline-flex items-center px-8 py-4 text-lg border border-transparent font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Explore Tools
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </section>
      
      <section id="tools" className="pt-16 pb-10">
        <h2 
          className="text-4xl md:text-5xl font-bold text-white mb-16 text-center"
        >
          Choose a Style
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -16px' }}>
          {tools.map((tool, index) => (
            <div key={tool.id} style={{ width: 'calc(25% - 32px)', margin: '0 16px 32px', boxSizing: 'border-box' }}>
              <ToolCard tool={tool} index={index} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
