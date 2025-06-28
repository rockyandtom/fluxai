import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: '邮箱和密码不能为空' });
  }
  // 检查邮箱是否已注册
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: '该邮箱已注册' });
  }
  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10);
  // 创建用户
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
  return res.status(201).json({ message: '注册成功' });
} 