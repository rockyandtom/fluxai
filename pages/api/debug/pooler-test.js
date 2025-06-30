/**
 * Transaction pooler连接测试 - ap-southeast-1区域
 * 访问: /api/debug/pooler-test
 */

import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 正确的Transaction pooler连接字符串 - ap-southeast-1区域
  const poolerUrl = 'postgresql://postgres.ebgbcljfpcfqbasyyivd:G%26Wk%405z_E%24JUXfZ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';
  
  try {
    console.log('测试Transaction pooler连接 (ap-southeast-1)...');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: poolerUrl
        }
      }
    });
    
    // 测试基本连接
    const result = await prisma.$queryRaw`SELECT current_database(), version(), now()`;
    
    // 测试是否能查询用户表（如果存在）
    let tableExists = false;
    let tableInfo = null;
    try {
      const userCount = await prisma.user.count();
      tableExists = true;
      tableInfo = { userCount };
    } catch (error) {
      if (error.code === 'P2021') {
        tableExists = false; // 表不存在，需要迁移
      } else {
        throw error; // 其他错误重新抛出
      }
    }
    
    await prisma.$disconnect();
    
    res.status(200).json({
      status: 'SUCCESS',
      message: 'Transaction pooler连接成功！🎉',
      connectionType: 'Transaction Pooler (ap-southeast-1)',
      region: 'ap-southeast-1',
      databaseInfo: result[0],
      userTableExists: tableExists,
      tableInfo,
      nextSteps: tableExists 
        ? [
            '✅ 数据库表已存在',
            '🔄 请在Vercel中更新DATABASE_URL环境变量',
            '🚀 重新部署后Google登录功能将正常工作'
          ]
        : [
            '📝 需要运行数据库迁移来创建表结构',
            '🔄 请在Vercel中更新DATABASE_URL环境变量',
            '💻 在本地运行: npx prisma migrate deploy'
          ],
      correctDatabaseUrl: 'postgresql://postgres.ebgbcljfpcfqbasyyivd:G%26Wk%405z_E%24JUXfZ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Transaction pooler连接错误:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Transaction pooler连接失败',
      error: error.message,
      errorCode: error.code,
      recommendations: [
        '确认Supabase项目状态正常',
        '检查ap-southeast-1区域连接',
        '验证密码是否正确',
        '确认网络连接到亚太地区'
      ],
      timestamp: new Date().toISOString()
    });
  }
} 