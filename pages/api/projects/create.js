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
    console.log('=== 项目创建开始 ===');
    console.log('请求方法:', req.method);
    console.log('请求体:', JSON.stringify(req.body));
    
    const session = await getServerSession(req, res, authOptions);
    console.log('项目创建 - 获取会话信息:', session ? '成功' : '失败');
    
    if (session) {
      console.log('会话详情:', {
        email: session.user?.email,
        name: session.user?.name,
        id: session.user?.id
      });
    }

    if (!session || !session.user) {
      console.log('用户未认证 - 返回 401');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 使用安全重试函数查询用户
    let user = null;
    if (session.user.email) {
      console.log('通过邮箱查找用户ID:', session.user.email);
      try {
        user = await findUserByEmail(session.user.email);
        console.log('用户查询结果:', user ? '找到用户' : '用户不存在', user?.id);
      } catch (userError) {
        console.error('查询用户时发生错误:', userError);
        return res.status(500).json({ 
          message: '查询用户信息失败', 
          error: userError.message,
          step: 'find_user'
        });
      }
    }

    if (!user || !user.id) {
      console.log('无法获取用户ID - 返回 401');
      return res.status(401).json({ message: 'User not found, please login again' });
    }

    const { appName, imageUrl } = req.body;

    if (!appName || !imageUrl) {
      console.log('缺少必需参数:', { 
        appName: !!appName, 
        imageUrl: !!imageUrl,
        appNameValue: appName,
        imageUrlLength: imageUrl?.length 
      });
      return res.status(400).json({ message: 'Missing appName or imageUrl' });
    }

    console.log('创建项目参数验证通过:', { 
      appName, 
      userId: user.id, 
      imageUrlLength: imageUrl.length,
      imageUrlPreview: imageUrl.substring(0, 100) + '...'
    });

    // 使用安全重试函数创建项目
    let project;
    try {
      console.log('开始创建项目...');
      project = await createProject(appName, imageUrl, user.id);
      console.log('项目创建成功:', {
        projectId: project.id,
        appName: project.appName,
        userId: project.userId,
        createdAt: project.createdAt
      });
    } catch (createError) {
      console.error('创建项目时发生错误:', {
        message: createError.message,
        code: createError.code,
        name: createError.name,
        stack: createError.stack?.substring(0, 500)
      });
      
      // 处理具体的数据库错误
      if (createError.code === 'P1001') {
        return res.status(503).json({ 
          message: '数据库连接失败，请稍后重试',
          error: createError.message,
          step: 'database_connection'
        });
      }
      
      // 处理外键约束错误
      if (createError.code === 'P2003') {
        return res.status(400).json({ 
          message: '用户不存在，请重新登录',
          error: createError.message,
          step: 'foreign_key_constraint'
        });
      }

      // 数据重复错误
      if (createError.code === '23505' || createError.code === 'P2002') {
        return res.status(409).json({ 
          message: '项目ID重复，请重试',
          error: createError.message,
          step: 'unique_constraint'
        });
      }

      // Prepared statement错误
      if (createError.code === '42P05') {
        return res.status(503).json({ 
          message: '数据库繁忙，请稍后重试',
          error: createError.message,
          step: 'prepared_statement_conflict'
        });
      }

      // 返回详细的错误信息用于调试
      return res.status(500).json({ 
        message: '保存作品失败',
        error: createError.message,
        code: createError.code,
        step: 'create_project',
        debug: process.env.NODE_ENV === 'development' ? createError.stack : undefined
      });
    }

    console.log('=== 项目创建成功 ===');

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
    console.error('=== 项目创建失败 ===');
    console.error('未捕获的错误:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 1000)
    });
    
    // 通用错误处理
    res.status(500).json({ 
      message: '保存作品失败',
      error: error.message,
      code: error.code,
      step: 'general_error',
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 