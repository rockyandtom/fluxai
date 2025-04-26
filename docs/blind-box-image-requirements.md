# 3D Blind-box Figurine 图片需求

## 功能图片需求

为了完成 3D Blind-box Figurine (3D盲盒人偶) 工具的实现，需要准备以下图片：

### 1. 前后对比图片

需要准备以下两个文件，并放置在 `public/thumbnails/` 目录下：

- `blind-box-before.jpg` - 原始人物照片
- `blind-box-after.jpg` - 转换成3D盲盒风格的照片

图片规格要求：
- 尺寸：640 x 480 像素
- 宽高比：4:3
- 文件格式：JPG 或 WEBP（推荐WEBP以获得更好的压缩率）
- 文件大小：建议不超过100KB

### 2. 示例图片（可选）

可以准备2-4张示例图片，放置在 `public/demos/blind-box/` 目录下：
- `demo1.jpg`
- `demo2.jpg`
- 等等...

这些图片将用于工具详情页面的示例展示区域。

## 理想的原始图片特征

为了获得最佳的3D盲盒效果，建议使用以下特征的原始照片：

1. **清晰的人物肖像**：
   - 正面或略侧面肖像照
   - 面部表情清晰可见
   - 单人照片效果最佳（避免多人照）

2. **图片质量**：
   - 光线充足
   - 对比度适中
   - 背景简单，不要太复杂或嘈杂

3. **人物特征**：
   - 面部特征明显（如明显的发型、大眼睛等）
   - 有特色的服装或配饰

## 临时解决方案

在正式图片准备好之前，系统会使用默认的占位图片：
- `/thumbnails/before-placeholder.jpg`
- `/thumbnails/after-placeholder.jpg`
- `/thumbnails/placeholder.svg`

上述占位图片已经存在于系统中，无需额外准备。 