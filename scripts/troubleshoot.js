const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// 故障排除配置
const troubleshoot = {
  async checkEnvironmentVariables() {
    console.log(chalk.blue('\n=== 环境变量检查 ===\n'));
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'RUNNINGHUB_API_URL',
      'RUNNINGHUB_API_KEY'
    ];
    
    const optionalVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'AUTH_ENVIRONMENT',
      'GLOBAL_AGENT_HTTP_PROXY'
    ];
    
    const issues = [];
    
    // 检查必需的环境变量
    console.log(chalk.yellow('必需的环境变量:'));
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      const status = value ? chalk.green('✓ 已设置') : chalk.red('✗ 未设置');
      console.log(`  ${varName}: ${status}`);
      if (!value) {
        issues.push(`缺少必需的环境变量: ${varName}`);
      }
    });
    
    // 检查可选的环境变量
    console.log(chalk.yellow('\n可选的环境变量:'));
    optionalVars.forEach(varName => {
      const value = process.env[varName];
      const status = value ? chalk.green('✓ 已设置') : chalk.gray('- 未设置');
      console.log(`  ${varName}: ${status}`);
    });
    
    return issues;
  },
  
  async checkDatabaseConnection() {
    console.log(chalk.blue('\n=== 数据库连接检查 ===\n'));
    
    try {
      // Test database connection
      await prisma.$connect();
      console.log(chalk.green('✓ 数据库连接成功'));
      
      // Check if tables exist
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      
      console.log(chalk.green(`✓ 用户表存在，共 ${userCount} 条记录`));
      console.log(chalk.green(`✓ 项目表存在，共 ${projectCount} 条记录`));
      
      return [];
    } catch (error) {
      console.log(chalk.red('✗ 数据库连接失败'));
      console.log(chalk.red(`错误信息: ${error.message}`));
      
      const issues = ['数据库连接失败'];
      
      if (error.code === 'P1001') {
        issues.push('数据库服务器无法访问，请检查 DATABASE_URL 配置');
      } else if (error.message.includes('does not exist')) {
        issues.push('数据库表不存在，请运行数据库迁移');
      }
      
      return issues;
    } finally {
      await prisma.$disconnect();
    }
  },
  
  async checkNextAuthConfiguration() {
    console.log(chalk.blue('\n=== NextAuth 配置检查 ===\n'));
    
    const issues = [];
    
    // Check NEXTAUTH_SECRET
    if (!process.env.NEXTAUTH_SECRET) {
      issues.push('NEXTAUTH_SECRET 未设置');
      console.log(chalk.red('✗ NEXTAUTH_SECRET 未设置'));
    } else if (process.env.NEXTAUTH_SECRET.length < 32) {
      issues.push('NEXTAUTH_SECRET 太短，建议至少32个字符');
      console.log(chalk.yellow('⚠ NEXTAUTH_SECRET 太短，建议至少32个字符'));
    } else {
      console.log(chalk.green('✓ NEXTAUTH_SECRET 配置正确'));
    }
    
    // Check NEXTAUTH_URL
    if (!process.env.NEXTAUTH_URL) {
      issues.push('NEXTAUTH_URL 未设置');
      console.log(chalk.red('✗ NEXTAUTH_URL 未设置'));
    } else {
      console.log(chalk.green(`✓ NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`));
    }
    
    // Check Google OAuth (optional)
    const hasGoogleId = !!process.env.GOOGLE_CLIENT_ID;
    const hasGoogleSecret = !!process.env.GOOGLE_CLIENT_SECRET;
    
    if (hasGoogleId && hasGoogleSecret) {
      console.log(chalk.green('✓ Google OAuth 配置完整'));
    } else if (hasGoogleId || hasGoogleSecret) {
      issues.push('Google OAuth 配置不完整');
      console.log(chalk.yellow('⚠ Google OAuth 配置不完整'));
    } else {
      console.log(chalk.gray('- Google OAuth 未配置（将使用邮箱密码登录）'));
    }
    
    return issues;
  },
  
  async checkFilePermissions() {
    console.log(chalk.blue('\n=== 文件权限检查 ===\n'));
    
    const issues = [];
    const files = [
      '.env.local',
      'prisma/dev.db',
      'prisma/schema.prisma'
    ];
    
    files.forEach(file => {
      try {
        const fullPath = path.resolve(file);
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          console.log(chalk.green(`✓ ${file} 存在并可访问`));
        } else {
          console.log(chalk.yellow(`⚠ ${file} 不存在`));
          if (file === '.env.local') {
            issues.push('缺少 .env.local 文件');
          }
        }
      } catch (error) {
        console.log(chalk.red(`✗ ${file} 访问失败: ${error.message}`));
        issues.push(`文件访问问题: ${file}`);
      }
    });
    
    return issues;
  },
  
  generateReport(allIssues) {
    console.log(chalk.blue('\n=== 故障排除报告 ===\n'));
    
    if (allIssues.length === 0) {
      console.log(chalk.green('🎉 所有检查都通过了！系统配置正常。'));
      return;
    }
    
    console.log(chalk.red(`发现 ${allIssues.length} 个问题:\n`));
    
    allIssues.forEach((issue, index) => {
      console.log(chalk.red(`${index + 1}. ${issue}`));
    });
    
    console.log(chalk.yellow('\n解决建议:'));
    console.log('1. 确保 .env.local 文件存在且包含所有必需的环境变量');
    console.log('2. 检查数据库文件路径和权限');
    console.log('3. 运行 npm run prisma:migrate 确保数据库表结构正确');
    console.log('4. 在生产环境中，确保所有环境变量都在 Vercel 后台配置');
    console.log('5. 检查防火墙和网络连接');
  }
};

// 主函数
async function main() {
  console.log(chalk.green('🔍 开始故障排除...\n'));
  
  const allIssues = [];
  
  try {
    // 运行所有检查
    const envIssues = await troubleshoot.checkEnvironmentVariables();
    const dbIssues = await troubleshoot.checkDatabaseConnection();
    const authIssues = await troubleshoot.checkNextAuthConfiguration();
    const fileIssues = await troubleshoot.checkFilePermissions();
    
    allIssues.push(...envIssues, ...dbIssues, ...authIssues, ...fileIssues);
    
    // 生成报告
    troubleshoot.generateReport(allIssues);
    
  } catch (error) {
    console.error(chalk.red('故障排除过程中发生错误:'), error.message);
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = troubleshoot; 