# Google OAuth 登录设置指南

## 概述

本项目现在已简化为仅使用 Google OAuth 进行用户认证，使用 SQLite 数据库存储用户数据。这大大简化了部署和维护复杂性。

## 功能特点

- ✅ 仅支持 Google OAuth 登录/注册
- ✅ 使用 SQLite 数据库（无需外部数据库）
- ✅ 现代化的 UI 设计（参考 invideo AI）
- ✅ 移动端和桌面端适配
- ✅ 自动用户数据同步

## 快速开始

### 1. 环境配置

复制环境变量模板：
```bash
cp env.template .env.local
```

### 2. Google OAuth 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端 ID：
   - 应用类型：Web 应用
   - 授权重定向 URI：
     - 本地开发：`http://localhost:3000/api/auth/callback/google`
     - 生产环境：`https://your-domain.vercel.app/api/auth/callback/google`

5. 复制客户端 ID 和客户端密钥到 `.env.local`：
```env
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. NextAuth 密钥设置

生成安全的 NextAuth 密钥：
```bash
openssl rand -base64 32
```

将生成的密钥添加到 `.env.local`：
```env
NEXTAUTH_SECRET="生成的密钥"
```

### 4. 数据库初始化

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. 启动项目

```bash
npm run dev
```

访问 `http://localhost:3000` 查看效果。

## 页面设计

### 登录页面 (`/login`)
- 左侧：Google 登录表单
- 右侧：产品展示和演示
- 移动端：垂直布局

### 注册页面 (`/register`)
- 左侧：Google 注册表单
- 右侧：功能亮点展示
- 移动端：垂直布局

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量：
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (设置为你的域名)

4. 更新 Google OAuth 设置中的重定向 URI

## 技术栈

- **前端**: Next.js, Chakra UI
- **认证**: NextAuth.js
- **数据库**: SQLite + Prisma
- **部署**: Vercel

## 注意事项

1. SQLite 数据库文件会在本地和 Vercel 上自动创建
2. 用户首次使用 Google 登录时会自动创建账户
3. 移除了邮箱/密码登录功能，专注于 OAuth 体验
4. 所有用户数据通过 Google 同步，无需额外的用户资料设置

## 故障排除

如果遇到登录问题：

1. 检查 Google OAuth 重定向 URI 是否正确
2. 确认环境变量是否正确设置
3. 查看浏览器开发者工具的网络和控制台日志
4. 确保 Google OAuth 客户端状态为"已发布"

## 相关文档

- [NextAuth.js 文档](https://next-auth.js.org/)
- [Google OAuth 设置](https://developers.google.com/identity/protocols/oauth2)
- [Prisma 文档](https://www.prisma.io/docs/) 