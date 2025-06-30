/**
 * Web数据库迁移工具 - 修复版本，避免prepared statement冲突
 * 访问: /api/debug/migrate
 * 注意: 这是一个强力工具，请谨慎使用
 */

import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      message: '请使用POST请求运行迁移' 
    });
  }

  // 安全检查
  const { password } = req.body;
  if (password !== 'migrate-tables-now') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: '需要正确的密码才能执行迁移' 
    });
  }

  // 为每次请求创建全新的Prisma实例
  const prisma = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('开始运行数据库迁移...');
    
    const migrationSteps = [];
    const tableStatus = {};
    
    // 检查和创建每个表，使用安全的方法
    
    // 1. 检查User表
    try {
      await prisma.user.count();
      tableStatus.User = '✅ User表已存在';
      migrationSteps.push('✅ User表已存在');
    } catch (error) {
      if (error.code === 'P2021') {
        tableStatus.User = '❌ User表不存在 - 需要通过Prisma CLI迁移';
        migrationSteps.push('❌ User表不存在');
      } else {
        tableStatus.User = `⚠️ User表检查失败: ${error.message}`;
        migrationSteps.push(`⚠️ User表检查失败: ${error.code}`);
      }
    }
    
    // 2. 检查Account表
    try {
      await prisma.account.count();
      tableStatus.Account = '✅ Account表已存在';
      migrationSteps.push('✅ Account表已存在');
    } catch (error) {
      if (error.code === 'P2021') {
        tableStatus.Account = '❌ Account表不存在';
        migrationSteps.push('❌ Account表不存在');
      } else {
        tableStatus.Account = `⚠️ Account表检查失败: ${error.message}`;
        migrationSteps.push(`⚠️ Account表检查失败: ${error.code}`);
      }
    }
    
    // 3. 检查Session表
    try {
      await prisma.session.count();
      tableStatus.Session = '✅ Session表已存在';
      migrationSteps.push('✅ Session表已存在');
    } catch (error) {
      if (error.code === 'P2021') {
        tableStatus.Session = '❌ Session表不存在';
        migrationSteps.push('❌ Session表不存在');
      } else {
        tableStatus.Session = `⚠️ Session表检查失败: ${error.message}`;
        migrationSteps.push(`⚠️ Session表检查失败: ${error.code}`);
      }
    }
    
    // 4. 检查VerificationToken表
    try {
      await prisma.verificationToken.count();
      tableStatus.VerificationToken = '✅ VerificationToken表已存在';
      migrationSteps.push('✅ VerificationToken表已存在');
    } catch (error) {
      if (error.code === 'P2021') {
        tableStatus.VerificationToken = '❌ VerificationToken表不存在';
        migrationSteps.push('❌ VerificationToken表不存在');
      } else {
        tableStatus.VerificationToken = `⚠️ VerificationToken表检查失败: ${error.message}`;
        migrationSteps.push(`⚠️ VerificationToken表检查失败: ${error.code}`);
      }
    }
    
    // 5. 检查Project表
    try {
      await prisma.project.count();
      tableStatus.Project = '✅ Project表已存在';
      migrationSteps.push('✅ Project表已存在');
    } catch (error) {
      if (error.code === 'P2021') {
        tableStatus.Project = '❌ Project表不存在';
        migrationSteps.push('❌ Project表不存在');
      } else {
        tableStatus.Project = `⚠️ Project表检查失败: ${error.message}`;
        migrationSteps.push(`⚠️ Project表检查失败: ${error.code}`);
      }
    }
    
    await prisma.$disconnect();
    
    // 检查是否有缺失的表
    const missingTables = Object.keys(tableStatus).filter(table => 
      tableStatus[table].includes('❌')
    );
    
    const hasMissingTables = missingTables.length > 0;
    
    res.status(200).json({
      status: hasMissingTables ? 'NEEDS_CLI_MIGRATION' : 'SUCCESS',
      message: hasMissingTables 
        ? '🔧 检测到缺失的表，需要使用Prisma CLI进行迁移' 
        : '🎉 所有表已存在，数据库结构完整！',
      migrationSteps,
      tableStatus,
      missingTables,
      recommendations: hasMissingTables ? [
        '📝 由于Vercel Serverless环境限制，无法直接创建表',
        '🛠️ 请使用以下方法之一创建表结构：',
        '',
        '方法1: 在Supabase Dashboard中手动创建表',
        '1. 登录 Supabase Dashboard',
        '2. 进入 Table Editor',
        '3. 手动创建缺失的表结构',
        '',
        '方法2: 使用本地Prisma CLI (如果网络允许)',
        '1. 设置环境变量: DATABASE_URL',
        '2. 运行: npx prisma db push',
        '',
        '方法3: 使用Supabase Migration',
        '1. 在Supabase中创建新的Migration',
        '2. 导入Prisma schema'
      ] : [
        '✅ 所有表结构完整',
        '🔄 现在可以正常使用Google登录功能',
        '📁 项目页面500错误应该已解决',
        '🗑️ 建议删除此迁移工具以确保安全'
      ],
      supabaseInstructions: hasMissingTables ? {
        step1: '登录 Supabase Dashboard: https://supabase.com/dashboard',
        step2: '选择您的项目: FluxAI-Projects',
        step3: '进入 Table Editor',
        step4: '创建以下表: ' + missingTables.join(', '),
        step5: '参考 prisma/schema.prisma 文件中的表结构'
      } : null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('迁移检查错误:', error);
    
    await prisma.$disconnect();
    
    res.status(500).json({
      status: 'ERROR',
      message: '数据库迁移检查失败',
      error: error.message,
      errorCode: error.code,
      solution: '请检查数据库连接状态，或尝试手动在Supabase中创建表',
      timestamp: new Date().toISOString()
    });
  }
} 