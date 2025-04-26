# 图片需求

## Digital Human 工具图片需求

为了完成 Digital Human (数字人像) 工具的实现，需要准备以下图片：

### 1. 前后对比图片

需要准备以下两个文件，并放置在 `public/thumbnails/` 目录下：

- `digital-human-before.jpg` - 原始人像照片
- `digital-human-after.jpg` - 转换成数字人像效果的照片

图片规格要求：
- 尺寸：640 x 480 像素
- 宽高比：4:3
- 文件格式：JPG 或 WEBP（推荐WEBP以获得更好的压缩率）
- 文件大小：建议不超过100KB

### 2. 示例图片（可选）

可以准备2-4张示例图片，放置在 `public/demos/digital-human/` 目录下：
- `demo1.jpg`
- `demo2.jpg`
- 等等...

这些图片将用于工具详情页面的示例展示区域。

## 临时解决方案

在正式图片准备好之前，系统会使用默认的占位图片：
- `/thumbnails/before-placeholder.jpg`
- `/thumbnails/after-placeholder.jpg`
- `/thumbnails/placeholder.svg`

上述占位图片已经存在于系统中，无需额外准备。 