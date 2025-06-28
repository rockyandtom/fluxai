import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../prisma/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { appName, imageUrl } = req.body;

  if (!appName || !imageUrl) {
    return res.status(400).json({ message: 'Missing appName or imageUrl' });
  }

  try {
    const project = await prisma.project.create({
      data: {
        appName: appName,
        imageUrl: imageUrl,
        userId: session.user.id,
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ message: '保存作品失败' });
  }
} 