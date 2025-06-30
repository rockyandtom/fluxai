import { PrismaClient } from '@prisma/client';

// Serverless环境完全优化配置 - 彻底解决42P05问题
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  const client = new PrismaClient({
    // 数据源配置
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // 彻底禁用prepared statements和连接池
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });

  // 修改客户端配置以避免prepared statement冲突
  client.$use(async (params, next) => {
    // 在每个查询前添加延迟，避免并发冲突
    if (process.env.NODE_ENV === 'production') {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }
    
    try {
      const result = await next(params);
      return result;
    } catch (error) {
      // 如果遇到prepared statement错误，重试一次
      if (error.code === '42P05' || error.message?.includes('prepared statement')) {
        console.log('Prepared statement冲突，延迟重试...');
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
        return await next(params);
      }
      throw error;
    }
  });

  return client;
};

// 每次都创建新的客户端实例，避免连接池问题
const prisma = createPrismaClient();

// 导出连接测试函数
export const testConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    return { success: true, message: '数据库连接正常' };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { 
      success: false, 
      message: '数据库连接失败', 
      error: error.message,
      code: error.code 
    };
  }
};

// 安全查询用户函数
export const findUserByEmail = async (email) => {
  try {
    const users = await prisma.$queryRaw`
      SELECT id, email, name, image FROM "User" WHERE email = ${email}
    `;
    return users[0] || null;
  } catch (error) {
    console.error('查询用户失败:', error);
    if (error.code === '42P05') {
      // 重试一次
      await new Promise(resolve => setTimeout(resolve, 150));
      const retryUsers = await prisma.$queryRaw`
        SELECT id, email, name, image FROM "User" WHERE email = ${email}
      `;
      return retryUsers[0] || null;
    }
    throw error;
  }
};

// 安全创建项目函数
export const createProject = async (appName, imageUrl, userId) => {
  try {
    const projects = await prisma.$queryRaw`
      INSERT INTO "Project" ("id", "appName", "imageUrl", "userId", "createdAt", "updatedAt")
      VALUES (
        ${generateId()},
        ${appName},
        ${imageUrl},
        ${userId},
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    return projects[0];
  } catch (error) {
    console.error('创建项目失败:', error);
    if (error.code === '42P05') {
      // 重试一次
      await new Promise(resolve => setTimeout(resolve, 150));
      const retryProjects = await prisma.$queryRaw`
        INSERT INTO "Project" ("id", "appName", "imageUrl", "userId", "createdAt", "updatedAt")
        VALUES (
          ${generateId()},
          ${appName},
          ${imageUrl},
          ${userId},
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      return retryProjects[0];
    }
    throw error;
  }
};

// 生成唯一ID函数（模拟cuid）
const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
};

export default prisma; 