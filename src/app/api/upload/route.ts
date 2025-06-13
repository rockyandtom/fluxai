import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

// 添加重试逻辑的函数
async function fetchWithRetry(url: string, formData: FormData, config: any, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试上传图片 (第${attempt}/${maxRetries}次)...`);
      
      const response = await axios.post(url, formData, {
        ...config,
        timeout: 120000 // 增加到120秒超时
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
    // 获取API密钥
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API Key is required' },
        { status: 400 }
      );
    }
    
    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }
    
    console.log('服务端接收到文件:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // 创建新的FormData对象
    const apiFormData = new FormData();
    apiFormData.append('file', file);
    
    // 请求配置
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Host': 'www.runninghub.cn'
      }
    };
    
    // 发送请求（使用重试机制）
    console.log(`服务端开始上传文件至RunningHub: ${API_BASE_URL}/task/openapi/upload`);
    
    const response = await fetchWithRetry(
      `${API_BASE_URL}/task/openapi/upload?apiKey=${apiKey}`,
      apiFormData,
      config
    );
    
    console.log('RunningHub上传响应:', response.data);
    
    // 返回结果
    if (response.data.code === 0 && response.data.data) {
      return NextResponse.json({
        success: true,
        fileId: response.data.data.fileName
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.data.msg || 'Upload failed'
      });
    }
  } catch (error) {
    console.error('服务端上传处理错误:', error);
    
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // 如果是超时错误，返回更友好的提示信息
      if (error.code === 'ECONNABORTED') {
        errorMessage = '上传请求超时，请稍后再试或上传较小的图片';
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