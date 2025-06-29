/* @preserve 
 * NextAuth 动态环境配置
 * 根据 AUTH_ENVIRONMENT 环境变量自动选择配置模式
 * 修改时间: 2025-01-XX
 * 修改原因: 解决生产环境登录跳转问题
 */

import 'global-agent/bootstrap';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 10000,
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'google') {
        console.log('[NextAuth] Google 登录成功:', user.email);
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      console.log('[NextAuth] Session 创建成功:', session.user?.email);
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] 重定向处理:', { url, baseUrl });
      
      // 登录成功后重定向到创作中心
      if (url.startsWith('/api/auth/callback')) {
        console.log('[NextAuth] 登录成功，重定向到创作中心');
        return `${baseUrl}/create`;
      }
      
      // 如果是相对路径，确保在同一域下
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // 如果是同一域下的URL，允许重定向
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // 默认重定向到创作中心
      return `${baseUrl}/create`;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        console.log('[NextAuth] Google 登录验证通过:', user.email);
        return true;
      }
      return false;
    },
  },
};

export default NextAuth(authOptions);
export { authOptions }; 