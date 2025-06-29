import bcrypt from 'bcryptjs';
import prisma from '../../../prisma/client';

export default async function handler(req, res) {
  // 添加CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // 验证输入数据
    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '邮箱格式不正确' });
    }

    // 验证密码强度
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少需要6位' });
    }

    // 检查邮箱是否已注册
    const existingUser = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(409).json({ message: '该邮箱已注册' });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      }
    });

    console.log(`用户注册成功: ${newUser.email}`);
    return res.status(201).json({ 
      message: '注册成功',
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('注册过程中发生错误:', error);
    
    // 处理Prisma特定错误
    if (error.code === 'P2002') {
      return res.status(409).json({ message: '该邮箱已注册' });
    }
    
    // 处理数据库连接错误
    if (error.code === 'P1001') {
      return res.status(503).json({ message: '数据库连接失败，请稍后重试' });
    }

    // 通用错误处理
    return res.status(500).json({ 
      message: '服务器内部错误，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
} 