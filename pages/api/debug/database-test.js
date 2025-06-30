/**
 * 数据库连接测试API
 * 访问: /api/debug/database-test
 */

import prisma from '../../../prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 测试数据库连接
    console.log('测试数据库连接...');
    
    // 尝试查询用户表
    const userCount = await prisma.user.count();
    console.log('用户数量:', userCount);
    
    // 检查表结构
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('数据库表:', tables);
    
    res.status(200).json({
      status: 'SUCCESS',
      message: '数据库连接成功',
      userCount,
      tables: tables.map(t => t.table_name),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('数据库连接错误:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: '数据库连接失败',
      error: error.message,
      errorCode: error.code,
      timestamp: new Date().toISOString()
    });
  } finally {
    await prisma.$disconnect();
  }
} 