'use client';

import { useEffect, useState, use } from 'react';
import { notFound } from 'next/navigation';
import { getToolById } from '@/config/tools';
import ToolPage from '@/components/ToolPage';

export default function ToolDetailPage({ params }: { params: { toolId: string } }) {
  // 使用React.use()解析params参数
  const resolvedParams = use(params);
  const toolId = resolvedParams.toolId;
  const tool = getToolById(toolId);

  // 如果工具不存在，返回404
  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Tool Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Sorry, the tool you are looking for doesn't exist or has been moved.
        </p>
        
        <a href="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
          Return to Home
        </a>
      </div>
    );
  }

  return <ToolPage tool={tool} />;
} 