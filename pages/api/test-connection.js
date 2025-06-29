import prisma from '../../prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 测试简单查询
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    
    // 检查环境变量
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      AUTH_ENVIRONMENT: process.env.AUTH_ENVIRONMENT,
      DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    return res.status(200).json({
      status: '连接成功',
      database: {
        userCount,
        projectCount
      },
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('数据库连接测试失败:', error);
    
    return res.status(500).json({
      status: '连接失败',
      error: error.message,
      code: error.code,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AUTH_ENVIRONMENT: process.env.AUTH_ENVIRONMENT,
        DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
      }
    });
  } finally {
    await prisma.$disconnect();
  }
} 