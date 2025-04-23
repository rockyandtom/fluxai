import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

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
    
    // 发送请求
    console.log(`服务端开始上传文件至RunningHub: ${API_BASE_URL}/task/openapi/upload`);
    
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/upload?apiKey=${apiKey}`,
      apiFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Host': 'www.runninghub.cn'
        },
        timeout: 60000 // 60秒超时，增加等待时间
      }
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