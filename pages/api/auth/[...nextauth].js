/* @preserve 
 * NextAuth 优化配置 - 修复生产环境登录问题
 * 修改时间: 2025-01-XX
 * 修改原因: 解决Vercel部署中的Google登录失败问题
 */

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

// 创建Prisma客户端实例
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

// NextAuth配置
const authOptions = {
  // 仅在有数据库连接时使用Prisma适配器
  ...(process.env.DATABASE_URL && { adapter: PrismaAdapter(prisma) }),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    })
  ],
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (user && account?.provider === 'google') {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.image = user.image;
        }
        return token;
      } catch (error) {
        console.error('[NextAuth] JWT callback error:', error);
        return token;
      }
    },
    
    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.id;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.image;
        }
        return session;
      } catch (error) {
        console.error('[NextAuth] Session callback error:', error);
        return session;
      }
    },
    
    async redirect({ url, baseUrl }) {
      try {
        // 确保baseUrl正确
        const currentBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
        
        // 登录成功后重定向到创作中心
        if (url.startsWith('/api/auth/callback')) {
          return `${currentBaseUrl}/create`;
        }
        
        // 处理相对路径
        if (url.startsWith('/')) {
          return `${currentBaseUrl}${url}`;
        }
        
        // 检查是否为同域URL
        try {
          const urlObj = new URL(url);
          const baseUrlObj = new URL(currentBaseUrl);
          if (urlObj.origin === baseUrlObj.origin) {
            return url;
          }
        } catch {
          // URL解析失败，使用默认重定向
        }
        
        // 默认重定向到创作中心
        return `${currentBaseUrl}/create`;
      } catch (error) {
        console.error('[NextAuth] Redirect callback error:', error);
        return `${process.env.NEXTAUTH_URL || baseUrl}/create`;
      }
    },
    
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          // 验证必需的用户信息
          if (!user?.email) {
            console.error('[NextAuth] Google登录失败: 缺少邮箱信息');
            return false;
          }
          
          console.log('[NextAuth] Google登录成功:', user.email);
          return true;
        }
        
        console.error('[NextAuth] 未知登录提供商:', account?.provider);
        return false;
      } catch (error) {
        console.error('[NextAuth] SignIn callback error:', error);
        return false;
      }
    },
  },
  
  // 增强错误处理
  events: {
    async error(message) {
      console.error('[NextAuth] Error event:', message);
    },
    async signIn(message) {
      console.log('[NextAuth] SignIn event:', message.user?.email);
    },
  },
  
  // 调试模式（仅在开发环境）
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
export { authOptions }; 