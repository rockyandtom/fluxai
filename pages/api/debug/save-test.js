/**
 * 手动测试项目保存功能 - 保守修复方案
 * 访问: /api/debug/save-test?appName=test&imageUrl=https://example.com/image.jpg
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { testConnection, findUserByEmail, createProject } from '../../../prisma/client';

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

  try {
    console.log('开始项目保存测试 - 使用保守重试方案...');

    // 1. 测试数据库连接
    const connectionTest = await testConnection();
    console.log('数据库连接测试:', connectionTest.success ? 'OK' : 'FAILED');
    
    if (!connectionTest.success) {
      return res.status(503).json({
        status: 'ERROR',
        message: '数据库连接失败',
        step: 'connection_test',
        error: connectionTest.error,
        solution: '请检查数据库配置和网络连接'
      });
    }

    // 2. 测试会话获取
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

    // 3. 使用安全重试函数查询用户
    const user = await findUserByEmail(session.user.email);
    console.log('用户查询结果:', user ? 'OK' : 'FAILED');
    
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: '用户不存在',
        step: 'user_query',
        email: session.user.email,
        solution: '请尝试重新登录Google账户'
      });
    }

    // 4. 使用安全重试函数创建项目
    console.log('创建测试项目:', { appName, userId: user.id, imageUrl: testImageUrl });

    const project = await createProject(appName, testImageUrl, user.id);
    console.log('项目创建成功:', project.id);

    res.status(200).json({
      status: 'SUCCESS',
      message: '🎉 项目保存测试成功！使用保守重试方案解决冲突！',
      results: {
        connectionTest: connectionTest,
        session: {
          email: session.user.email,
          name: session.user.name
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        project: {
          id: project.id,
          appName: project.appName,
          imageUrl: project.imageUrl,
          createdAt: project.createdAt.toISOString(),
          userId: project.userId
        },
        verification: '✅ 项目已通过重试机制成功保存到数据库'
      },
      technicalInfo: {
        solution: '保守的重试机制，遵循网站开发规范指南',
        optimizations: [
          '✅ 保持原有Prisma ORM功能',
          '✅ 添加智能重试包装器',
          '✅ 渐进式延迟避免冲突',
          '✅ 不破坏现有代码结构'
        ]
      },
      nextSteps: [
        '✅ 项目保存功能现在稳定工作！',
        '🔄 刷新"我的项目"页面应该能看到测试项目',
        '🗑️ 可以手动删除这个测试项目',
        '🎯 现在尝试重新生成AI作品，应该能稳定保存'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('项目保存测试错误:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: '项目保存测试失败',
      error: error.message,
      errorCode: error.code,
      possibleCauses: [
        '数据库持续冲突',
        '网络连接不稳定',
        '数据库权限问题',
        'Serverless环境限制'
      ],
      solutions: [
        '稍等片刻后重试',
        '检查网络连接稳定性',
        '确认数据库配置正确',
        '考虑增加重试次数'
      ],
      timestamp: new Date().toISOString()
    });
  }
} 