/**
 * 测试不同数据库连接字符串格式
 * 访问: /api/debug/connection-test
 */

import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = [];
  
  // 测试不同的连接字符串格式
  const connectionStrings = [
    // 原始格式
    process.env.DATABASE_URL,
    
    // 手动构建的格式1（引号包围密码）
    'postgresql://postgres:"G&Wk@5z_E$JUXfZ"@db.ebgbcljfpcfqbasyyivd.supabase.co:5432/postgres',
    
    // 手动构建的格式2（不同的URL编码）
    'postgresql://postgres:G\\&Wk\\@5z_E\\$JUXfZ@db.ebgbcljfpcfqbasyyivd.supabase.co:5432/postgres',
    
    // 手动构建的格式3（原始密码）
    'postgresql://postgres:G&Wk@5z_E$JUXfZ@db.ebgbcljfpcfqbasyyivd.supabase.co:5432/postgres'
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    const connStr = connectionStrings[i];
    if (!connStr) continue;
    
    try {
      console.log(`测试连接字符串 ${i + 1}:`, connStr.replace(/:([^@]+)@/, ':***@'));
      
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: connStr
          }
        }
      });
      
      // 尝试简单的查询
      await prisma.$queryRaw`SELECT 1 as test`;
      
      results.push({
        index: i + 1,
        status: 'SUCCESS',
        message: '连接成功',
        connectionString: connStr.replace(/:([^@]+)@/, ':***@')
      });
      
      await prisma.$disconnect();
      break; // 找到可用的连接就停止
      
    } catch (error) {
      results.push({
        index: i + 1,
        status: 'ERROR',
        message: error.message,
        connectionString: connStr.replace(/:([^@]+)@/, ':***@')
      });
    }
  }

  res.status(200).json({
    message: '数据库连接测试完成',
    results,
    timestamp: new Date().toISOString()
  });
} 