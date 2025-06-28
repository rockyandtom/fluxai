#!/usr/bin/env node

/**
 * NextAuth 环境配置检查脚本
 * 用于诊断生产环境登录跳转问题
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // 备用加载

const chalk = require('chalk');

function checkAuthConfig() {
  console.log(chalk.blue.bold('\n🔍 NextAuth 环境配置检查\n'));

  const checks = [
    {
      name: 'AUTH_ENVIRONMENT',
      value: process.env.AUTH_ENVIRONMENT,
      expected: 'production_sqlite (生产环境)',
      required: false
    },
    {
      name: 'NEXTAUTH_URL',
      value: process.env.NEXTAUTH_URL,
      expected: '生产域名 (https://www.fluxai.life)',
      required: true
    },
    {
      name: 'NEXTAUTH_SECRET',
      value: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置',
      expected: '安全密钥（必须设置）',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_ID',
      value: process.env.GOOGLE_CLIENT_ID ? '已设置' : '未设置',
      expected: 'Google OAuth 客户端 ID',
      required: true
    },
    {
      name: 'GOOGLE_CLIENT_SECRET',
      value: process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '未设置',
      expected: 'Google OAuth 客户端密钥',
      required: true
    }
  ];

  let hasErrors = false;

  checks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    const color = check.value ? 'green' : 'red';
    
    console.log(`${status} ${chalk[color](check.name)}: ${check.value || '未设置'}`);
    console.log(`   预期: ${check.expected}\n`);

    if (check.required && !check.value) {
      hasErrors = true;
    }
  });

  // 环境模式检查
  const authEnvironment = process.env.AUTH_ENVIRONMENT || 'production_sqlite';
  console.log(chalk.yellow.bold('📋 当前配置模式:'));
  
  switch (authEnvironment) {
    case 'development':
      console.log('🔧 开发模式 - 支持 Google OAuth + 邮箱密码登录');
      break;
    case 'production_sqlite':
      console.log('🚀 生产模式（简化）- 仅支持 Google OAuth 登录');
      break;
    case 'production_postgresql':
      console.log('🚀 生产模式（完整）- 支持 Google OAuth + 邮箱密码登录');
      break;
    default:
      console.log('⚠️  未知模式，将使用默认配置');
  }

  // URL 配置检查
  console.log(chalk.yellow.bold('\n🌐 URL 配置检查:'));
  const nextauthUrl = process.env.NEXTAUTH_URL;
  if (nextauthUrl) {
    console.log(`✅ NEXTAUTH_URL: ${nextauthUrl}`);
    
    // 检查 URL 格式
    try {
      const url = new URL(nextauthUrl);
      if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
        console.log(chalk.yellow('⚠️  生产环境建议使用 HTTPS'));
      }
    } catch (e) {
      console.log(chalk.red('❌ NEXTAUTH_URL 格式不正确'));
      hasErrors = true;
    }
  } else {
    console.log(chalk.red('❌ NEXTAUTH_URL 未设置'));
    hasErrors = true;
  }

  // 总结
  console.log(chalk.blue.bold('\n📊 检查结果:'));
  if (hasErrors) {
    console.log(chalk.red.bold('❌ 发现配置问题，可能导致登录跳转失败'));
    console.log(chalk.yellow('\n💡 解决建议:'));
    console.log('1. 确保所有必需的环境变量都已设置');
    console.log('2. 检查 NEXTAUTH_URL 是否为正确的生产域名');
    console.log('3. 确认 Google OAuth 配置正确');
    console.log('4. 在生产环境设置 AUTH_ENVIRONMENT=production_sqlite');
  } else {
    console.log(chalk.green.bold('✅ 环境配置看起来正常'));
  }

  // 调试信息
  console.log(chalk.gray.bold('\n🔍 调试信息:'));
  console.log(chalk.gray(`Node.js 版本: ${process.version}`));
  console.log(chalk.gray(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`));
  console.log(chalk.gray(`AUTH_ENVIRONMENT: ${authEnvironment}`));
  
  return !hasErrors;
}

if (require.main === module) {
  try {
    checkAuthConfig();
  } catch (error) {
    console.error(chalk.red.bold('❌ 检查过程中发生错误:'), error.message);
    process.exit(1);
  }
}

module.exports = { checkAuthConfig }; 