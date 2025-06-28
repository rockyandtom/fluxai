import axios from 'axios';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.GLOBAL_AGENT_HTTP_PROXY;
const noProxy = process.env.NO_PROXY || '';
const targetHost = new URL(process.env.RUNNINGHUB_API_URL || 'https://www.runninghub.cn').hostname;

const noProxyList = noProxy.split(',').map(h => h.trim()).filter(Boolean);
const shouldUseProxy = proxy && !noProxyList.some(domain => targetHost.endsWith(domain));

const agent = shouldUseProxy
  ? new HttpsProxyAgent(proxy)
  : new https.Agent({ 
      keepAlive: false, // 禁用keep-alive，强制每次请求都建立新连接，提高稳定性
      secureProtocol: 'TLSv1_2_method', // 强制使用TLS 1.2
    });

const runninghubAPI = axios.create({
  baseURL: process.env.RUNNINGHUB_API_URL || 'https://www.runninghub.cn',
  headers: {
    'Content-Type': 'application/json',
    'Host': 'www.runninghub.cn',
  },
  timeout: 30000, // 30秒超时
  httpsAgent: agent,
  // httpAgent: agent, // 如果有http请求也需要代理
});

runninghubAPI.interceptors.request.use(config => {
  // 可以在这里添加统一的日志记录或请求修改
  // console.log(`Sending request to RunningHub: ${config.url}`);
  return config;
}, error => {
  return Promise.reject(error);
});

runninghubAPI.interceptors.response.use(response => {
  const result = response.data;
  if (result.code !== 0) {
    let errorMessage = result.msg || 'RunningHub API Error';
    if (result.msg === 'TASK_QUEUE_MAXED') {
      errorMessage = 'RunningHub平台任务队列已满，请稍后再试';
    }
    // 创建一个包含状态码和信息的标准错误对象
    const error = new Error(errorMessage);
    error.code = result.code;
    error.response = response; // 将完整的响应附加到错误对象上
    return Promise.reject(error);
  }
  return result.data;
}, error => {
  // 增强错误日志记录，以便调试
  console.error('RunningHub API Error:', error.message);
  if (error.config) {
    console.error('Failed Request Config:', {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      data: error.config.data,
    });
  }

  let errorMessage = '无法连接到RunningHub平台，请检查网络连接';
  
  if (error.response) {
    // 如果是HTTP错误，优先使用后端返回的信息
    errorMessage = error.response.data.msg || error.response.data.error || `请求失败，状态码: ${error.response.status}`;
    error.statusCode = error.response.status; // 保存原始HTTP状态码
  } else if (error.code === 'ECONNRESET' || error.message.includes('socket hang up')) {
      errorMessage = '服务器繁忙，请稍后再试';
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      errorMessage = '无法连接到RunningHub平台，请检查网络配置';
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  error.message = errorMessage;
  return Promise.reject(error);
});


export default runninghubAPI; 