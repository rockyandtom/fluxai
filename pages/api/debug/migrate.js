/**
 * Web数据库迁移工具 - 在Vercel环境中运行
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

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('开始运行数据库迁移...');
    
    // 步骤1: 检查当前数据库状态
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('当前表:', tables);
    
    // 步骤2: 创建所有必要的表
    const migrationSteps = [];
    
    try {
      // 创建User表
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          id TEXT NOT NULL PRIMARY KEY,
          name TEXT,
          email TEXT NOT NULL UNIQUE,
          "emailVerified" TIMESTAMP(3),
          image TEXT
        );
      `);
      migrationSteps.push('✅ User表创建成功');
      
      // 创建Account表
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Account" (
          id TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" 
        ON "Account"(provider, "providerAccountId");
      `);
      migrationSteps.push('✅ Account表创建成功');
      
      // 创建Session表
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Session" (
          id TEXT NOT NULL PRIMARY KEY,
          "sessionToken" TEXT NOT NULL UNIQUE,
          "userId" TEXT NOT NULL,
          expires TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      migrationSteps.push('✅ Session表创建成功');
      
      // 创建VerificationToken表
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "VerificationToken" (
          identifier TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires TIMESTAMP(3) NOT NULL
        );
      `);
      
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" 
        ON "VerificationToken"(identifier, token);
      `);
      migrationSteps.push('✅ VerificationToken表创建成功');
      
      // 创建Project表
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Project" (
          id TEXT NOT NULL PRIMARY KEY,
          "appName" TEXT NOT NULL,
          "imageUrl" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT NOT NULL,
          CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      migrationSteps.push('✅ Project表创建成功');
      
    } catch (error) {
      migrationSteps.push(`❌ 迁移步骤失败: ${error.message}`);
    }
    
    // 步骤3: 验证迁移结果
    const finalTables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    // 检查数据
    const userCount = await prisma.user.count().catch(() => 0);
    const projectCount = await prisma.project.count().catch(() => 0);
    
    await prisma.$disconnect();
    
    res.status(200).json({
      status: 'SUCCESS',
      message: '🎉 数据库迁移完成！',
      migrationSteps,
      beforeTables: tables.map(t => t.table_name),
      afterTables: finalTables.map(t => t.table_name),
      verification: {
        userCount,
        projectCount,
        tablesCreated: finalTables.length
      },
      nextSteps: [
        '✅ 数据库表结构已创建',
        '🔄 请重新测试Google登录功能',
        '📁 请重新测试项目页面',
        '🗑️ 建议删除此迁移API以确保安全'
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('迁移错误:', error);
    
    await prisma.$disconnect();
    
    res.status(500).json({
      status: 'ERROR',
      message: '数据库迁移失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 