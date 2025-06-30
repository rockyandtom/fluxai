#!/usr/bin/env node

/**
 * Google OAuth 配置测试脚本
 * 用于验证环境变量是否正确配置
 */

require('dotenv').config({ path: '.env.local' });
const chalk = require('chalk');

function testGoogleAuthConfig() {
  console.log(chalk.blue.bold('\n🔍 Google OAuth 配置测试\n'));

  const checks = [
    {
      name: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET,
      test: (val) => val && val.length >= 32,
      message: '安全密钥长度应至少32位'
    },
    {
      name: 'NEXTAUTH_URL',
      value: process.env.NEXTAUTH_URL,
      test: (val) => val === 'http://localhost:3000',
      message: '本地开发应设置为 http://localhost:3000'
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      value: process.env.GOOGLE_CLIENT_ID,
      test: (val) => val && val.includes('.apps.googleusercontent.com'),
      message: 'Google客户端ID格式应为 xxx.apps.googleusercontent.com'
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      value: process.env.GOOGLE_CLIENT_SECRET,
      test: (val) => val && val.length > 20,
      message: 'Google客户端密钥应存在且有足够长度'
    },
    {
      name: 'DATABASE_URL',
      value: process.env.DATABASE_URL,
      test: (val) => val === 'file:./dev.db',
      message: 'SQLite数据库路径'
    }
  ];

  let hasErrors = false;
  let configuredCount = 0;

  checks.forEach(check => {
    const isValid = check.test(check.value);
    const status = isValid ? '✅' : '❌';
    const color = isValid ? 'green' : 'red';
    
    console.log(`${status} ${chalk[color](check.name)}: ${check.value ? '已配置' : '未配置'}`);
    console.log(`   ${check.message}\n`);

    if (isValid) {
      configuredCount++;
    } else {
      hasErrors = true;
    }
  });

  // 总结
  console.log(chalk.blue.bold('📊 配置状态:'));
  console.log(`已正确配置: ${configuredCount}/${checks.length}`);
  
  if (hasErrors) {
    console.log(chalk.red.bold('\n❌ 需要完成Google OAuth配置才能测试登录功能'));
    console.log(chalk.yellow('\n📝 配置步骤:'));
    console.log('1. 在Google Cloud Console创建OAuth 2.0客户端');
    console.log('2. 设置重定向URI: http://localhost:3000/api/auth/callback/google');
    console.log('3. 将客户端ID和密钥填入 .env.local 文件');
    console.log('4. 确保NEXTAUTH_SECRET已设置');
  } else {
    console.log(chalk.green.bold('\n✅ Google OAuth配置完成！可以开始测试登录功能'));
    console.log(chalk.cyan('\n🚀 启动开发服务器:'));
    console.log('npm run dev');
    console.log('\n然后访问: http://localhost:3000/login');
  }

  return !hasErrors;
}

if (require.main === module) {
  try {
    testGoogleAuthConfig();
  } catch (error) {
    console.error(chalk.red.bold('❌ 测试过程中发生错误:'), error.message);
    process.exit(1);
  }
}

module.exports = { testGoogleAuthConfig }; 