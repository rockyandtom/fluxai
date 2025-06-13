# 贡献指南

感谢您对FluxAI项目的关注！我们欢迎所有形式的贡献，包括但不限于新功能、错误修复、文档改进等。

## 开发环境设置

1. Fork本仓库
2. 克隆您的fork到本地
   ```bash
   git clone https://github.com/YOUR_USERNAME/fluxai.git
   cd fluxai
   ```
3. 安装依赖
   ```bash
   npm install
   ```
4. 创建一个新分支
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 添加新工具

如果您想添加新的AI图像处理工具，请按照以下步骤操作：

1. 在`src/config/tools.ts`文件中添加新工具的配置
   ```typescript
   {
     id: "your-tool-id",
     name: "Your Tool Name",
     description: "Description of what your tool does",
     webappId: process.env.NEXT_PUBLIC_YOUR_TOOL_WEBAPP_ID || 'default_webapp_id',
     nodeId: process.env.NEXT_PUBLIC_YOUR_TOOL_NODE_ID || 'default_node_id',
     apiKey: API_KEY,
     thumbnail: "/thumbnails/your-tool.jpg", // 添加缩略图
     demoImages: [
       "/demos/your-tool/demo1.jpg",
       "/demos/your-tool/demo2.jpg",
     ]
   }
   ```

2. 在`.env.local`文件中添加相应的环境变量
   ```
   NEXT_PUBLIC_YOUR_TOOL_WEBAPP_ID=actual_webapp_id
   NEXT_PUBLIC_YOUR_TOOL_NODE_ID=actual_node_id
   ```

3. 添加工具的缩略图和演示图片
   - 在`public/thumbnails/`目录下添加缩略图
   - 在`public/demos/your-tool/`目录下添加演示图片

## 代码风格

- 使用TypeScript编写所有新代码
- 使用ESLint和Prettier保持代码风格一致
- 遵循函数式组件和React Hooks的最佳实践
- 保持组件的单一职责
- 添加适当的注释和类型定义

## 提交代码

1. 确保代码通过所有测试
   ```bash
   npm run test
   ```

2. 提交您的更改
   ```bash
   git add .
   git commit -m "描述您的更改"
   ```

3. 将您的分支推送到GitHub
   ```bash
   git push origin feature/your-feature-name
   ```

4. 创建一个Pull Request

## Pull Request指南

- 清晰描述您的更改
- 包含任何相关的截图或演示
- 引用相关的issues
- 确保代码通过CI/CD检查
- 保持PR的关注点集中，一个PR解决一个问题

## 报告问题

如果您发现任何问题或有改进建议，请在GitHub issues中提出，包括：

- 问题的详细描述
- 重现步骤
- 预期行为和实际行为
- 浏览器和操作系统信息
- 相关的截图

感谢您的贡献！ 