// 工具配置接口
export interface ToolConfig {
  id: string;        // 工具ID，用于路由
  name: string;      // 工具名称
  description: string; // 工具描述
  webappId: string;  // RunningHub WebappID
  nodeId: string;    // RunningHub NodeID
  apiKey: string;    // API密钥
  thumbnail: string; // 缩略图URL（兼容旧版）
  beforeImage?: string; // 原始图片URL（左侧）
  afterImage?: string; // 处理后图片URL（右侧）
  demoImages: string[]; // 演示图片
}

// API Key
const API_KEY = 'fb88fac46b0349c1986c9cbb4f14d44e';

// 占位图片
const PLACEHOLDER_IMAGE = "/thumbnails/placeholder.svg";
const BEFORE_PLACEHOLDER = "/thumbnails/before-placeholder.jpg";
const AFTER_PLACEHOLDER = "/thumbnails/after-placeholder.jpg";

// 打印图片路径，以便调试
console.log('占位图片路径:', { 
  PLACEHOLDER_IMAGE,
  BEFORE_PLACEHOLDER,
  AFTER_PLACEHOLDER
});

// 工具配置列表
export const tools: ToolConfig[] = [
  {
    id: "ghibli",
    name: "Ghibli AI",
    description: "Transform your photos into Studio Ghibli animation style",
    webappId: process.env.NEXT_PUBLIC_GHIBLI_WEBAPP_ID || '1907296046433886210',
    nodeId: process.env.NEXT_PUBLIC_GHIBLI_NODE_ID || '365',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/ghibli.svg",
    beforeImage: "/thumbnails/ghibli-before.jpg",
    afterImage: "/thumbnails/ghibli-after.jpg",
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "polaroid",
    name: "Polaroid Style",
    description: "Transform your photos into vintage Polaroid-style images",
    webappId: '1912088541617422337',
    nodeId: '226',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/polaroid.svg",
    beforeImage: BEFORE_PLACEHOLDER,
    afterImage: AFTER_PLACEHOLDER,
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "four-panel-comic",
    name: "Four-panel Comic",
    description: "Turn your photo into a four-panel comic strip",
    webappId: process.env.NEXT_PUBLIC_FOUR_PANEL_COMIC_WEBAPP_ID || '1909559296592441345',
    nodeId: process.env.NEXT_PUBLIC_FOUR_PANEL_COMIC_NODE_ID || '226',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/comic.svg",
    beforeImage: "/thumbnails/four-panel-comic-before.jpg",
    afterImage: "/thumbnails/four-panel-comic-after.jpg",
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "cartoon",
    name: "Cartoon Effect",
    description: "Transform your photos into cartoon-style artwork",
    webappId: 'cartoon_webapp_id',
    nodeId: 'cartoon_node_id',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/cartoon.svg",
    beforeImage: BEFORE_PLACEHOLDER,
    afterImage: AFTER_PLACEHOLDER,
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "sketch",
    name: "Sketch Style",
    description: "Convert your photos into pencil sketches",
    webappId: 'sketch_webapp_id',
    nodeId: 'sketch_node_id',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/sketch.svg",
    beforeImage: BEFORE_PLACEHOLDER,
    afterImage: AFTER_PLACEHOLDER,
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "anime",
    name: "Anime Portrait",
    description: "Transform your portrait into anime style",
    webappId: 'anime_webapp_id',
    nodeId: 'anime_node_id',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/anime.svg",
    beforeImage: BEFORE_PLACEHOLDER,
    afterImage: AFTER_PLACEHOLDER,
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Convert your photos into oil painting style",
    webappId: 'oil_painting_webapp_id',
    nodeId: 'oil_painting_node_id',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/oil-painting.svg",
    beforeImage: BEFORE_PLACEHOLDER,
    afterImage: AFTER_PLACEHOLDER,
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    description: "Transform your images into retro pixel art",
    webappId: 'pixel_art_webapp_id',
    nodeId: 'pixel_art_node_id',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/pixel-art.svg",
    beforeImage: BEFORE_PLACEHOLDER,
    afterImage: AFTER_PLACEHOLDER,
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  }
];

// 根据ID获取工具配置
export function getToolById(id: string): ToolConfig | undefined {
  return tools.find(tool => tool.id === id);
} 