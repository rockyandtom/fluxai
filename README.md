# Flux AI Website

🚀 **现已上线**: [https://www.fluxai.life/](https://www.fluxai.life/)

一个现代化的AI图像生成网站，提供专业的Flux AI服务，支持多种艺术风格转换和图像生成功能。

## ✨ 功能特性

- 🎨 **AI图像生成**: 基于先进的Flux AI技术
- 🌍 **多语言支持**: 中英文无缝切换
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🎯 **用户友好**: 简洁直观的操作界面
- 🔒 **安全可靠**: 完整的用户认证系统
- ⚡ **高性能**: 优化的加载速度和用户体验

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **路由管理**: React Router DOM
- **国际化**: react-i18next
- **样式框架**: Tailwind CSS
- **构建工具**: Create React App
- **部署平台**: Vercel + GitHub Pages
- **版本控制**: Git + GitHub

## 🌐 在线访问

- **主站**: [https://www.fluxai.life/](https://www.fluxai.life/)
- **GitHub Pages**: [https://rockyandtom.github.io/fluxai](https://rockyandtom.github.io/fluxai)
- **源码仓库**: [https://github.com/rockyandtom/fluxai](https://github.com/rockyandtom/fluxai)

## 🚀 本地开发

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install --legacy-peer-deps
```

### 启动开发服务器
```bash
npm start
```

### 构建生产版本
```bash
npm run build
```

### 部署到GitHub Pages
```bash
npm run deploy
```

## 📁 项目结构

```
flux-ai-website/
├── public/                 # 静态资源
│   ├── images/            # 图片资源
│   └── index.html         # HTML模板
├── src/
│   ├── components/        # 可复用组件
│   ├── pages/            # 页面组件
│   ├── contexts/         # React Context
│   ├── config/           # 配置文件
│   ├── i18n.ts          # 国际化配置
│   └── App.tsx          # 主应用组件
├── vercel.json           # Vercel部署配置
├── .npmrc               # npm配置
└── package.json         # 项目依赖
```

## 🌟 主要页面

- **首页**: 产品介绍、功能展示、FAQ
- **用户系统**: 注册、登录、个人资料
- **图像生成**: AI图像生成功能
- **竞品对比**: 与其他AI工具的对比分析

## 🔧 配置说明

### 国际化配置
项目支持中英文切换，配置文件位于 `src/i18n.ts`

### 部署配置
- **Vercel**: 通过 `vercel.json` 配置
- **GitHub Pages**: 通过 `package.json` 中的 `homepage` 和 `deploy` 脚本

## 📝 更新日志

### v1.0.0 (2024-06-12)
- ✅ 完成网站基础架构
- ✅ 实现中英文国际化
- ✅ 完善FAQ功能
- ✅ 优化响应式设计
- ✅ 成功部署上线

## 👥 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。

## 📄 许可证

MIT License

---

**Flux AI** - 让AI图像生成更简单、更专业
