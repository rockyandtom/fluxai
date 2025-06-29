import bcrypt from 'bcryptjs';
import prisma from '../../prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 测试基本数据库操作
    console.log('开始测试注册流程...');
    
    // 1. 测试数据库连接
    await prisma.$connect();
    console.log('✓ 数据库连接成功');
    
    // 2. 测试用户查询
    const testEmail = 'test@example.com';
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    console.log('✓ 用户查询成功:', existingUser ? '用户存在' : '用户不存在');
    
    // 3. 测试密码加密
    const testPassword = 'testpassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    console.log('✓ 密码加密成功');
    
    // 4. 如果测试用户不存在，尝试创建
    let testUser = existingUser;
    if (!existingUser) {
      try {
                 testUser = await prisma.user.create({
           data: {
             email: testEmail,
             password: hashedPassword,
           },
           select: {
             id: true,
             email: true,
           }
         });
        console.log('✓ 测试用户创建成功');
      } catch (createError) {
        console.error('✗ 测试用户创建失败:', createError);
        throw createError;
      }
    }
    
    // 5. 环境变量检查
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      AUTH_ENVIRONMENT: process.env.AUTH_ENVIRONMENT,
      DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置',
    };
    
    return res.status(200).json({
      status: '注册功能测试成功',
      tests: {
        database_connection: '成功',
        user_query: '成功',
        password_hashing: '成功',
        user_creation: testUser ? '成功' : '跳过（用户已存在）',
      },
      testUser: testUser,
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('注册功能测试失败:', error);
    
    return res.status(500).json({
      status: '测试失败',
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AUTH_ENVIRONMENT: process.env.AUTH_ENVIRONMENT,
      }
    });
  } finally {
    await prisma.$disconnect();
  }
} 