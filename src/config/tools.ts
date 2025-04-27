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

// 占位图片 - 使用确保存在的图片
const PLACEHOLDER_IMAGE = "/thumbnails/ghibli-before.jpg"; 
const BEFORE_PLACEHOLDER = "/thumbnails/ghibli-before.jpg";
const AFTER_PLACEHOLDER = "/thumbnails/ghibli-after.jpg";

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
    thumbnail: "/thumbnails/ghibli-before.jpg",
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
    thumbnail: "/thumbnails/polaroid-before.jpg",
    beforeImage: "/thumbnails/polaroid-before.jpg",
    afterImage: "/thumbnails/polaroid-after.jpg",
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
    thumbnail: "/thumbnails/FourpanelComic-before.jpg",
    beforeImage: "/thumbnails/FourpanelComic-before.jpg",
    afterImage: "/thumbnails/FourpanelComic-after.jpg",
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "id-photo",
    name: "Perfect ID Photos",
    description: "Create professional passport and ID photos with perfect standards",
    webappId: process.env.NEXT_PUBLIC_ID_PHOTO_WEBAPP_ID || '1881214058983563265',
    nodeId: process.env.NEXT_PUBLIC_ID_PHOTO_NODE_ID || '265',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/PerfectIDPhotos-before.jpg",
    beforeImage: "/thumbnails/PerfectIDPhotos-before.jpg",
    afterImage: "/thumbnails/PerfectIDPhotos-after.jpg",
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "digital-human",
    name: "Digital Human",
    description: "Transform your photos into anthropomorphic digital human images",
    webappId: process.env.NEXT_PUBLIC_DIGITAL_HUMAN_WEBAPP_ID || '1914267264068087810',
    nodeId: process.env.NEXT_PUBLIC_DIGITAL_HUMAN_NODE_ID || '226',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/DigitalHuman-before.jpg",
    beforeImage: "/thumbnails/DigitalHuman-before.jpg",
    afterImage: "/thumbnails/DigitalHuman-after.jpg",
    demoImages: [
      PLACEHOLDER_IMAGE,
      PLACEHOLDER_IMAGE,
    ]
  },
  {
    id: "blind-box",
    name: "3D Blind-box Figurine",
    description: "Transform your photos into cute 3D blind-box figurine style",
    webappId: process.env.NEXT_PUBLIC_BLIND_BOX_WEBAPP_ID || '1911985272408502273',
    nodeId: process.env.NEXT_PUBLIC_BLIND_BOX_NODE_ID || '226',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/3DBlind-before.jpg",
    beforeImage: "/thumbnails/3DBlind-before.jpg",
    afterImage: "/thumbnails/3DBlind-after.jpg",
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