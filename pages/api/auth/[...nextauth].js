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
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 获取当前环境的基础URL
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return 'http://localhost:3000';
};

// 环境类型枚举
const AUTH_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION_SQLITE: 'production_sqlite',
  PRODUCTION_POSTGRESQL: 'production_postgresql',
};

// 获取当前环境
const getCurrentEnvironment = () => {
  return process.env.AUTH_ENVIRONMENT || AUTH_ENVIRONMENTS.PRODUCTION_SQLITE;
};

// 动态构建认证配置
const buildAuthOptions = () => {
  const environment = getCurrentEnvironment();
  console.log(`[NextAuth] 当前环境: ${environment}`);
  
  // 基础配置
  const baseConfig = {
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
  };

  // 根据环境配置不同的认证策略
  switch (environment) {
    case AUTH_ENVIRONMENTS.DEVELOPMENT:
    case AUTH_ENVIRONMENTS.PRODUCTION_POSTGRESQL:
      // 完整数据库模式
      console.log('[NextAuth] 使用数据库模式');
      return {
        ...baseConfig,
        adapter: PrismaAdapter(prisma),
        providers: [
          ...baseConfig.providers,
          CredentialsProvider({
            name: 'Credentials',
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
              try {
                if (!credentials?.email || !credentials?.password) {
                  console.log('缺少邮箱或密码');
                  return null;
                }

                const user = await prisma.user.findUnique({
                  where: { email: credentials.email }
                });

                if (!user || !user.password) {
                  console.log('未找到用户或无密码字段:', credentials.email);
                  return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                  console.log('密码校验失败:', credentials.email);
                  return null;
                }

                console.log('登录成功:', user.email);
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                };
              } catch (err) {
                console.error('authorize 发生异常:', err);
                return null;
              }
            }
          })
        ],
        session: {
          strategy: 'jwt',
          maxAge: 30 * 24 * 60 * 60, // 30 days
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
          async redirect({ url, baseUrl }) {
            // 登录成功后重定向到首页
            console.log('[NextAuth] 重定向处理:', { url, baseUrl });
            
            // 如果是登录回调，重定向到首页
            if (url.startsWith('/api/auth/callback')) {
              console.log('[NextAuth] 登录成功，重定向到首页');
              return baseUrl;
            }
            
            // 如果是相对路径，确保在同一域下
            if (url.startsWith('/')) {
              return `${baseUrl}${url}`;
            }
            
            // 如果是同一域下的URL，允许重定向
            if (new URL(url).origin === baseUrl) {
              return url;
            }
            
            // 默认重定向到首页
            return baseUrl;
          },
          async signIn({ user, account, profile, email, credentials }) {
            console.log('[NextAuth] signIn callback:', { 
              provider: account?.provider, 
              email: user?.email 
            });
            
            // 对于credentials provider (邮箱登录)
            if (account?.provider === 'credentials') {
              console.log('[NextAuth] 邮箱登录验证通过:', user.email);
              return true;
            }
            
            // 对于Google provider
            if (account?.provider === 'google') {
              console.log('[NextAuth] Google登录验证通过:', user.email);
              return true;
            }
            
            return true;
          },
        },
      };

    case AUTH_ENVIRONMENTS.PRODUCTION_SQLITE:
    default:
      // 简化 JWT 模式（仅 Google OAuth）
      console.log('[NextAuth] 使用简化 JWT 模式');
      return {
        ...baseConfig,
        session: {
          strategy: 'jwt',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        },
        callbacks: {
          async jwt({ token, user, account, profile }) {
            // Google 登录成功时处理用户信息
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
            // 将 token 信息同步到 session
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
            // 登录成功后重定向到首页
            console.log('[NextAuth] 重定向处理:', { url, baseUrl });
            
            // 如果是登录回调，重定向到首页
            if (url.startsWith('/api/auth/callback')) {
              console.log('[NextAuth] 登录成功，重定向到首页');
              return baseUrl;
            }
            
            // 如果是相对路径，确保在同一域下
            if (url.startsWith('/')) {
              return `${baseUrl}${url}`;
            }
            
            // 如果是同一域下的URL，允许重定向
            if (new URL(url).origin === baseUrl) {
              return url;
            }
            
            // 默认重定向到首页
            return baseUrl;
          },
          async signIn({ user, account, profile }) {
            // Google 登录验证
            if (account?.provider === 'google') {
              console.log('[NextAuth] Google 登录验证通过:', user.email);
              return true;
            }
            return false;
          },
        },
      };
  }
};

const authOptions = buildAuthOptions();

export default NextAuth(authOptions);
export { authOptions }; 