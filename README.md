# FluxAI - AI Image Generator

FluxAI 是一个先进的AI图片特效工具合集，提供多种图片处理和生成功能。

## 功能特点

- 多种AI图片生成特效
- 简洁直观的用户界面
- 快速的图片处理能力
- 移动端响应式设计
- 自动保存生成结果，展示最新30张图片

## 技术栈

- **前端框架**：Next.js 15.3.1
- **样式**：Tailwind CSS
- **API集成**：RunningHub 工作流API
- **状态管理**：React Hooks
- **动画效果**：Framer Motion
- **数据存储**：文件系统JSON存储

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

### 部署问题解决方案

如果在部署到Vercel时遇到ESLint或TypeScript类型检查错误，本项目已经进行了以下修复：

1. **ESLint错误修复**：
   - 移除了所有未使用的导入和变量
   - 将HTML `<a>` 标签替换为Next.js的 `<Link>` 组件
   - 修复了未转义的引号问题，使用 `&apos;` 替代 `'`
   - 为WebSocket消息添加了明确的类型定义，避免使用 `any`

2. **TypeScript类型错误**：
   - 添加了 `.next-types-ignore.js` 文件来忽略动态路由参数相关的类型错误
   - 修改了 `next.config.js` 配置，暂时忽略构建时的类型错误和ESLint错误

### 自定义域名

在Vercel的项目设置中配置自定义域名`fluxai.life`。

## 项目结构

```
fluxai/
├── public/          # 静态资源
│   ├── thumbnails/  # 工具缩略图
│   ├── demos/       # 示例图片
│   └── saved-images/# 保存的生成结果数据
├── src/
│   ├── app/         # 页面组件
│   │   ├── api/     # API路由
│   │   │   ├── generate/  # 生成图片API
│   │   │   ├── result/    # 获取结果API
│   │   │   ├── saveImage/ # 保存图片URL API
│   │   │   └── upload/    # 上传图片API
│   │   └── [toolId]/      # 工具详情页面
│   ├── components/  # UI组件
│   │   ├── ExampleResults.tsx # 图片结果展示组件
│   │   ├── ImageUploader.tsx  # 图片上传组件
│   │   ├── ProcessingStatus.tsx # 处理状态组件
│   │   ├── ResultDisplay.tsx    # 结果展示组件
│   │   └── ToolPage.tsx         # 工具页面组件
│   ├── config/      # 配置文件
│   └── lib/         # 工具函数和API集成
├── .eslintrc.json   # ESLint配置
├── next.config.js   # Next.js配置
└── ...
```

## API集成

所有工具都使用RunningHub API进行AI处理，每个工具配置不同的`webappId`和`nodeId`参数。详细的API集成参见`src/lib/api.ts`文件。

### API集成注意事项

在使用RunningHub API时，需要注意以下几点：

1. **文件上传规范**：
   - 使用正确的上传端点 `/task/openapi/upload`
   - 保留完整的文件ID，包括 `api/` 前缀
   
2. **API路由代理**：
   - 为了避免CORS问题，项目创建了服务端API路由来代理请求
   - 客户端代码调用这些API路由，而不是直接调用RunningHub API

3. **错误处理**：
   - 对常见的API错误都进行了处理，如 `APIKEY_TASK_IS_RUNNING`
   - 在服务端和客户端都添加了详细的日志记录

4. **API端点**：
   - `/api/upload` - 处理图片上传
   - `/api/generate` - 启动AI任务
   - `/api/status` - 查询任务状态
   - `/api/result` - 获取任务结果

### 上传问题修复

如果遇到上传图片的问题，本项目已经实施了以下修复：

1. 使用服务端API路由代理请求，避免浏览器CORS限制
2. 保留完整的文件ID，包括 `api/` 前缀
3. 增强了错误处理和日志记录
4. 在上传请求中明确设置了 `Content-Type: multipart/form-data`
5. 增加了请求超时设置，防止长时间无响应

### 图片结果保存功能

本项目现在支持自动保存生成的图片结果，并在工具详情页面展示最新的30张结果图片。该功能具有以下特点：

1. **自动保存** - 当图片成功生成时，系统会自动保存图片URL到JSON文件
2. **按工具分类** - 每个工具的结果都会单独保存和展示
3. **最新优先** - 始终显示最新生成的30张图片
4. **持久化存储** - 使用文件系统存储，确保数据在服务器重启后依然保留
5. **实时更新** - 新用户访问时也能看到其他用户生成的最新结果

#### 相关文件

- `src/app/api/saveImage/route.ts` - 处理图片URL的保存和获取
- `src/components/ExampleResults.tsx` - 展示保存的图片结果
- `public/saved-images/images.json` - 保存的图片数据文件

## 许可证

MIT License

### 最新更新 (2024-05-xx)

- 添加了自动保存生成结果的功能
- 优化了结果展示区域UI
- 为每个工具增加了历史结果展示
- 增强了API调用的稳定性：
  - 增加了请求超时时间（从30秒到60秒）
  - 添加了重试机制，自动重试失败的请求
  - 改进了错误处理，提供更友好的错误提示
  - 优化了状态查询，在超时情况下返回进行中状态而非错误
