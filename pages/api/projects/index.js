import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { findUserByEmail, findUserProjects } from '../../../prisma/client';

export default async function handler(req, res) {
  // 添加CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('获取会话信息:', session ? '成功' : '失败');

    if (!session || !session.user) {
      console.log('用户未认证');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 使用安全重试函数查询用户
    let user = null;
    if (session.user.email) {
      console.log('通过邮箱查找用户ID:', session.user.email);
      user = await findUserByEmail(session.user.email);
    }

    if (!user || !user.id) {
      console.log('无法获取用户ID');
      return res.status(401).json({ message: 'User not found, please login again' });
    }

    console.log('查询用户项目, userId:', user.id);
    
    // 使用安全重试函数查询项目
    const projects = await findUserProjects(user.id);

    console.log(`找到 ${projects.length} 个项目`);
    res.status(200).json(projects);

  } catch (error) {
    console.error('获取项目列表时发生错误:', error);
    
    // 处理数据库连接错误
    if (error.code === 'P1001') {
      return res.status(503).json({ message: '数据库连接失败，请稍后重试' });
    }
    
    // 处理 prepared statement 错误
    if (error.code === '42P05') {
      return res.status(503).json({ message: '数据库繁忙，请稍后重试' });
    }
    
    // 处理认证错误
    if (error.message.includes('session')) {
      return res.status(401).json({ message: '会话已过期，请重新登录' });
    }

    res.status(500).json({ 
      message: '获取项目列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
} 