/**
 * 直连Supabase测试 - 尝试不同的主机和端口配置
 * 访问: /api/debug/supabase-direct
 */

import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = [];
  const basePassword = 'G&Wk@5z_E$JUXfZ';
  const encodedPassword = 'G%26Wk%405z_E%24JUXfZ';
  
  // 尝试不同的Supabase连接配置
  const connectionConfigs = [
    // 传统直连（5432端口）
    {
      name: '直连5432端口',
      url: `postgresql://postgres:${encodedPassword}@db.ebgbcljfpcfqbasyyivd.supabase.co:5432/postgres`
    },
    // 连接池（6543端口）
    {
      name: '连接池6543端口',
      url: `postgresql://postgres:${encodedPassword}@db.ebgbcljfpcfqbasyyivd.supabase.co:6543/postgres`
    },
    // AWS连接池格式
    {
      name: 'AWS连接池格式',
      url: `postgresql://postgres.ebgbcljfpcfqbasyyivd:${basePassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    },
    // 备选AWS区域
    {
      name: 'AWS连接池-us-west',
      url: `postgresql://postgres.ebgbcljfpcfqbasyyivd:${basePassword}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`
    },
    // 另一种可能的格式
    {
      name: '项目特定格式',
      url: `postgresql://postgres:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
    }
  ];

  for (const config of connectionConfigs) {
    try {
      console.log(`测试 ${config.name}...`);
      
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: config.url
          }
        }
      });
      
      // 尝试连接测试
      await prisma.$queryRaw`SELECT current_database(), version()`;
      
      results.push({
        name: config.name,
        status: 'SUCCESS',
        message: '连接成功！',
        url: config.url.replace(/:([^@]+)@/, ':***@')
      });
      
      await prisma.$disconnect();
      break; // 找到可用连接就停止
      
    } catch (error) {
      results.push({
        name: config.name,
        status: 'ERROR',
        message: error.message.substring(0, 200), // 截断长错误消息
        url: config.url.replace(/:([^@]+)@/, ':***@')
      });
    }
  }

  res.status(200).json({
    message: 'Supabase连接测试完成',
    results,
    recommendations: results.find(r => r.status === 'SUCCESS') 
      ? '找到可用连接！请使用成功的连接字符串更新DATABASE_URL环境变量。'
      : '所有连接都失败了。请检查Supabase项目状态和连接信息。',
    timestamp: new Date().toISOString()
  });
} 