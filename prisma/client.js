import { PrismaClient } from '@prisma/client';

// 保守的Serverless优化配置 - 遵循网站开发规范指南
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  console.log('创建新的 Prisma 客户端实例');
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

// 改进的安全查询函数，增强重试机制
export const safeQuery = async (operation) => {
  const maxRetries = 5; // 增加重试次数
  let lastError;

  console.log(`开始执行安全查询，最大重试次数: ${maxRetries}`);

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 在重试之间添加指数退避延迟
      if (i > 0) {
        const delay = Math.min(100 * Math.pow(2, i - 1), 1000); // 100ms, 200ms, 400ms, 800ms, 1000ms
        console.log(`重试第${i}次，等待${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      console.log(`执行数据库操作 (尝试 ${i + 1}/${maxRetries})`);
      const result = await operation(prisma);
      
      // 如果之前有错误但这次成功了，记录恢复信息
      if (i > 0) {
        console.log(`数据库操作在第${i + 1}次尝试时成功`);
      } else {
        console.log('数据库操作第一次尝试就成功');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      console.error(`数据库操作失败 (尝试 ${i + 1}/${maxRetries}):`, {
        code: error.code,
        message: error.message.substring(0, 200),
        name: error.name
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
  console.error('SafeQuery 失败，所有重试都用尽:', {
    finalError: lastError.message,
    code: lastError.code
  });
  throw lastError;
};

// 连接测试函数 - 使用改进的安全查询包装器
export const testConnection = async () => {
  try {
    console.log('开始数据库连接测试...');
    
    // 使用最简单的查询来测试连接
    await safeQuery(async (client) => {
      console.log('执行连接测试查询: SELECT 1');
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
  console.log('=== 开始查询用户 ===');
  console.log('查询用户邮箱:', email);
  
  try {
    const result = await safeQuery(async (client) => {
      console.log('执行用户查询 SQL');
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
    
    console.log('用户查询完成:', result ? '找到用户' : '未找到用户', result?.id);
    return result;
  } catch (error) {
    console.error('查询用户失败:', error);
    throw error;
  }
};

// 安全创建项目函数 - 保持ORM方式但增加重试
export const createProject = async (appName, imageUrl, userId) => {
  console.log('=== 开始创建项目 ===');
  console.log('创建项目参数:', { 
    appName, 
    userId, 
    imageUrlLength: imageUrl?.length,
    imageUrlType: typeof imageUrl
  });
  
  try {
    const result = await safeQuery(async (client) => {
      console.log('执行项目创建 SQL');
      return await client.project.create({
        data: {
          appName: appName,
          imageUrl: imageUrl,
          userId: userId,
        },
      });
    });
    
    console.log('项目创建完成:', {
      id: result.id,
      appName: result.appName,
      userId: result.userId
    });
    return result;
  } catch (error) {
    console.error('创建项目失败:', error);
    throw error;
  }
};

// 安全查询用户项目函数
export const findUserProjects = async (userId) => {
  console.log('=== 开始查询用户项目 ===');
  console.log('查询用户项目, userId:', userId);
  
  try {
    const result = await safeQuery(async (client) => {
      console.log('执行项目查询 SQL');
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
    
    console.log(`项目查询完成，找到 ${result.length} 个项目`);
    return result;
  } catch (error) {
    console.error('查询项目失败:', error);
    throw error;
  }
};

// 改进的断开连接函数
export const disconnect = async () => {
  try {
    console.log('断开 Prisma 连接...');
    await prisma.$disconnect();
    console.log('Prisma 客户端已安全断开连接');
  } catch (error) {
    console.error('断开 Prisma 连接时出错:', error);
  }
};

export default prisma; 