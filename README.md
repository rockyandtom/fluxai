# FluxAI - AI Image Generator

FluxAI 是一个先进的AI图片特效工具合集，提供多种图片处理和生成功能。

## 功能特点

- 多种AI图片生成特效
- 简洁直观的用户界面
- 快速的图片处理能力
- 移动端响应式设计

## 技术栈

- **前端框架**：Next.js 14
- **样式**：Tailwind CSS
- **API集成**：RunningHub 工作流API
- **状态管理**：React Hooks
- **动画效果**：Framer Motion

## 开发指南

### 环境变量配置

在项目根目录创建`.env.local`文件，并按以下格式配置环境变量：

```
# RunningHub API Key
NEXT_PUBLIC_RUNNINGHUB_API_KEY=your_api_key_here

# Tool WebApp IDs
NEXT_PUBLIC_CARTOON_WEBAPP_ID=cartoon_webapp_id
NEXT_PUBLIC_SKETCH_WEBAPP_ID=sketch_webapp_id
NEXT_PUBLIC_ANIME_WEBAPP_ID=anime_webapp_id
NEXT_PUBLIC_OIL_PAINTING_WEBAPP_ID=oil_painting_webapp_id
NEXT_PUBLIC_PIXEL_ART_WEBAPP_ID=pixel_art_webapp_id

# Tool Node IDs
NEXT_PUBLIC_CARTOON_NODE_ID=cartoon_node_id
NEXT_PUBLIC_SKETCH_NODE_ID=sketch_node_id
NEXT_PUBLIC_ANIME_NODE_ID=anime_node_id
NEXT_PUBLIC_OIL_PAINTING_NODE_ID=oil_painting_node_id
NEXT_PUBLIC_PIXEL_ART_NODE_ID=pixel_art_node_id
```

将`your_api_key_here`替换为您的RunningHub API密钥，并将各工具的`webapp_id`和`node_id`替换为相应的实际值。

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署指南

### Vercel部署

1. 将代码推送到GitHub仓库
2. 在Vercel中导入该仓库
3. 在Vercel项目设置中配置环境变量
4. 点击部署

### 自定义域名

在Vercel的项目设置中配置自定义域名`fluxai.life`。

## 项目结构

```
fluxai/
├── public/          # 静态资源
│   ├── thumbnails/  # 工具缩略图
│   └── demos/       # 示例图片
├── src/
│   ├── app/         # 页面组件
│   ├── components/  # UI组件
│   ├── config/      # 配置文件
│   └── lib/         # 工具函数和API集成
└── ...
```

## API集成

所有工具都使用RunningHub API进行AI处理，只需要为每个工具配置不同的`webappId`和`nodeId`参数。详细的API集成参见`src/lib/api.ts`文件。

## 许可证

MIT License
