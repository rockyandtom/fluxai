/**
 * 检查所有必要的数据库表
 * 访问: /api/debug/tables-check
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('检查数据库表结构...');
    
    // 检查所有表
    const tables = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    
    // 按表分组
    const tableStructure = {};
    tables.forEach(row => {
      if (!tableStructure[row.table_name]) {
        tableStructure[row.table_name] = [];
      }
      tableStructure[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES'
      });
    });
    
    // 检查必需的表
    const requiredTables = ['User', 'Account', 'Session', 'VerificationToken', 'Project'];
    const missingTables = [];
    const existingTables = [];
    
    requiredTables.forEach(tableName => {
      if (tableStructure[tableName]) {
        existingTables.push(tableName);
      } else {
        missingTables.push(tableName);
      }
    });
    
    // 检查数据
    const tableData = {};
    for (const table of existingTables) {
      try {
        if (table === 'User') {
          tableData.User = await prisma.user.count();
        } else if (table === 'Project') {
          tableData.Project = await prisma.project.count();
        } else if (table === 'Account') {
          tableData.Account = await prisma.account.count();
        } else if (table === 'Session') {
          tableData.Session = await prisma.session.count();
        }
      } catch (error) {
        tableData[table] = `Error: ${error.message}`;
      }
    }
    
    await prisma.$disconnect();
    
    res.status(200).json({
      status: missingTables.length === 0 ? 'SUCCESS' : 'INCOMPLETE',
      message: missingTables.length === 0 
        ? '所有必需的表都存在！' 
        : `缺少 ${missingTables.length} 个表`,
      existingTables,
      missingTables,
      tableStructure,
      tableData,
      recommendations: missingTables.length > 0 
        ? [
            '运行数据库迁移创建缺失的表',
            '命令: npx prisma migrate deploy',
            '或者: npx prisma db push'
          ]
        : [
            '所有表结构完整',
            '检查项目页面代码逻辑',
            '查看Vercel部署日志获取具体错误'
          ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('表结构检查错误:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: '表结构检查失败',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 