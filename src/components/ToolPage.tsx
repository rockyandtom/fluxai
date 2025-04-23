'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import Image from 'next/image';
import ImageUploader from './ImageUploader';
import ProcessingStatus from './ProcessingStatus';
import ResultDisplay from './ResultDisplay';
import DemoGallery from './DemoGallery';
import { ToolConfig } from '@/config/tools';
import { uploadImage, generateImage, checkTaskStatus, getTaskResult, createWebSocketConnection } from '@/lib/api';

interface ToolPageProps {
  tool: ToolConfig;
}

export default function ToolPage({ tool }: ToolPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socketConnection, setSocketConnection] = useState<WebSocket | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pollingTimer, setPollingTimer] = useState<NodeJS.Timeout | null>(null);

  // 组件挂载时设置mounted状态
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 清理函数
  const cleanup = useCallback(() => {
    if (socketConnection) {
      socketConnection.close();
      setSocketConnection(null);
    }
    
    // 清理轮询定时器
    if (pollingTimer) {
      clearInterval(pollingTimer);
      setPollingTimer(null);
    }
  }, [socketConnection, pollingTimer]);

  // 组件卸载时清理
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 处理图片上传
  const handleImageSelected = (selectedFile: File) => {
    // 清理之前的任务
    cleanup();
    
    setFile(selectedFile);
    setStatus('IDLE');
    setProgress(0);
    setTaskId(null);
    setResultImage(null);
    setErrorMessage(null);
  };

  // 处理图片生成
  const handleGenerate = async () => {
    if (!file) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      // 清理之前的任务，确保之前的连接和轮询被停止
      cleanup();
      
      // 上传图片
      setStatus('UPLOADING');
      const uploadResult = await uploadImage(file, tool.apiKey);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }

      // 发起AI任务
      setStatus('PROCESSING');
      setProgress(10);
      
      const generateResult = await generateImage(
        uploadResult.fileId, 
        tool.apiKey, 
        tool.webappId, 
        tool.nodeId
      );
      
      if (!generateResult.success) {
        throw new Error(generateResult.error || 'Failed to generate image');
      }

      // 设置任务ID
      setTaskId(generateResult.data.taskId);

      // 尝试建立WebSocket连接
      try {
        const ws = createWebSocketConnection(
          generateResult.data.webSocketUrl,
          (data) => {
            // 处理进度更新
            if (data.type === 'progress' && typeof data.progress === 'number') {
              console.log(`WebSocket进度更新: ${data.progress}%`);
              setProgress(data.progress);
            } 
            
            // 处理状态更新
            if (data.type === 'status' && data.data && data.data.status) {
              console.log('WebSocket状态更新:', data.data.status);
              if (data.data.status.progress) {
                setProgress(data.data.status.progress);
              }
            } 
            
            // 处理成功完成
            if (data.type === 'execution_success') {
              console.log('WebSocket通知任务完成，开始获取结果');
              // 关闭WebSocket连接
              cleanup();
              // 获取结果
              checkResult(generateResult.data.taskId);
            }
            
            // 处理错误
            if (data.type === 'error' || data.error) {
              const errorMsg = data.error || 'Processing failed';
              console.error('WebSocket返回错误:', errorMsg);
              setStatus('ERROR');
              setErrorMessage(errorMsg);
              cleanup();
            }
          },
          (error) => {
            console.error('WebSocket error:', error);
            // WebSocket失败时切换到轮询
            cleanup();
            startPolling(generateResult.data.taskId);
          }
        );
        
        setSocketConnection(ws);
      } catch (err) {
        console.error('Failed to establish WebSocket connection:', err);
        // WebSocket连接失败时启动轮询
        startPolling(generateResult.data.taskId);
      }

    } catch (error) {
      setStatus('ERROR');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Error in processing:', error);
    }
  };

  // 启动轮询
  const startPolling = (tid: string) => {
    console.log(`开始轮询任务状态: ${tid}`);
    
    // 清理之前的轮询定时器
    if (pollingTimer) {
      clearInterval(pollingTimer);
      setPollingTimer(null);
    }
    
    let retryCount = 0;
    const maxRetries = 60; // 最多尝试60次，大约5分钟
    
    const poll = async () => {
      try {
        retryCount++;
        console.log(`轮询 #${retryCount}/${maxRetries}`);
        
        if (retryCount > maxRetries) {
          console.log('轮询超时，停止轮询');
          if (pollingTimer) {
            clearInterval(pollingTimer);
            setPollingTimer(null);
          }
          setStatus('ERROR');
          setErrorMessage('Operation timed out');
          return;
        }
        
        // 获取任务状态
        const statusResponse = await checkTaskStatus(tid, tool.apiKey);
        console.log(`轮询状态结果:`, statusResponse);
        
        if (!statusResponse.success) {
          throw new Error(statusResponse.error || 'Failed to check status');
        }
        
        // 更新进度
        if (statusResponse.progress) {
          console.log(`更新进度: ${statusResponse.progress}%`);
          setProgress(statusResponse.progress);
        }
        
        // 检查任务是否完成
        if (statusResponse.status === 'COMPLETED' || statusResponse.status === 'SUCCESS') {
          console.log('任务已完成，获取结果');
          if (pollingTimer) {
            clearInterval(pollingTimer);
            setPollingTimer(null);
          }
          checkResult(tid);
        } else if (statusResponse.status === 'ERROR' || statusResponse.status === 'FAILED') {
          throw new Error('Processing failed');
        } else {
          console.log(`当前任务状态: ${statusResponse.status}`);
        }
      } catch (err) {
        console.error('轮询过程中出错:', err);
        if (retryCount > 10) { // 尝试10次后如果仍然失败，显示错误
          if (pollingTimer) {
            clearInterval(pollingTimer);
            setPollingTimer(null);
          }
          setStatus('ERROR');
          setErrorMessage(err instanceof Error ? err.message : 'Failed to process image');
        }
      }
    };
    
    // 立即执行一次
    poll();
    
    // 每5秒轮询一次
    const interval = setInterval(poll, 5000);
    setPollingTimer(interval);
    
    return () => {
      console.log('清理轮询定时器');
      clearInterval(interval);
    };
  };

  // 获取任务结果
  const checkResult = async (tid: string) => {
    try {
      console.log('检查任务结果，任务ID:', tid);
      const result = await getTaskResult(tid, tool.apiKey);
      
      console.log('获取到的结果:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get result');
      }
      
      // 任务仍在运行中，需要继续等待
      if (result.isRunning) {
        console.log('任务仍在运行，继续轮询');
        // 设置一个短暂的定时器，几秒后再次检查
        setTimeout(() => {
          startPolling(tid);
        }, 3000);
        return;
      }
      
      if (result.images && result.images.length > 0) {
        console.log('设置结果图像:', result.images[0]);
        setResultImage(result.images[0]);
        setStatus('COMPLETED');
        setProgress(100);
      } else {
        // 检查原始结果数据，可能图像URL在不同的字段
        if (result.rawData) {
          console.log('检查原始数据中的图像URL');
          let foundUrl = null;
          
          if (Array.isArray(result.rawData)) {
            // 尝试从不同字段中查找URL
            for (const item of result.rawData) {
              if (item.fileUrl) {
                foundUrl = item.fileUrl;
                break;
              } else if (item.url) {
                foundUrl = item.url;
                break;
              } else if (item.imageUrl) {
                foundUrl = item.imageUrl;
                break;
              }
            }
          }
          
          if (foundUrl) {
            console.log('从原始数据中找到图像URL:', foundUrl);
            setResultImage(foundUrl);
            setStatus('COMPLETED');
            setProgress(100);
            return;
          }
        }
        
        throw new Error('No result image found');
      }
    } catch (error) {
      console.error('获取结果时出错:', error);
      setStatus('ERROR');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to get result');
    }
  };

  // 如果组件还未挂载，先不显示内容
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 生成更多的示例图片（为了满足至少30个展示位）
  const extendedDemoImages = [];
  for (let i = 0; i < 30; i++) {
    extendedDemoImages.push(tool.demoImages[i % tool.demoImages.length]);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
      {/* 第一部分：简洁的标题区域（占屏幕约1/3） */}
      <div style={{ 
        height: '33vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'flex-start',
        marginBottom: '40px',
      }}>
        <h1 style={{ 
          fontSize: '60px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          color: 'white',
        }}>
          {tool.name}
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: '#d1d5db', 
          maxWidth: '600px',
        }}>
          {tool.description}
        </p>
      </div>

      {/* 第二部分：左右两栏功能区 */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '24px',
        marginBottom: '60px',
      }}>
        {/* 左侧：图片上传区和生成按钮 */}
        <div style={{
          flex: 1,
          backgroundColor: 'rgba(31, 41, 55, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(75, 85, 99, 0.5)',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
            Upload Image
          </h2>
          <ImageUploader onImageSelected={handleImageSelected} />
          
          {status !== 'IDLE' && (
            <div style={{ marginTop: '24px' }}>
              <ProcessingStatus
                status={status}
                progress={progress}
                errorMessage={errorMessage || undefined}
              />
            </div>
          )}
          
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={handleGenerate}
              disabled={!file || status === 'UPLOADING' || status === 'PROCESSING'}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                color: 'white',
                backgroundColor: !file || status === 'UPLOADING' || status === 'PROCESSING' 
                  ? '#374151' 
                  : '#7c3aed',
                cursor: !file || status === 'UPLOADING' || status === 'PROCESSING' 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
              }}
            >
              {status === 'UPLOADING' || status === 'PROCESSING' 
                ? 'Processing...' 
                : 'Generate Image'}
            </button>
          </div>
        </div>
        
        {/* 右侧：图片预览区和下载按钮 */}
        <div style={{
          flex: 1,
          backgroundColor: 'rgba(31, 41, 55, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
            Result Preview
          </h2>
          
          {resultImage ? (
            <ResultDisplay imageUrl={resultImage} />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              color: '#9ca3af',
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px', marginBottom: '16px', color: '#4b5563' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p style={{ fontSize: '16px' }}>Upload an image and click Generate to see the result here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 第三部分：更大的示例展示区 */}
      <div style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '24px' }}>
          Example Results
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px'
        }}>
          {extendedDemoImages.map((image, index) => (
            <div 
              key={index}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                aspectRatio: '1/1',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <Image
                src={image}
                alt={`Demo ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
              />
            </div>
          ))}
        </div>
      </div>

      {status === 'ERROR' && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: '12px' }}>{errorMessage}</p>
          <button
            onClick={() => {
              if (taskId) {
                // 清理之前的状态
                cleanup();
                // 重置进度和状态
                setStatus('PROCESSING');
                setProgress(10);
                setErrorMessage(null);
                // 重新开始轮询
                startPolling(taskId);
              }
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
} 