# Flux AI 网站

## 项目概述

Flux AI 是一个专业的 AI 特效创作平台，基于 ComfyUI 框架，支持文生图、图生图，提供赛博朋克、复古胶片等多样风格，快速生成专业级图像，释放创作力。

## 最新优化内容

### 导航栏优化
- ✅ 更新导航栏项目：开始创作、教程、作品展示、为何选择我们、价格方案、常见问题、学习中心
- ✅ 保持现有样式和布局不变
- ✅ 支持中英文切换
- ✅ 响应式设计，适配移动端和桌面端

### 首页内容优化
- ✅ 优化"为什么选择Flux AI"文案内容
- ✅ 完善"Flux AI与竞品对比"详细内容
- ✅ 更新"解决方案"描述和案例
- ✅ 重新组织"案例展示"分类（图像特效、视频特效、AI数字人）
- ✅ 完善"常见问题"FAQ内容
- ✅ 全部使用后端渲染（SSR）

### 用户体验优化
- ✅ 首页"开始使用"按钮智能跳转功能
  - 未登录用户：跳转到登录页面，引导用户完成登录
  - 已登录用户：直接跳转到创作中心，开始创作之旅
  - 与导航栏"开始创作"保持一致的跳转逻辑
  - 优化用户操作流程，提升转化率

### 技术特性
- ✅ 基于 Next.js 14 框架
- ✅ 使用 Chakra UI 组件库
- ✅ 支持国际化（中文/英文）
- ✅ 集成 NextAuth.js 认证
- ✅ 使用 Prisma ORM 数据库
- ✅ 响应式设计

## 导航栏结构

```
Flux AI Logo                   导航菜单                    语言切换 登录/注册
     |                           |                           |
     |                   开始创作 教程 作品展示              |     |
     |                   为何选择我们 价格方案              |     |
     |                   常见问题 学习中心                  |     |
```

## 主要功能模块

### 1. 开始创作
- AI 图像特效生成
- 22 种风格视频生成器
- AI 数字人克隆

### 2. 教程
- 新手入门指南
- 高级技巧教程
- 最佳实践分享

### 3. 作品展示
- 用户作品展示
- 风格模板预览
- 创作灵感分享

### 4. 为何选择我们
- 基于 ComfyUI 框架
- 独家 Flux LoRA 模型
- Flux 1.1 Pro 先进技术

### 5. 价格方案
- 基础版：每日5次AI生成
- 专业版：无限生成
- 企业版：定制服务

### 6. 常见问题
- 12个常见问题解答
- 详细使用指南
- 技术支持信息

### 7. 学习中心
- 在线教程
- 视频课程
- 社区交流

## 技术栈

- **前端框架**: Next.js 14
- **UI 组件库**: Chakra UI
- **国际化**: next-i18next
- **认证**: NextAuth.js
- **数据库**: Prisma + SQLite
- **样式**: CSS-in-JS (Emotion)
- **图标**: React Icons

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 环境变量

创建 `.env.local` 文件：

```env
# 数据库
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (可选)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 项目结构

```
flux-ai-website/
├── components/          # 组件目录
│   ├── Navbar.js       # 导航栏组件
│   └── Footer.js       # 页脚组件
├── pages/              # 页面目录
│   ├── index.js        # 首页
│   ├── create.js       # 创作页面
│   ├── login.js        # 登录页面
│   └── register.js     # 注册页面
├── public/             # 静态资源
│   └── locales/        # 国际化文件
│       ├── zh/         # 中文
│       └── en/         # 英文
├── prisma/             # 数据库配置
└── styles/             # 样式文件
```

## 部署

项目支持多种部署方式：

- **Vercel**: 推荐，一键部署
- **Netlify**: 静态站点部署
- **Docker**: 容器化部署
- **传统服务器**: Node.js 环境

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- 官网: https://flux-ai.com
- 邮箱: support@flux-ai.com
- GitHub: https://github.com/flux-ai/website 