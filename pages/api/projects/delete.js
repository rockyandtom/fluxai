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
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('删除项目 - 获取会话信息:', session ? '成功' : '失败');

    if (!session || !session.user) {
      console.log('用户未认证');
      return res.status(401).json({ error: 'Unauthorized' });
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
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { id: projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    console.log('删除项目 - 项目ID:', projectId, '用户ID:', userId);

    // 验证项目是否属于当前用户
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        userId: true,
        appName: true,
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.userId !== userId) {
      console.log('项目不属于当前用户:', project.userId, '!=', userId);
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 执行删除
    await prisma.project.delete({
      where: { id: projectId },
    });

    console.log(`项目删除成功: ${project.appName} (${projectId})`);
    res.status(200).json({ success: true, message: 'Project deleted successfully' });

  } catch (error) {
    console.error('删除项目时发生错误:', error);
    
    // 处理数据库连接错误
    if (error.code === 'P1001') {
      return res.status(503).json({ error: '数据库连接失败，请稍后重试' });
    }
    
    // 处理记录不存在错误
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(500).json({ 
      error: '删除项目失败',
      message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
} 