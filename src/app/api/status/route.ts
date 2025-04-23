import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

// 添加重试逻辑的函数
async function fetchWithRetry(url: string, data: any, headers: any, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试获取状态 (第${attempt}/${maxRetries}次)...`);
      
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
        const delayMs = 1000 * attempt; // 第一次失败等待1秒，第二次失败等待2秒
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
    
    console.log('服务端检查任务状态:', { taskId, apiKey: apiKey.substring(0, 5) + '...' });
    
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
      `${API_BASE_URL}/task/openapi/status`,
      requestData,
      headers
    );
    
    console.log('RunningHub状态响应:', response.data);
    
    // 特殊情况处理：如果返回APIKEY_TASK_IS_RUNNING，表示任务仍在进行中
    if (response.data.code !== 0 && response.data.msg === 'APIKEY_TASK_IS_RUNNING') {
      return NextResponse.json({
        success: true,
        status: 'RUNNING',
        progress: 50
      });
    }
    
    // 验证结果
    if (response.data.code !== 0) {
      return NextResponse.json({
        success: false,
        error: response.data.msg || 'Failed to get status'
      });
    }
    
    // 处理状态信息
    let status = 'UNKNOWN';
    let progress = 0;
    
    // 检查 data 是否为字符串类型
    if (typeof response.data.data === 'string') {
      // 状态映射
      if (response.data.data === 'SUCCESS' || response.data.data === 'COMPLETED') {
        status = 'COMPLETED';
        progress = 100;
      } else if (response.data.data === 'RUNNING' || response.data.data === 'PENDING') {
        status = 'RUNNING';
        progress = 50;  // 默认进度
      } else if (response.data.data === 'FAILED' || response.data.data === 'ERROR') {
        status = 'ERROR';
      } else {
        status = response.data.data;
      }
    } else if (response.data.data && typeof response.data.data === 'object') {
      // 对象格式的状态
      status = response.data.data.status || 'UNKNOWN';
      progress = response.data.data.progress || 0;
    }
    
    // 返回状态信息
    return NextResponse.json({
      success: true,
      status,
      progress
    });
  } catch (error) {
    console.error('服务端获取状态错误:', error);
    
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.message.includes('APIKEY_TASK_IS_RUNNING')) {
        return NextResponse.json({
          success: true,
          status: 'RUNNING',
          progress: 50
        });
      }
      
      // 超时错误处理
      if (error.code === 'ECONNABORTED') {
        errorMessage = '获取状态超时，请稍后再试';
        statusCode = 504;
        
        // 对于超时错误，返回RUNNING状态，而不是错误
        return NextResponse.json({
          success: true,
          status: 'RUNNING',
          progress: 50
        });
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