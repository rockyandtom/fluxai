import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

// 添加重试逻辑的函数
async function fetchWithRetry(url: string, data: any, headers: any, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试获取结果 (第${attempt}/${maxRetries}次)...`);
      
      const response = await axios.post(url, data, {
        headers,
        timeout: 60000 // 60秒超时
      });
      
      // 如果成功，立即返回结果
      return response;
    } catch (error) {
      lastError = error;
      console.error(`第${attempt}次尝试失败:`, error);
      
      // 如果不是最后一次尝试，则等待一段时间再重试
      if (attempt < maxRetries) {
        const delayMs = 2000 * attempt; // 第一次失败等待2秒，第二次失败等待4秒
        console.log(`等待${delayMs}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // 所有重试都失败，抛出最后一个错误
  throw lastError;
}

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const data = await request.json();
    const { taskId, apiKey } = data;
    
    if (!taskId || !apiKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    console.log('服务端获取任务结果:', { taskId, apiKey: apiKey.substring(0, 5) + '...' });
    
    // 发送请求（使用重试机制）
    const requestData = {
      apiKey,
      taskId
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'Host': 'www.runninghub.cn'
    };
    
    // 使用重试机制发送请求
    const response = await fetchWithRetry(
      `${API_BASE_URL}/task/openapi/outputs`,
      requestData,
      headers
    );
    
    console.log('RunningHub结果响应:', response.data);
    
    // 特殊情况：任务仍在进行中
    if (response.data.code !== 0 && response.data.msg === 'APIKEY_TASK_IS_RUNNING') {
      return NextResponse.json({
        success: true,
        isRunning: true,
        images: [],
        rawData: null
      });
    }
    
    // 验证结果
    if (response.data.code !== 0) {
      return NextResponse.json({
        success: false,
        error: response.data.msg || 'Failed to get result'
      });
    }
    
    // 提取图像 URL
    let images: string[] = [];
    
    // 处理数组格式的数据
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log('原始结果数据:', response.data.data);
      
      images = response.data.data
        .filter(item => {
          const hasUrl = !!item.fileUrl;
          const validType = !item.fileType || 
            item.fileType.toLowerCase().includes('png') || 
            item.fileType.toLowerCase().includes('jpg') || 
            item.fileType.toLowerCase().includes('jpeg');
          
          console.log('筛选项:', { item, hasUrl, validType });
          return hasUrl && validType;
        })
        .map(item => {
          // 确保URL格式正确
          let url = item.fileUrl;
          
          // 检查URL是否为相对路径，如果是则添加API基础URL
          if (url && !url.startsWith('http')) {
            if (url.startsWith('/')) {
              url = `${API_BASE_URL}${url}`;
            } else {
              url = `${API_BASE_URL}/${url}`;
            }
          }
          
          console.log('处理后的图片URL:', url);
          return url;
        });
    }
    
    // 处理单个结果对象的情况
    if (response.data.data && !Array.isArray(response.data.data) && typeof response.data.data === 'object') {
      console.log('单个结果对象:', response.data.data);
      
      // 尝试从不同字段中提取URL
      const extractUrl = (obj: any): string | null => {
        if (!obj) return null;
        
        // 按照优先级检查不同的可能URL字段
        if (obj.fileUrl) return obj.fileUrl;
        if (obj.url) return obj.url;
        if (obj.imageUrl) return obj.imageUrl;
        if (obj.image) return obj.image;
        if (obj.outputUrl) return obj.outputUrl;
        
        return null;
      };
      
      const url = extractUrl(response.data.data);
      if (url) {
        // 确保URL格式正确
        let processedUrl = url;
        
        // 检查URL是否为相对路径，如果是则添加API基础URL
        if (!processedUrl.startsWith('http')) {
          if (processedUrl.startsWith('/')) {
            processedUrl = `${API_BASE_URL}${processedUrl}`;
          } else {
            processedUrl = `${API_BASE_URL}/${processedUrl}`;
          }
        }
        
        console.log('处理后的单个图片URL:', processedUrl);
        images.push(processedUrl);
      }
    }
    
    console.log('提取的图像URL:', images);
    
    // 返回结果
    return NextResponse.json({
      success: true,
      isRunning: false,
      images,
      rawData: response.data.data // 返回原始数据，方便调试
    });
  } catch (error) {
    console.error('服务端获取结果错误:', error);
    
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // 特殊情况：如果错误消息是任务正在运行
      if (error.message.includes('APIKEY_TASK_IS_RUNNING')) {
        return NextResponse.json({
          success: true,
          isRunning: true,
          images: [],
          rawData: null
        });
      }
      
      // 超时错误处理
      if (error.code === 'ECONNABORTED') {
        errorMessage = '获取结果超时，请刷新页面重试';
        statusCode = 504;
      } else {
        errorMessage = error.response?.data?.msg || error.message;
        statusCode = error.response?.status || 500;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
} 