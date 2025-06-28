# 数据库迁移指南

## 概述

本文档描述了如何从当前的简化版NextAuth配置（仅支持Google登录）迁移到完整的数据库版本。

## 当前状态

- **环境**: 生产环境（Vercel）
- **认证方式**: 仅Google OAuth
- **数据库**: 禁用（避免SQLite在无服务器环境的问题）
- **数据持久化**: 否（session重启后丢失）

## 迁移目标

- **环境**: 生产环境（Vercel + PostgreSQL）
- **认证方式**: Google OAuth + 邮箱密码登录
- **数据库**: PostgreSQL（Supabase/Neon/PlanetScale）
- **数据持久化**: 是（完整的用户数据管理）

## 迁移步骤

### 第1步：选择数据库服务

推荐以下PostgreSQL服务：

1. **Supabase** (推荐)
   - 免费额度: 500MB存储
   - 自动备份和高可用性
   - 与Vercel完美集成

2. **Neon**
   - 专为无服务器优化
   - 免费额度: 3GB存储
   - 冷启动快

3. **PlanetScale**
   - 企业级稳定性
   - 分支和合并功能

### 第2步：设置数据库

1. 在选择的服务中创建新数据库
2. 获取连接字符串
3. 在Vercel环境变量中设置：
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?schema=public
   ```

### 第3步：更新Prisma Schema

将 `prisma/schema.prisma` 中的数据库provider改为：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 第4步：恢复NextAuth配置

1. 备份当前的简化版本：
   ```bash
   cp pages/api/auth/[...nextauth].js backup/nextauth-simplified.js
   ```

2. 从备份恢复完整版本：
   ```bash
   cp backup/nextauth-with-database.js pages/api/auth/[...nextauth].js
   ```

3. 或者手动恢复以下功能：
   - 取消注释 PrismaAdapter
   - 取消注释 CredentialsProvider
   - 恢复数据库相关的imports

### 第5步：运行数据库迁移

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库schema（首次部署）
npx prisma db push

# 或运行迁移（如果有迁移文件）
npx prisma migrate deploy
```

### 第6步：更新环境配置

在 `config/auth-environments.js` 中设置：
```bash
AUTH_ENVIRONMENT=production_postgresql
```

### 第7步：测试功能

1. Google登录功能
2. 邮箱密码注册
3. 邮箱密码登录
4. 用户数据持久化

## 回滚方案

如果迁移过程中出现问题，可以快速回滚：

1. 恢复简化版配置：
   ```bash
   cp backup/nextauth-simplified.js pages/api/auth/[...nextauth].js
   ```

2. 重置环境变量：
   ```
   AUTH_ENVIRONMENT=production_sqlite
   ```

3. 重新部署

## 注意事项

1. **数据备份**: 在迁移前备份所有重要数据
2. **测试环境**: 先在测试环境验证迁移流程
3. **用户通知**: 如有必要，提前通知用户系统维护
4. **监控**: 迁移后密切监控系统状态

## 文件清单

- `backup/nextauth-with-database.js` - 完整数据库版本配置
- `backup/nextauth-simplified.js` - 简化版本配置
- `config/auth-environments.js` - 环境配置管理
- `docs/DATABASE_MIGRATION_GUIDE.md` - 本迁移指南

## 联系信息

如在迁移过程中遇到问题，请参考：
- Next.js官方文档
- NextAuth官方文档
- Prisma官方文档 