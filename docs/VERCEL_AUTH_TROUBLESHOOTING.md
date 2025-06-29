# Vercel 认证问题排查指南

## 问题描述

在 Vercel 平台部署后，用户遇到注册和登录功能报错的问题，出现 "Login failed" 和 "Registration Failed" 的错误提示。

## 问题原因分析

### 1. 环境变量配置问题
- 缺少必需的环境变量
- 环境变量值不正确
- 环境变量与实际需求不匹配

### 2. 数据库配置不匹配
- 本地开发环境与生产环境数据库类型不一致
- Prisma schema 配置与实际数据库不匹配

### 3. 认证环境配置问题
- AUTH_ENVIRONMENT 设置与实际功能需求不符
- 简化版本配置试图使用邮箱密码登录功能

## 解决方案

### 方案一：仅 Google 登录（推荐）

这是最简单的解决方案，适合大多数用户。

#### 步骤 1: 配置 Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 客户端ID
5. 添加授权的重定向 URI：
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

#### 步骤 2: 配置 Vercel 环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# 必需的环境变量
NEXTAUTH_SECRET=your-32-character-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
DATABASE_URL=file:./dev.db
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# 认证环境配置
AUTH_ENVIRONMENT=production_sqlite
```

#### 步骤 3: 重新部署

1. 在 Vercel Dashboard 中触发重新部署
2. 或推送代码到 Git 仓库触发自动部署

### 方案二：完整功能（Google + 邮箱密码）

如果需要支持邮箱密码注册和登录功能，需要使用 PostgreSQL 数据库。

#### 步骤 1: 准备 PostgreSQL 数据库

推荐使用以下服务：
- [Supabase](https://supabase.com/) - 免费额度充足
- [PlanetScale](https://planetscale.com/) - MySQL 兼容
- [Neon](https://neon.tech/) - PostgreSQL 专门服务

#### 步骤 2: 更新 Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 步骤 3: 配置 Vercel 环境变量

```bash
# 必需的环境变量
NEXTAUTH_SECRET=your-32-character-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
DATABASE_URL=postgresql://user:password@host:port/database
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# 认证环境配置
AUTH_ENVIRONMENT=production_postgresql
```

#### 步骤 4: 数据库迁移

```bash
# 在本地运行
npx prisma migrate deploy
```

## 使用工具进行诊断

项目中提供了专门的诊断工具：

### 检查环境变量
```bash
npm run vercel-env-check
```

### 获取详细修复指南
```bash
npm run fix-vercel-auth
```

## 常见错误及解决方法

### 错误 1: "Login failed"
**原因**: NextAuth 配置问题
**解决方法**: 
- 检查 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 设置
- 确保 Google OAuth 配置正确

### 错误 2: "Registration Failed"
**原因**: 尝试使用邮箱注册但环境不支持
**解决方法**: 
- 设置 `AUTH_ENVIRONMENT=production_postgresql`
- 配置 PostgreSQL 数据库

### 错误 3: 数据库连接错误
**原因**: 数据库配置不正确
**解决方法**: 
- 检查 `DATABASE_URL` 格式
- 确保数据库服务可访问

### 错误 4: Google 登录重定向错误
**原因**: OAuth 重定向 URI 配置不正确
**解决方法**: 
- 在 Google Cloud Console 中添加正确的重定向 URI
- 确保 `NEXTAUTH_URL` 与实际域名匹配

## 验证部署

部署完成后，按以下步骤验证：

1. 访问您的网站登录页面
2. 点击 "Login with Google" 按钮
3. 完成 Google 授权流程
4. 检查是否成功登录并跳转到首页

## 环境变量生成工具

### 生成 NEXTAUTH_SECRET
```bash
# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 使用 OpenSSL
openssl rand -base64 32
```

### 验证 Google OAuth 配置
确保在 Google Cloud Console 中：
- 启用了 Google+ API
- OAuth 2.0 客户端 ID 已创建
- 重定向 URI 正确配置

## 注意事项

1. **环境变量安全**: 确保所有敏感信息都通过 Vercel 环境变量设置，不要在代码中硬编码
2. **域名一致性**: `NEXTAUTH_URL` 必须与实际访问域名完全一致
3. **数据库选择**: 如果不需要用户注册功能，推荐使用方案一（仅 Google 登录）
4. **部署验证**: 每次修改环境变量后都需要重新部署

## 获取帮助

如果按照上述步骤仍然无法解决问题，请：

1. 检查 Vercel 部署日志中的错误信息
2. 运行项目提供的诊断工具
3. 确认所有环境变量都已正确设置
4. 验证 Google OAuth 配置是否正确

## 相关文件

- `scripts/vercel-env-check.js` - 环境变量检查工具
- `scripts/fix-vercel-auth.js` - 认证问题修复指南
- `config/auth-environments.js` - 认证环境配置
- `pages/api/auth/[...nextauth].js` - NextAuth 配置 