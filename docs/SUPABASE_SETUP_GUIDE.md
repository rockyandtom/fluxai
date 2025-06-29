# Supabase 数据库配置指南

## 背景说明

根据之前的建议，我们将使用 Supabase 作为 PostgreSQL 数据库来支持完整的认证功能，包括：
- ✅ Google OAuth 登录
- ✅ 邮箱密码注册/登录
- ✅ 用户数据持久化存储

## 第一步：创建 Supabase 项目

### 1.1 注册 Supabase 账号
1. 访问 [Supabase.com](https://supabase.com/)
2. 点击 "Start your project" 注册账号
3. 使用 GitHub、Google 或邮箱注册

### 1.2 创建新项目
1. 登录后点击 "New Project"
2. 选择组织（个人账号）
3. 填写项目信息：
   - **项目名称**: `flux-ai-website` 或您喜欢的名称
   - **密码**: 设置一个强密码（请记住此密码）
   - **地区**: 选择离您最近的地区
4. 点击 "Create new project"

### 1.3 等待项目初始化
- 项目创建需要 1-2 分钟
- 完成后您将看到项目仪表板

## 第二步：获取数据库连接信息

### 2.1 获取连接字符串
1. 在项目仪表板中，点击左侧 "Settings" 
2. 点击 "Database"
3. 找到 "Connection string" 部分
4. 选择 "URI" 格式
5. 复制连接字符串，格式类似：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### 2.2 替换密码
将连接字符串中的 `[YOUR-PASSWORD]` 替换为您在创建项目时设置的密码。

## 第三步：配置 Vercel 环境变量

在 Vercel 项目设置中配置以下环境变量：

### 3.1 必需的环境变量

```bash
# 数据库配置
DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres

# NextAuth 配置
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth 配置
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# 认证环境配置
AUTH_ENVIRONMENT=production_postgresql

# RunningHub API (可选)
RUNNINGHUB_API_URL=https://www.runninghub.cn
RUNNINGHUB_API_KEY=fb88fac46b0349c1986c9cbb4f14d44e
```

### 3.2 设置步骤
1. 登录 Vercel Dashboard
2. 选择您的项目
3. 进入 Settings > Environment Variables
4. 逐一添加上述环境变量
5. 确保所有环境都选择（Production, Preview, Development）

## 第四步：数据库初始化

### 4.1 运行数据库迁移

在您的本地项目中运行：

```bash
# 生成 Prisma Client
npx prisma generate

# 推送数据库结构到 Supabase
npx prisma db push
```

### 4.2 验证数据库结构
1. 回到 Supabase 仪表板
2. 点击左侧 "Table Editor"
3. 您应该看到以下表格：
   - `User`
   - `Account` 
   - `Session`
   - `VerificationToken`
   - `Project`

## 第五步：部署和测试

### 5.1 重新部署 Vercel
1. 在 Vercel Dashboard 中触发重新部署
2. 或推送代码更改到 Git 仓库

### 5.2 测试功能
1. **Google 登录测试**：
   - 访问您的网站
   - 点击 "Login with Google"
   - 完成 Google 授权
   - 确认成功登录

2. **邮箱注册测试**：
   - 访问注册页面
   - 使用邮箱和密码注册
   - 确认注册成功

3. **邮箱登录测试**：
   - 使用刚注册的邮箱和密码登录
   - 确认登录成功

## 第六步：数据库监控（可选）

### 6.1 查看用户数据
1. 在 Supabase 仪表板中点击 "Table Editor"
2. 点击 "User" 表查看注册的用户
3. 查看 "Account" 表确认 Google 登录记录

### 6.2 监控 API 使用
1. 点击 "Settings" > "Usage"
2. 查看数据库请求和存储使用情况

## 常见问题解决

### 问题 1: 连接字符串错误
**症状**: 数据库连接失败
**解决方法**: 
- 检查密码是否正确
- 确保没有特殊字符需要 URL 编码
- 验证主机地址是否正确

### 问题 2: 数据库迁移失败
**症状**: `prisma db push` 报错
**解决方法**:
```bash
# 重置并重新推送
npx prisma db push --force-reset
```

### 问题 3: 用户注册失败
**症状**: 邮箱注册时出现服务器错误
**解决方法**:
- 检查 `AUTH_ENVIRONMENT=production_postgresql`
- 确认数据库表结构正确
- 查看 Vercel 部署日志

## 成本说明

Supabase 免费套餐包括：
- ✅ 500MB 数据库存储
- ✅ 2GB 带宽
- ✅ 50MB 文件存储
- ✅ 50,000 每月活跃用户

对于大多数小型到中型项目，免费套餐完全足够使用。

## 安全最佳实践

1. **数据库密码**: 使用强密码并定期更换
2. **Row Level Security**: 考虑在 Supabase 中启用 RLS
3. **API Keys**: 不要在客户端暴露 Supabase 密钥
4. **环境变量**: 确保敏感信息只通过环境变量传递

## 下一步

配置完成后，您的应用将支持：
- 完整的用户认证系统
- 数据持久化存储
- 生产级数据库性能
- 自动备份和扩展

如果遇到任何问题，请查看 Vercel 部署日志或运行项目诊断工具：
```bash
npm run vercel-env-check
``` 