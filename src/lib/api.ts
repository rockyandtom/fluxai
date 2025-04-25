import axios from 'axios';

// API 配置
const API_BASE_URL = 'https://www.runninghub.cn';

// 通用的API请求头
const headers = {
  'Content-Type': 'application/json',
  'Host': 'www.runninghub.cn'
};

/**
 * 上传图片到RunningHub
 * @param file 要上传的文件
 * @param apiKey API密钥
 * @returns 上传结果，包含fileId
 */
export async function uploadImage(file: File, apiKey: string) {
  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('file', file);
  
  // 记录文件信息
  console.log('上传文件信息:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString(),
  });
  
  try {
    console.log(`开始通过本地API代理上传文件，apiKey=${apiKey.substring(0, 5)}...`);
    
    // 使用本地API路由代理请求
    const response = await axios.post(
      `/api/upload?apiKey=${apiKey}`, 
      formData,
      { 
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    console.log('上传响应:', response.data);
    
    // 验证结果
    if (!response.data.success) {
      throw new Error(response.data.error || '上传失败');
    }
    
    // 返回文件ID
    return {
      success: true,
      fileId: response.data.fileId
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    
    // 详细记录错误信息
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
}

/**
 * 发起AI图像生成任务
 * @param imageId 上传的图片ID
 * @param apiKey API密钥
 * @param webappId WebApp ID
 * @param nodeId 节点ID
 * @param toolId 工具ID，用于特定工具的参数配置
 * @returns 任务创建结果
 */
export async function generateImage(
  imageId: string, 
  apiKey: string, 
  webappId: string, 
  nodeId: string,
  toolId?: string, 
  additionalNodes?: Array<{nodeId: string, fieldName: string, fieldValue: string}>
) {
  // 调试日志
  console.log('开始图片生成，接收到的参数：', { 
    imageId, 
    apiKey, 
    webappId, 
    nodeId,
    toolId,
    hasAdditionalNodes: additionalNodes && additionalNodes.length > 0
  });
  
  // 确保imageId格式正确 - 保留完整的fileId，包括api/前缀
  const processedImageId = imageId; // 不再移除api/前缀
  console.log('处理后的imageId:', processedImageId);
  
  // 构建请求数据
  const data = {
    imageId: processedImageId,
    apiKey,
    webappId,
    nodeId,
    toolId,
    additionalNodes
  };
  
  console.log('发送的请求数据:', JSON.stringify(data));
  
  try {
    // 使用本地API路由代理请求
    const response = await axios.post(
      `/api/generate`,
      data,
      { 
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    console.log('生成任务响应:', response.data);
    
    // 验证结果
    if (!response.data.success) {
      throw new Error(response.data.error || '任务创建失败');
    }
    
    // 返回任务信息
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('创建任务失败:', error);
    
    // 详细记录错误信息
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '任务创建失败'
    };
  }
}

/**
 * 获取任务状态
 * @param taskId 任务ID
 * @param apiKey API密钥
 * @returns 任务状态信息
 */
export async function checkTaskStatus(taskId: string, apiKey: string) {
  try {
    console.log(`通过本地API代理检查任务状态: ${taskId}`);
    
    // 使用本地API路由代理请求
    const response = await axios.post(
      `/api/status`,
      {
        apiKey,
        taskId
      },
      { 
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    console.log('状态API响应:', response.data);
    
    // 验证结果
    if (!response.data.success) {
      throw new Error(response.data.error || '获取状态失败');
    }
    
    // 返回状态信息
    return {
      success: true,
      status: response.data.status,
      progress: response.data.progress
    };
  } catch (error) {
    console.error('获取任务状态失败:', error);
    
    // 详细记录错误信息
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败'
    };
  }
}

/**
 * 获取任务结果
 * @param taskId 任务ID
 * @param apiKey API密钥
 * @returns 处理结果，包含图像URL
 */
export async function getTaskResult(taskId: string, apiKey: string) {
  console.log('开始获取任务结果，任务ID:', taskId);
  
  try {
    console.log(`通过本地API代理获取任务结果: ${taskId}`);
    
    // 使用本地API路由代理请求
    const response = await axios.post(
      `/api/result`,
      {
        apiKey,
        taskId
      },
      { 
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );
    
    console.log('结果API响应:', response.data);
    
    // 验证结果
    if (!response.data.success) {
      throw new Error(response.data.error || '获取结果失败');
    }
    
    // 返回结果
    return {
      success: true,
      isRunning: response.data.isRunning,
      images: response.data.images,
      rawData: response.data.rawData
    };
  } catch (error) {
    console.error('获取任务结果失败:', error);
    
    // 详细记录错误信息
    if (axios.isAxiosError(error)) {
      console.error('API错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取结果失败'
    };
  }
}

/**
 * WebSocket消息数据类型接口
 */
interface WebSocketMessageData {
  type?: string;
  progress?: number;
  data?: {
    status?: {
      progress?: number;
    };
  };
  error?: string;
  [key: string]: unknown;
}

/**
 * 创建WebSocket连接
 * @param webSocketUrl WebSocket URL
 * @param onMessage 消息处理函数
 * @param onError 错误处理函数
 * @returns WebSocket实例
 */
export function createWebSocketConnection(
  webSocketUrl: string,
  onMessage: (data: WebSocketMessageData) => void,
  onError: (error: Error) => void
) {
  console.log('尝试建立WebSocket连接:', webSocketUrl);
  
  const ws = new WebSocket(webSocketUrl);
  
  ws.onopen = () => {
    console.log('WebSocket连接已成功打开');
  };
  
  ws.onmessage = (event) => {
    try {
      console.log('收到WebSocket消息:', event.data);
      const data = JSON.parse(event.data);
      console.log('解析后的WebSocket数据:', data);
      onMessage(data);
    } catch (err) {
      console.error('处理WebSocket消息时出错:', err);
      onError(err instanceof Error ? err : new Error('处理WebSocket消息时出错'));
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket连接错误:', error);
    onError(new Error('WebSocket连接错误'));
  };
  
  ws.onclose = (event) => {
    console.log('WebSocket连接已关闭:', event.code, event.reason);
  };
  
  return ws;
} 