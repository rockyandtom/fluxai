/**
 * 调试API - 检查环境变量配置
 * 访问: /api/debug/env-check
 */

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 检查所有必需的环境变量
  const envVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '已设置' : '未设置',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '未设置',
    AUTH_ENVIRONMENT: process.env.AUTH_ENVIRONMENT || '未设置',
    DATABASE_URL: process.env.DATABASE_URL ? '已设置' : '未设置',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '未设置',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '已设置' : '未设置',
    RUNNINGHUB_API_URL: process.env.RUNNINGHUB_API_URL || '未设置',
    RUNNINGHUB_API_KEY: process.env.RUNNINGHUB_API_KEY ? '已设置' : '未设置',
  };

  // 检查配置状态
  const issues = [];
  
  if (!process.env.NEXTAUTH_SECRET) {
    issues.push('NEXTAUTH_SECRET 未设置');
  }
  
  if (!process.env.NEXTAUTH_URL) {
    issues.push('NEXTAUTH_URL 未设置');
  } else if (process.env.NEXTAUTH_URL !== 'https://www.fluxai.life') {
    issues.push(`NEXTAUTH_URL 不匹配，当前值: ${process.env.NEXTAUTH_URL}`);
  }
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    issues.push('GOOGLE_CLIENT_ID 未设置');
  }
  
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    issues.push('GOOGLE_CLIENT_SECRET 未设置');
  }
  
  if (!process.env.DATABASE_URL) {
    issues.push('DATABASE_URL 未设置');
  }

  res.status(200).json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars,
    issues,
    status: issues.length === 0 ? 'OK' : 'ISSUES_FOUND',
    nextAuthUrl: process.env.NEXTAUTH_URL,
    authEnvironment: process.env.AUTH_ENVIRONMENT || 'production_postgresql'
  });
} 