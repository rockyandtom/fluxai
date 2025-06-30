import { PrismaClient } from '@prisma/client';

// 保守的Serverless优化配置 - 遵循网站开发规范指南
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Serverless环境优化配置
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });
};

// 单例模式管理Prisma客户端，避免重复创建
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 保留原有功能的安全函数
export const safeQuery = async (operation) => {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 在重试之间添加延迟，避免并发冲突
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100 * i));
      }
      
      const result = await operation(prisma);
      return result;
    } catch (error) {
      lastError = error;
      
      // 如果是prepared statement错误，继续重试
      if (error.code === '42P05' || error.message?.includes('prepared statement')) {
        console.log(`准备语句冲突，第${i + 1}次重试...`);
        continue;
      }
      
      // 其他错误立即抛出
      throw error;
    }
  }
  
  // 所有重试都失败
  throw lastError;
};

// 连接测试函数 - 使用安全查询包装器
export const testConnection = async () => {
  try {
    await safeQuery(async (client) => {
      return await client.$queryRaw`SELECT 1 as test`;
    });
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

// 安全查询用户函数 - 保持ORM方式但增加重试
export const findUserByEmail = async (email) => {
  return await safeQuery(async (client) => {
    return await client.user.findUnique({
      where: { email: email },
      select: { 
        id: true, 
        email: true, 
        name: true,
        image: true
      }
    });
  });
};

// 安全创建项目函数 - 保持ORM方式但增加重试
export const createProject = async (appName, imageUrl, userId) => {
  return await safeQuery(async (client) => {
    return await client.project.create({
      data: {
        appName: appName,
        imageUrl: imageUrl,
        userId: userId,
      },
    });
  });
};

export default prisma; 