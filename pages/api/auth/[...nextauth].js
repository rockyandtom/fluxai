/* @preserve 
 * NextAuth 简化版本配置 - 仅支持Google登录
 * 创建时间: 2025-06-28
 * 使用场景: 无服务器环境（Vercel）
 * 备份位置: backup/nextauth-with-database.js
 * 恢复说明: 迁移到PostgreSQL后可恢复完整数据库功能
 */

import 'global-agent/bootstrap';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const authOptions = {
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
        timeout: 15000, // 增加超时时间到15秒
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // JWT策略需要一个密钥
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
export { authOptions }; 