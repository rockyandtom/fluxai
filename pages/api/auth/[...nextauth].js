import 'global-agent/bootstrap';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import { PrismaClient } from '@prisma/client';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

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

const authOptions = {
  // adapter: PrismaAdapter(prisma), // 临时禁用数据库适配器
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
        timeout: 10000, // 将超时时间增加到10秒
      }
    }),
    /* 临时禁用密码登录
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
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            console.log('未找到用户:', credentials.email);
            return null;
          }

          if (!user.password) {
            console.log('用户无密码字段:', user);
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
          throw err;
        }
      }
    })
    */
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
      // 首次登录时 (例如通过Google登录), user 对象会被传入
      // 我们将数据库中的用户ID和name保存到token中
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // 每当访问session时 (例如useSession()), 这个回调会执行
      // 我们将token中保存的用户ID和name, 同步到session.user对象
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name; // 确保name也同步
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // JWT策略需要一个密钥
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
export { authOptions }; 