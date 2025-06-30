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
    // 添加更严格的连接池配置，防止 prepared statement 冲突
    engineType: 'binary',
  });
};

// 单例模式管理Prisma客户端，避免重复创建
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 改进的安全查询函数，增强重试机制
export const safeQuery = async (operation) => {
  const maxRetries = 5; // 增加重试次数
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 在重试之间添加指数退避延迟
      if (i > 0) {
        const delay = Math.min(100 * Math.pow(2, i - 1), 1000); // 100ms, 200ms, 400ms, 800ms, 1000ms
        console.log(`重试第${i}次，等待${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await operation(prisma);
      
      // 如果之前有错误但这次成功了，记录恢复信息
      if (i > 0) {
        console.log(`数据库操作在第${i + 1}次尝试时成功`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      console.error(`数据库操作失败 (尝试 ${i + 1}/${maxRetries}):`, {
        code: error.code,
        message: error.message.substring(0, 200)
      });
      
      // 特定错误处理：prepared statement 冲突
      if (error.code === '42P05' || error.message?.includes('prepared statement')) {
        console.log(`检测到 prepared statement 冲突，第${i + 1}次重试...`);
        continue;
      }
      
      // 特定错误处理：连接池满
      if (error.code === 'P1001' || error.message?.includes('timed out')) {
        console.log(`检测到连接超时，第${i + 1}次重试...`);
        continue;
      }
      
      // 特定错误处理：其他可重试的数据库错误
      if (error.code === 'P2024' || error.code === 'P2028') {
        console.log(`检测到可重试的数据库错误，第${i + 1}次重试...`);
        continue;
      }
      
      // 对于非可重试错误，立即抛出
      if (error.code === 'P2002' || error.code === 'P2003' || error.code === 'P2025') {
        console.error('检测到不可重试的数据库错误，立即抛出:', error.code);
        throw error;
      }
      
      // 如果是最后一次重试，抛出错误
      if (i === maxRetries - 1) {
        console.error('所有重试尝试都失败，抛出最后的错误');
        break;
      }
    }
  }
  
  // 所有重试都失败，抛出最后的错误
  throw lastError;
};

// 连接测试函数 - 使用改进的安全查询包装器
export const testConnection = async () => {
  try {
    console.log('开始数据库连接测试...');
    
    // 使用最简单的查询来测试连接
    await safeQuery(async (client) => {
      // 使用更简单的查询避免复杂的 prepared statement
      return await client.$executeRaw`SELECT 1`;
    });
    
    console.log('数据库连接测试成功');
    return { success: true, message: '数据库连接正常' };
  } catch (error) {
    console.error('Database connection test failed:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
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
  console.log('查询用户邮箱:', email);
  
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
  console.log('创建项目:', { appName, userId, imageUrlLength: imageUrl?.length });
  
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

// 安全查询用户项目函数
export const findUserProjects = async (userId) => {
  console.log('查询用户项目:', userId);
  
  return await safeQuery(async (client) => {
    return await client.project.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        appName: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true
      }
    });
  });
};

// 改进的断开连接函数
export const disconnect = async () => {
  try {
    await prisma.$disconnect();
    console.log('Prisma 客户端已安全断开连接');
  } catch (error) {
    console.error('断开 Prisma 连接时出错:', error);
  }
};

export default prisma; 