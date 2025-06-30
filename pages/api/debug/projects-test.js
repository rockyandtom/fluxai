/**
 * 测试项目查询功能
 * 访问: /api/debug/projects-test
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prisma = new PrismaClient();

  try {
    console.log('开始测试项目查询...');

    // 1. 测试会话获取
    const session = await getServerSession(req, res, authOptions);
    console.log('会话状态:', session ? 'OK' : 'FAILED');
    
    if (!session || !session.user?.email) {
      return res.status(401).json({
        status: 'ERROR',
        message: '用户未登录',
        step: 'session_check'
      });
    }

    // 2. 测试用户查询
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        name: true 
      }
    });
    
    console.log('用户查询结果:', user ? 'OK' : 'FAILED');
    
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: '用户不存在',
        step: 'user_query',
        email: session.user.email
      });
    }

    // 3. 测试项目查询
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        appName: true,
        imageUrl: true,
        createdAt: true,
        userId: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('项目查询结果:', projects.length, '个项目');

    // 4. 测试项目详细查询（带关联）
    const userWithProjects = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 5 // 只取前5个
        }
      }
    });

    await prisma.$disconnect();

    res.status(200).json({
      status: 'SUCCESS',
      message: '项目查询测试完成',
      results: {
        session: {
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name
        },
        user: user,
        projectsCount: projects.length,
        projects: projects.map(p => ({
          id: p.id,
          appName: p.appName,
          createdAt: p.createdAt.toISOString(),
          hasImage: !!p.imageUrl
        })),
        userWithProjectsCount: userWithProjects?.projects?.length || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('项目查询测试错误:', error);
    
    await prisma.$disconnect();
    
    res.status(500).json({
      status: 'ERROR',
      message: '项目查询测试失败',
      error: error.message,
      errorCode: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
} 