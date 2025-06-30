import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { findUserByEmail, findProjectById, deleteProject } from '../../../prisma/client';

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
    console.log('=== 项目删除开始 ===');
    console.log('请求方法:', req.method);
    console.log('请求体:', JSON.stringify(req.body));

    const session = await getServerSession(req, res, authOptions);
    console.log('删除项目 - 获取会话信息:', session ? '成功' : '失败');
    
    if (session) {
      console.log('会话详情:', {
        email: session.user?.email,
        name: session.user?.name,
        id: session.user?.id
      });
    }

    if (!session || !session.user) {
      console.log('用户未认证 - 返回 401');
      return res.status(401).json({ error: 'Unauthorized' });
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
          error: '查询用户信息失败', 
          message: userError.message,
          step: 'find_user'
        });
      }
    }

    if (!user || !user.id) {
      console.log('无法获取用户ID - 返回 401');
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { id: projectId } = req.body;
    if (!projectId) {
      console.log('缺少项目ID参数');
      return res.status(400).json({ error: 'Project ID is required' });
    }

    console.log('删除项目验证:', { projectId, userId: user.id });

    // 使用安全重试函数验证项目
    let project;
    try {
      console.log('验证项目是否存在且属于当前用户...');
      project = await findProjectById(projectId);
    } catch (findError) {
      console.error('查找项目时发生错误:', findError);
      return res.status(500).json({ 
        error: '查找项目失败', 
        message: findError.message,
        step: 'find_project'
      });
    }

    if (!project) {
      console.log('项目不存在');
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.userId !== user.id) {
      console.log('项目不属于当前用户:', { projectUserId: project.userId, currentUserId: user.id });
      return res.status(403).json({ error: 'Forbidden: You can only delete your own projects' });
    }

    console.log('项目验证通过，开始删除:', { projectName: project.appName });

    // 使用安全重试函数执行删除
    try {
      await deleteProject(projectId);
      console.log('项目删除成功:', project.appName);
      
      res.status(200).json({ 
        success: true, 
        message: 'Project deleted successfully',
        deletedProject: {
          id: project.id,
          appName: project.appName
        }
      });
    } catch (deleteError) {
      console.error('删除项目时发生错误:', {
        message: deleteError.message,
        code: deleteError.code,
        name: deleteError.name
      });
      
      // 处理特定的删除错误
      if (deleteError.code === 'P2025') {
        return res.status(404).json({ 
          error: 'Project not found',
          message: '项目可能已被删除',
          step: 'delete_project_not_found'
        });
      }
      
      if (deleteError.code === 'P1001') {
        return res.status(503).json({ 
          error: '数据库连接失败，请稍后重试',
          message: deleteError.message,
          step: 'delete_database_connection'
        });
      }
      
      if (deleteError.code === '42P05') {
        return res.status(503).json({ 
          error: '数据库繁忙，请稍后重试',
          message: deleteError.message,
          step: 'delete_prepared_statement_conflict'
        });
      }
      
      return res.status(500).json({ 
        error: '删除项目失败',
        message: deleteError.message,
        code: deleteError.code,
        step: 'delete_project_execution',
        debug: process.env.NODE_ENV === 'development' ? deleteError.stack : undefined
      });
    }

    console.log('=== 项目删除成功 ===');

  } catch (error) {
    console.error('=== 项目删除失败 ===');
    console.error('未捕获的错误:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 1000)
    });
    
    res.status(500).json({ 
      error: '删除项目失败',
      message: error.message,
      code: error.code,
      step: 'general_delete_error',
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 