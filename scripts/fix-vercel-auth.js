#!/usr/bin/env node

/**
 * Vercel 认证问题修复脚本
 * 用于诊断和修复 Vercel 部署中的认证相关问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel 认证问题修复工具\n');

// 检查当前项目配置
function checkProjectConfiguration() {
  console.log('📋 检查项目配置...\n');
  
  // 检查 Prisma schema
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    if (schemaContent.includes('provider = "sqlite"')) {
      console.log('✅ Prisma schema 配置为 SQLite');
    } else if (schemaContent.includes('provider = "postgresql"')) {
      console.log('⚠️  Prisma schema 配置为 PostgreSQL');
      console.log('   如果您在 Vercel 上使用 SQLite，这可能导致问题');
    }
  }
  
  // 检查 NextAuth 配置
  const nextAuthPath = path.join(__dirname, '..', 'pages', 'api', 'auth', '[...nextauth].js');
  if (fs.existsSync(nextAuthPath)) {
    console.log('✅ NextAuth 配置文件存在');
  }
  
  console.log('');
}

// 生成 Vercel 环境变量配置指南
function generateVercelEnvGuide() {
  console.log('📝 Vercel 环境变量配置指南\n');
  
  const envVars = [
    {
      name: 'NEXTAUTH_SECRET',
      description: 'NextAuth JWT 加密密钥',
      example: '使用 openssl rand -base64 32 生成',
      required: true
    },
    {
      name: 'NEXTAUTH_URL',
      description: 'NextAuth 基础URL（您的 Vercel 域名）',
      example: 'https://your-app.vercel.app',
      required: true
    },
    {
      name: 'DATABASE_URL',
      description: '数据库连接URL',
      example: 'file:./dev.db （对于 SQLite）',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      description: 'Google OAuth 客户端ID',
      example: 'your-google-client-id.googleusercontent.com',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      description: 'Google OAuth 客户端密钥',
      example: 'GOCSPX-your-google-client-secret',
      required: true
    },
    {
      name: 'AUTH_ENVIRONMENT',
      description: '认证环境配置',
      example: 'production_sqlite（仅Google登录）或 production_postgresql（完整功能）',
      required: false,
      default: 'production_sqlite'
    }
  ];
  
  envVars.forEach(env => {
    console.log(`🔑 ${env.name}`);
    console.log(`   描述: ${env.description}`);
    console.log(`   示例: ${env.example}`);
    console.log(`   必需: ${env.required ? '是' : '否' + (env.default ? ` (默认: ${env.default})` : '')}`);
    console.log('');
  });
}

// 生成解决方案步骤
function generateSolutionSteps() {
  console.log('🛠️  解决方案步骤\n');
  
  console.log('步骤 1: 配置 Vercel 环境变量');
  console.log('1. 登录 Vercel Dashboard');
  console.log('2. 选择您的项目');
  console.log('3. 进入 Settings > Environment Variables');
  console.log('4. 添加上述所有必需的环境变量');
  console.log('');
  
  console.log('步骤 2: Google OAuth 配置');
  console.log('1. 访问 Google Cloud Console');
  console.log('2. 创建或选择项目');
  console.log('3. 启用 Google+ API');
  console.log('4. 创建 OAuth 2.0 客户端ID');
  console.log('5. 添加授权的重定向 URI：');
  console.log('   - https://your-domain.vercel.app/api/auth/callback/google');
  console.log('');
  
  console.log('步骤 3: 根据需求选择认证模式');
  console.log('');
  console.log('模式 A: 仅 Google 登录（推荐，简单）');
  console.log('- 设置 AUTH_ENVIRONMENT=production_sqlite');
  console.log('- 设置 DATABASE_URL=file:./dev.db');
  console.log('- 用户只能通过 Google 登录');
  console.log('');
  
  console.log('模式 B: 完整功能（Google + 邮箱密码）');
  console.log('- 需要 PostgreSQL 数据库（如 Supabase、PlanetScale 等）');
  console.log('- 设置 AUTH_ENVIRONMENT=production_postgresql');
  console.log('- 设置 DATABASE_URL=postgresql://...');
  console.log('- 支持 Google 登录和邮箱密码注册/登录');
  console.log('');
  
  console.log('步骤 4: 重新部署');
  console.log('1. 在 Vercel Dashboard 中触发重新部署');
  console.log('2. 或推送代码到 Git 仓库触发自动部署');
  console.log('');
}

// 常见问题诊断
function diagnoseCommonIssues() {
  console.log('🔍 常见问题诊断\n');
  
  console.log('问题 1: "Login failed" 或 "Registration Failed"');
  console.log('可能原因:');
  console.log('- NEXTAUTH_SECRET 未设置或不正确');
  console.log('- NEXTAUTH_URL 与实际域名不匹配');
  console.log('- Google OAuth 凭证不正确');
  console.log('- AUTH_ENVIRONMENT 配置与实际功能需求不匹配');
  console.log('');
  
  console.log('问题 2: 数据库连接错误');
  console.log('可能原因:');
  console.log('- DATABASE_URL 配置不正确');
  console.log('- Prisma schema provider 与实际数据库类型不匹配');
  console.log('- 生产环境中 SQLite 文件权限问题');
  console.log('');
  
  console.log('问题 3: Google 登录重定向错误');
  console.log('可能原因:');
  console.log('- Google OAuth 重定向 URI 配置不正确');
  console.log('- NEXTAUTH_URL 设置错误');
  console.log('- 域名配置问题');
  console.log('');
}

// 生成快速修复命令
function generateQuickFix() {
  console.log('⚡ 快速修复（推荐配置）\n');
  
  console.log('如果您希望快速解决问题，建议使用 "仅 Google 登录" 模式：');
  console.log('');
  console.log('在 Vercel 中设置以下环境变量：');
  console.log('```');
  console.log('AUTH_ENVIRONMENT=production_sqlite');
  console.log('DATABASE_URL=file:./dev.db');
  console.log('NEXTAUTH_SECRET=your-32-char-secret-here');
  console.log('NEXTAUTH_URL=https://your-domain.vercel.app');
  console.log('GOOGLE_CLIENT_ID=your-google-client-id');
  console.log('GOOGLE_CLIENT_SECRET=your-google-client-secret');
  console.log('```');
  console.log('');
  console.log('⚠️  注意：这个配置将禁用邮箱密码注册/登录功能');
  console.log('用户只能通过 Google 账号登录');
  console.log('');
}

// 主函数
function main() {
  checkProjectConfiguration();
  generateVercelEnvGuide();
  generateSolutionSteps();
  diagnoseCommonIssues();
  generateQuickFix();
  
  console.log('📞 如需更多帮助：');
  console.log('- 检查 Vercel 部署日志中的错误信息');
  console.log('- 确保所有环境变量都已正确设置');
  console.log('- 验证 Google OAuth 配置');
  console.log('- 运行 npm run vercel-env-check 检查环境变量');
}

if (require.main === module) {
  main();
} 