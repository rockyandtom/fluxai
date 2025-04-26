import { NextResponse } from 'next/server';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'https://www.runninghub.cn';

// 添加重试逻辑的函数
async function fetchWithRetry(url: string, data: any, headers: any, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`尝试创建AI任务 (第${attempt}/${maxRetries}次)...`);
      
      const response = await axios.post(url, data, {
        headers,
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
    // 获取请求数据
    const data = await request.json();
    const { imageId, apiKey, webappId, nodeId, toolId, additionalNodes = [] } = data;
    
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
      nodeId,
      toolId,
      hasAdditionalNodes: additionalNodes.length > 0
    });
    
    // 构建请求数据 - 基本节点信息
    let nodeInfoList = [{
      nodeId,
      fieldName: "image",
      fieldValue: imageId
    }];
    
    // 添加特定工具的额外节点（如适用）
    if (toolId === 'id-photo') {
      // ID照片工具需要额外的模型参数
      nodeInfoList.push({
        nodeId: "88", // 模型节点ID
        fieldName: "ckpt_name",
        fieldValue: "STOIQONewrealityFLUXSD_XLLight10.safetensors"
      });
    }
    
    // 添加任何其他额外节点（如果有）
    if (additionalNodes && additionalNodes.length > 0) {
      nodeInfoList = [...nodeInfoList, ...additionalNodes];
    }
    
    // 构建最终请求数据
    const requestData = {
      webappId,
      apiKey,
      nodeInfoList
    };
    
    // 发送请求
    console.log('服务端发送AI任务请求:', JSON.stringify(requestData));
    
    const headers = {
      'Content-Type': 'application/json',
      'Host': 'www.runninghub.cn'
    };
    
    // 使用重试机制发送请求
    const response = await fetchWithRetry(
      `${API_BASE_URL}/task/openapi/ai-app/run`,
      requestData,
      headers
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
      
      // 超时错误处理
      if (error.code === 'ECONNABORTED') {
        errorMessage = '创建AI任务超时，请稍后再试或尝试上传较小的图片';
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