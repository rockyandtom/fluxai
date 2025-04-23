// 工具配置接口
export interface ToolConfig {
  id: string;        // 工具ID，用于路由
  name: string;      // 工具名称
  description: string; // 工具描述
  webappId: string;  // RunningHub WebappID
  nodeId: string;    // RunningHub NodeID
  apiKey: string;    // API密钥
  thumbnail: string; // 缩略图URL
  demoImages: string[]; // 演示图片
}

// API Key
const API_KEY = 'fb88fac46b0349c1986c9cbb4f14d44e';

// 占位图片
const PLACEHOLDER_IMAGE = "/thumbnails/placeholder.svg";

// 工具配置列表
export const tools: ToolConfig[] = [
  {
    id: "polaroid",
    name: "Polaroid Style",
    description: "Transform your photos into vintage Polaroid-style images",
    webappId: '1912088541617422337',
    nodeId: '226',
    apiKey: API_KEY,
    thumbnail: "/thumbnails/polaroid.svg",
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