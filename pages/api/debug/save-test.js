/**
 * 手动测试项目保存功能
 * 访问: /api/debug/save-test?appName=test&imageUrl=https://example.com/image.jpg
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed - 使用GET请求' });
  }

  const { appName, imageUrl } = req.query;

  if (!appName) {
    return res.status(400).json({
      error: '缺少参数',
      usage: '使用方式: /api/debug/save-test?appName=test&imageUrl=https://example.com/image.jpg',
      example: 'https://www.fluxai.life/api/debug/save-test?appName=polaroid&imageUrl=https://via.placeholder.com/400'
    });
  }

  const testImageUrl = imageUrl || 'https://via.placeholder.com/400x300.png?text=Test+Project';

  const prisma = new PrismaClient();

  try {
    console.log('开始项目保存测试...');

    // 1. 测试会话获取
    const session = await getServerSession(req, res, authOptions);
    console.log('会话状态:', session ? 'OK' : 'FAILED');
    
    if (!session || !session.user?.email) {
      return res.status(401).json({
        status: 'ERROR',
        message: '用户未登录',
        step: 'session_check',
        solution: '请先登录Google账户'
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

    // 3. 测试项目创建
    console.log('创建测试项目:', { appName, userId: user.id, imageUrl: testImageUrl });

    const project = await prisma.project.create({
      data: {
        appName: appName,
        imageUrl: testImageUrl,
        userId: user.id,
      },
    });

    console.log('项目创建成功:', project.id);

    // 4. 验证创建结果
    const savedProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    await prisma.$disconnect();

    res.status(200).json({
      status: 'SUCCESS',
      message: '项目保存测试成功！🎉',
      results: {
        session: {
          email: session.user.email,
          name: session.user.name
        },
        user: user,
        project: {
          id: project.id,
          appName: project.appName,
          imageUrl: project.imageUrl,
          createdAt: project.createdAt.toISOString(),
          userId: project.userId
        },
        verification: savedProject ? '✅ 项目已保存到数据库' : '❌ 保存验证失败'
      },
      nextSteps: [
        '✅ 项目保存功能正常',
        '🔄 刷新"我的项目"页面应该能看到测试项目',
        '🗑️ 可以手动删除这个测试项目',
        '🎯 现在尝试重新生成AI作品，应该能正常保存'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('项目保存测试错误:', error);
    
    await prisma.$disconnect();
    
    res.status(500).json({
      status: 'ERROR',
      message: '项目保存测试失败',
      error: error.message,
      errorCode: error.code,
      possibleCauses: [
        '数据库连接问题',
        'User表不存在或没有权限',
        'Project表不存在或结构不匹配',
        '外键约束问题'
      ],
      solutions: [
        '检查数据库连接状态',
        '确认用户已在数据库中存在',
        '验证Project表结构正确'
      ],
      timestamp: new Date().toISOString()
    });
  }
} 