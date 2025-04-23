import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

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
    
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/status`,
      {
        apiKey,
        taskId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn'
        },
        timeout: 30000 // 30秒超时
      }
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
      
      errorMessage = error.response?.data?.msg || error.message;
      statusCode = error.response?.status || 500;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
} 