import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { findUserByEmail, createProject } from '../../../prisma/client';

export default async function handler(req, res) {
  // 添加CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('项目创建 - 获取会话信息:', session ? '成功' : '失败');

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

    const { appName, imageUrl } = req.body;

    if (!appName || !imageUrl) {
      console.log('缺少必需参数:', { appName: !!appName, imageUrl: !!imageUrl });
      return res.status(400).json({ message: 'Missing appName or imageUrl' });
    }

    console.log('创建项目 (使用重试机制):', { appName, userId: user.id, imageUrl: imageUrl.substring(0, 50) + '...' });

    // 使用安全重试函数创建项目
    const project = await createProject(appName, imageUrl, user.id);

    console.log('项目创建成功:', project.id);

    res.status(201).json({
      success: true,
      project: {
        id: project.id,
        appName: project.appName,
        imageUrl: project.imageUrl,
        createdAt: project.createdAt.toISOString(),
        userId: project.userId
      }
    });

  } catch (error) {
    console.error('创建项目失败:', error);
    
    // 处理数据库连接错误
    if (error.code === 'P1001') {
      return res.status(503).json({ message: '数据库连接失败，请稍后重试' });
    }
    
    // 处理外键约束错误
    if (error.code === 'P2003') {
      return res.status(400).json({ message: '用户不存在，请重新登录' });
    }

    // 数据重复错误
    if (error.code === '23505') {
      return res.status(409).json({ message: '项目ID重复，请重试' });
    }

    // Prepared statement错误应该通过重试机制自动处理
    if (error.code === '42P05') {
      return res.status(503).json({ message: '数据库繁忙，请稍后重试' });
    }

    // 通用错误处理
    res.status(500).json({ 
      message: '保存作品失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
} 