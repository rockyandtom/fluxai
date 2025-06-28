const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

async function initializeDatabase() {
  console.log('🔄 Initializing database for production...');
  
  try {
    const prisma = new PrismaClient();
    
    // 检查数据库连接
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // 检查用户表是否存在
    try {
      await prisma.user.findFirst();
      console.log('✅ Database tables are ready');
    } catch (error) {
      console.log('⚠️ Database tables may not exist, this is normal for first deployment');
    }
    
    await prisma.$disconnect();
    console.log('✅ Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase(); 