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
  
  try {
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/upload?apiKey=${apiKey}`, 
      formData
    );
    
    // 验证结果
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || '上传失败');
    }
    
    // 返回文件ID
    return {
      success: true,
      fileId: response.data.data.fileName
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
}

/**
 * 发起AI任务
 * @param imageId 图片ID
 * @param apiKey API密钥
 * @param webappId 应用ID
 * @param nodeId 节点ID
 * @returns 任务信息
 */
export async function generateImage(imageId: string, apiKey: string, webappId: string, nodeId: string) {
  // 调试日志
  console.log('开始图片生成，接收到的参数：', { imageId, apiKey, webappId, nodeId });
  
  // 确保imageId格式正确 - 移除可能的"api/"前缀
  const processedImageId = imageId.replace(/^api\//, '');
  console.log('处理后的imageId:', processedImageId);
  
  // 构建请求数据
  const data = {
    webappId,
    apiKey,
    nodeInfoList: [{
      nodeId,
      fieldName: "image",
      fieldValue: processedImageId
    }]
  };
  
  console.log('发送的请求数据:', JSON.stringify(data));
  
  try {
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/ai-app/run`,
      data,
      { headers }
    );
    
    console.log('API响应:', response.data);
    
    // 验证结果
    if (response.data.code !== 0 || !response.data.data) {
      throw new Error(response.data.msg || '任务创建失败');
    }
    
    // 返回任务信息
    return {
      success: true,
      data: {
        taskId: response.data.data.taskId,
        clientId: response.data.data.clientId,
        webSocketUrl: response.data.data.netWssUrl,
        taskStatus: response.data.data.taskStatus || 'RUNNING'
      }
    };
  } catch (error) {
    console.error('创建任务失败:', error);
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
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/status`,
      {
        apiKey,
        taskId
      },
      { headers }
    );
    
    console.log('状态API响应:', response.data);
    
    // 特殊情况处理：如果返回APIKEY_TASK_IS_RUNNING，表示任务仍在进行中
    if (response.data.code !== 0 && response.data.msg === 'APIKEY_TASK_IS_RUNNING') {
      return {
        success: true,
        status: 'RUNNING',
        progress: 50
      };
    }
    
    // 验证结果
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || '获取状态失败');
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
    return {
      success: true,
      status,
      progress
    };
  } catch (error) {
    // 特殊情况处理：如果错误消息是APIKEY_TASK_IS_RUNNING
    if (error instanceof Error && error.message === 'APIKEY_TASK_IS_RUNNING') {
      return {
        success: true,
        status: 'RUNNING',
        progress: 50  // 默认进度
      };
    }
    
    console.error('获取任务状态失败:', error);
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
    // 发送请求
    const response = await axios.post(
      `${API_BASE_URL}/task/openapi/outputs`,
      {
        apiKey,
        taskId
      },
      { headers }
    );
    
    console.log('结果API响应:', response.data);
    
    // 特殊情况：任务仍在进行中
    if (response.data.code !== 0 && response.data.msg === 'APIKEY_TASK_IS_RUNNING') {
      console.log('任务仍在运行中，需要继续等待');
      return {
        success: true,
        isRunning: true,
        images: [],
        rawData: null
      };
    }
    
    // 验证结果
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || '获取结果失败');
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
    return {
      success: true,
      isRunning: false,
      images,
      rawData: response.data.data // 返回原始数据，方便调试
    };
  } catch (error) {
    // 特殊情况：如果错误消息是任务正在运行
    if (error instanceof Error && error.message === 'APIKEY_TASK_IS_RUNNING') {
      console.log('任务仍在运行中，需要继续等待');
      return {
        success: true,
        isRunning: true,
        images: [],
        rawData: null
      };
    }
    
    console.error('获取任务结果失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取结果失败'
    };
  }
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
  onMessage: (data: any) => void,
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