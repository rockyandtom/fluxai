import { PrismaClient } from '@prisma/client';

// Serverless环境优化配置
const globalForPrisma = globalThis;

const createPrismaClient = () => {
  return new PrismaClient({
    // Serverless环境优化
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // 关闭prepared statements以避免42P05错误
    __internal: {
      engine: {
        endpoint: undefined,
      },
    },
    // 连接池配置
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// 单例模式管理Prisma客户端
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 优雅关闭函数
export const disconnectPrisma = async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Prisma disconnect error:', error);
  }
};

// 健康检查函数
export const testConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export default prisma; 