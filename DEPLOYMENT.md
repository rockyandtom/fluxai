# FluxAI 部署指南

本文档提供了部署FluxAI应用程序的详细步骤。

## 前提条件

- Node.js 18.x或更高版本
- 一个RunningHub API密钥
- 各工具的WebappID和NodeID

## 本地部署

1. 克隆仓库
   ```bash
   git clone https://github.com/rockyandtom/fluxai.git
   cd fluxai
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 创建`.env.local`文件并配置环境变量
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

4. 启动开发服务器
   ```bash
   npm run dev
   ```

5. 构建生产版本
   ```bash
   npm run build
   ```

6. 启动生产服务器
   ```bash
   npm start
   ```

## Vercel部署

### 自动部署（推荐）

1. 将代码推送到GitHub仓库

2. 在Vercel上注册并连接GitHub账户

3. 在Vercel中导入项目
   - 打开[Vercel](https://vercel.com)并登录
   - 点击"Add New"按钮，然后选择"Project"
   - 从列表中选择你的GitHub仓库
   - 配置项目设置，包括环境变量
   - 点击"Deploy"按钮

4. 环境变量配置
   - 在部署设置页面，添加与`.env.local`相同的环境变量
   - 确保所有环境变量都已正确设置

5. 自定义域名设置
   - 在项目设置中点击"Domains"
   - 添加自定义域名`fluxai.life`
   - 按照Vercel提供的说明更新域名的DNS设置

### 手动部署

1. 安装Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. 登录Vercel
   ```bash
   vercel login
   ```

3. 部署项目
   ```bash
   vercel --prod
   ```

## 故障排除

### 图片无法显示

确保在`next.config.ts`中已正确配置了远程图片域名：

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rh-images.xiaoyaoyou.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

### API调用失败

- 检查RunningHub API密钥是否正确
- 确认各工具的WebappID和NodeID配置正确
- 检查浏览器控制台中是否有错误消息
- 确保环境变量已正确设置

## 更新部署

当你对代码进行更改后，只需将更改推送到GitHub仓库，Vercel将自动重新部署你的应用。

如果使用Vercel CLI进行部署，运行以下命令来更新部署：

```bash
vercel --prod
``` 