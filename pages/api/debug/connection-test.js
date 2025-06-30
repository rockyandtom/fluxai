/**
 * 测试数据库连接状态
 * 访问: /api/debug/connection-test
 */

import { testConnection } from '../../../prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('开始数据库连接测试...');
    
    // 使用统一的安全连接测试函数
    const result = await testConnection();
    
    if (result.success) {
      console.log('数据库连接测试成功');
      return res.status(200).json({
        status: 'SUCCESS',
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('数据库连接测试失败:', result);
      return res.status(500).json({
        status: 'ERROR',
        message: result.message,
        error: result.error,
        code: result.code,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('连接测试异常:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: '数据库连接失败',
      step: 'connection_test',
      error: error.message,
      solution: '请检查数据库配置和网络连接',
      timestamp: new Date().toISOString()
    });
  }
} 