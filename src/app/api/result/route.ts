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
    
    console.log('服务端获取任务结果:', { taskId, apiKey: apiKey.substring(0, 5) + '...' });
    
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/outputs`,
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
        .map(item => item.fileUrl);
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