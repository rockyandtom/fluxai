#!/usr/bin/env node

/**
 * Vercel 环境变量检查脚本
 * 用于验证生产环境所需的环境变量是否正确配置
 */

const requiredEnvVars = {
  // 基础配置
  'NEXTAUTH_SECRET': {
    description: 'NextAuth JWT 加密密钥',
    example: 'your-super-secret-jwt-key-here',
    required: true
  },
  'NEXTAUTH_URL': {
    description: 'NextAuth 基础URL（生产环境域名）',
    example: 'https://your-domain.vercel.app',
    required: true
  },
  
  // 数据库配置
  'DATABASE_URL': {
    description: '数据库连接URL (推荐使用 Supabase PostgreSQL)',
    example: 'postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres',
    required: true
  },
  
  // Google OAuth 配置
  'GOOGLE_CLIENT_ID': {
    description: 'Google OAuth 客户端ID',
    example: 'your-google-client-id.googleusercontent.com',
    required: true
  },
  'GOOGLE_CLIENT_SECRET': {
    description: 'Google OAuth 客户端密钥',
    example: 'GOCSPX-your-google-client-secret',
    required: true
  },
  
  // 认证环境配置
  'AUTH_ENVIRONMENT': {
    description: '认证环境模式',
    example: 'production_postgresql (支持完整功能，推荐)',
    required: false,
    default: 'production_postgresql'
  },
  
  // RunningHub API 配置
  'RUNNINGHUB_API_URL': {
    description: 'RunningHub API 地址',
    example: 'https://www.runninghub.cn',
    required: false
  },
  'RUNNINGHUB_API_KEY': {
    description: 'RunningHub API 密钥',
    example: 'your-api-key',
    required: false
  }
};

function checkEnvironmentVariables() {
  console.log('🔍 检查 Vercel 环境变量配置...\n');
  
  const issues = [];
  const warnings = [];
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    
    if (!value) {
      if (config.required) {
        issues.push({
          variable: key,
          description: config.description,
          example: config.example,
          severity: 'error'
        });
      } else {
        warnings.push({
          variable: key,
          description: config.description,
          example: config.example,
          default: config.default
        });
      }
    } else {
      console.log(`✅ ${key}: 已配置`);
    }
  }
  
  // 输出问题
  if (issues.length > 0) {
    console.log('\n❌ 发现必需的环境变量未配置：');
    issues.forEach(issue => {
      console.log(`\n变量名: ${issue.variable}`);
      console.log(`描述: ${issue.description}`);
      console.log(`示例: ${issue.example}`);
    });
  }
  
  // 输出警告
  if (warnings.length > 0) {
    console.log('\n⚠️  可选的环境变量未配置：');
    warnings.forEach(warning => {
      console.log(`\n变量名: ${warning.variable}`);
      console.log(`描述: ${warning.description}`);
      console.log(`示例: ${warning.example}`);
      if (warning.default) {
        console.log(`默认值: ${warning.default}`);
      }
    });
  }
  
  // 特殊检查：认证环境配置
  const authEnv = process.env.AUTH_ENVIRONMENT || 'production_postgresql';
  console.log(`\n🔧 当前认证环境: ${authEnv}`);
  
  if (authEnv === 'production_postgresql') {
    console.log('✅ 当前环境支持完整功能：Google 登录 + 邮箱密码注册/登录');
    console.log('请确保：');
    console.log('1. 已配置 PostgreSQL 数据库（推荐 Supabase）');
    console.log('2. DATABASE_URL 格式正确');
  } else if (authEnv === 'production_sqlite') {
    console.log('ℹ️  注意：当前环境只支持 Google 登录，不支持邮箱密码注册/登录');
    console.log('如需支持邮箱密码功能，建议：');
    console.log('1. 配置 Supabase PostgreSQL 数据库');
    console.log('2. 设置 AUTH_ENVIRONMENT=production_postgresql');
  }
  
  if (issues.length > 0) {
    console.log('\n❌ 环境变量检查失败！请在 Vercel 项目设置中配置缺失的环境变量。');
    return false;
  } else {
    console.log('\n✅ 环境变量检查通过！');
    return true;
  }
}

function generateVercelEnvCommands() {
  console.log('\n📋 Vercel CLI 环境变量设置命令：\n');
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    if (config.required) {
      console.log(`vercel env add ${key}`);
      console.log(`# ${config.description}`);
      console.log(`# 示例值: ${config.example}\n`);
    }
  }
}

// 主执行
if (require.main === module) {
  const isValid = checkEnvironmentVariables();
  
  if (!isValid) {
    console.log('\n💡 解决方案：');
    console.log('1. 登录 Vercel Dashboard');
    console.log('2. 进入项目设置 > Environment Variables');
    console.log('3. 添加上述缺失的环境变量');
    console.log('4. 重新部署项目');
    
    generateVercelEnvCommands();
  }
}

module.exports = { checkEnvironmentVariables }; 