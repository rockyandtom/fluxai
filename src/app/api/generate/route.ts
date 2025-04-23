import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const data = await request.json();
    const { imageId, apiKey, webappId, nodeId } = data;
    
    if (!imageId || !apiKey || !webappId || !nodeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    console.log('服务端收到生成图片请求:', {
      imageId,
      apiKey: apiKey.substring(0, 5) + '...',
      webappId,
      nodeId
    });
    
    // 构建请求数据 - 保持完整的imageId，包括api/前缀
    const requestData = {
      webappId,
      apiKey,
      nodeInfoList: [{
        nodeId,
        fieldName: "image",
        fieldValue: imageId
      }]
    };
    
    // 发送请求
    console.log('服务端发送AI任务请求:', JSON.stringify(requestData));
    
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/ai-app/run`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn'
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    console.log('RunningHub AI任务响应:', response.data);
    
    // 返回结果
    if (response.data.code === 0 && response.data.data) {
      return NextResponse.json({
        success: true,
        data: {
          taskId: response.data.data.taskId,
          clientId: response.data.data.clientId,
          webSocketUrl: response.data.data.netWssUrl,
          taskStatus: response.data.data.taskStatus || 'RUNNING'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: response.data.msg || 'Failed to create task'
      });
    }
  } catch (error) {
    console.error('服务端生成处理错误:', error);
    
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
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