import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../prisma/client';

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

    // 处理不同的用户ID来源
    let userId = session.user.id;
    
    // 如果没有直接的ID，尝试通过邮箱查找用户
    if (!userId && session.user.email) {
      console.log('通过邮箱查找用户ID:', session.user.email);
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      userId = user?.id;
    }

    if (!userId) {
      console.log('无法获取用户ID');
      return res.status(401).json({ message: 'User ID not found' });
    }

    const { appName, imageUrl } = req.body;

    if (!appName || !imageUrl) {
      console.log('缺少必需参数:', { appName: !!appName, imageUrl: !!imageUrl });
      return res.status(400).json({ message: 'Missing appName or imageUrl' });
    }

    console.log('创建项目:', { appName, userId, imageUrl: imageUrl.substring(0, 50) + '...' });

    const project = await prisma.project.create({
      data: {
        appName: appName,
        imageUrl: imageUrl,
        userId: userId,
      },
    });

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

    // 处理Prepared Statement错误
    if (error.code === '42P05' || error.message.includes('prepared statement')) {
      console.log('检测到prepared statement冲突，重试...');
      // 简单重试机制
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryProject = await prisma.project.create({
          data: {
            appName: req.body.appName,
            imageUrl: req.body.imageUrl,
            userId: userId,
          },
        });
        
        return res.status(201).json({
          success: true,
          project: {
            id: retryProject.id,
            appName: retryProject.appName,
            imageUrl: retryProject.imageUrl,
            createdAt: retryProject.createdAt.toISOString(),
            userId: retryProject.userId
          }
        });
      } catch (retryError) {
        console.error('重试也失败:', retryError);
      }
    }

    res.status(500).json({ 
      message: '保存作品失败',
      error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
} 