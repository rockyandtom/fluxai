/**
 * 检查所有必要的数据库表 - Serverless安全版本
 * 访问: /api/debug/tables-check
 */

import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 创建新的Prisma实例，避免连接复用问题
  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    console.log('检查数据库表结构...');
    
    // 检查必需的表通过尝试查询
    const tableResults = {};
    const requiredTables = ['User', 'Account', 'Session', 'VerificationToken', 'Project'];
    const existingTables = [];
    const missingTables = [];
    
    // 逐个检查表是否存在
    for (const tableName of requiredTables) {
      try {
        switch (tableName) {
          case 'User':
            const userCount = await prisma.user.count();
            tableResults.User = { exists: true, count: userCount };
            existingTables.push('User');
            break;
            
          case 'Account':
            const accountCount = await prisma.account.count();
            tableResults.Account = { exists: true, count: accountCount };
            existingTables.push('Account');
            break;
            
          case 'Session':
            const sessionCount = await prisma.session.count();
            tableResults.Session = { exists: true, count: sessionCount };
            existingTables.push('Session');
            break;
            
          case 'VerificationToken':
            const tokenCount = await prisma.verificationToken.count();
            tableResults.VerificationToken = { exists: true, count: tokenCount };
            existingTables.push('VerificationToken');
            break;
            
          case 'Project':
            const projectCount = await prisma.project.count();
            tableResults.Project = { exists: true, count: projectCount };
            existingTables.push('Project');
            break;
        }
      } catch (error) {
        console.log(`表 ${tableName} 检查失败:`, error.code);
        
        if (error.code === 'P2021') {
          // 表不存在
          tableResults[tableName] = { exists: false, error: 'Table does not exist' };
          missingTables.push(tableName);
        } else {
          // 其他错误
          tableResults[tableName] = { exists: false, error: error.message };
          missingTables.push(tableName);
        }
      }
    }
    
    // 检查用户数据（如果User表存在）
    let userData = null;
    if (existingTables.includes('User')) {
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
          take: 5 // 只取前5个用户
        });
        userData = users;
      } catch (error) {
        userData = { error: error.message };
      }
    }
    
    await prisma.$disconnect();
    
    const isComplete = missingTables.length === 0;
    
    res.status(200).json({
      status: isComplete ? 'SUCCESS' : 'INCOMPLETE',
      message: isComplete 
        ? '✅ 所有必需的表都存在！' 
        : `❌ 缺少 ${missingTables.length} 个表`,
      summary: {
        total: requiredTables.length,
        existing: existingTables.length,
        missing: missingTables.length
      },
      existingTables,
      missingTables,
      tableResults,
      userData,
      diagnosis: {
        googleLogin: existingTables.includes('User') && existingTables.includes('Account'),
        projectStorage: existingTables.includes('Project'),
        needsMigration: missingTables.length > 0
      },
      recommendations: missingTables.length > 0 
        ? [
            `🔧 需要运行数据库迁移创建缺失的表: [${missingTables.join(', ')}]`,
            '📝 在本地运行: npx prisma migrate deploy',
            '🔄 或者运行: npx prisma db push --accept-data-loss'
          ]
        : [
            '✅ 所有表结构完整',
            '🔍 项目页面500错误可能是代码逻辑问题',
            '📋 检查Vercel部署日志获取具体错误信息'
          ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('表结构检查错误:', error);
    
    await prisma.$disconnect();
    
    res.status(500).json({
      status: 'ERROR',
      message: '表结构检查失败',
      error: error.message,
      errorCode: error.code,
      solution: 'Prisma连接问题，请检查数据库连接状态',
      timestamp: new Date().toISOString()
    });
  }
} 