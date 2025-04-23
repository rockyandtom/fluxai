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
const API_KEY = process.env.NEXT_PUBLIC_RUNNINGHUB_API_KEY || 'your_api_key';

// 占位图片
const PLACEHOLDER_IMAGE = "/thumbnails/placeholder.svg";

// 工具配置列表
export const tools: ToolConfig[] = [
  {
    id: "polaroid",
    name: "Polaroid Style",
    description: "Transform your photos into vintage Polaroid-style images",
    webappId: process.env.NEXT_PUBLIC_POLAROID_WEBAPP_ID || '1912088541617422337',
    nodeId: process.env.NEXT_PUBLIC_POLAROID_NODE_ID || '226',
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
    webappId: process.env.NEXT_PUBLIC_CARTOON_WEBAPP_ID || 'cartoon_webapp_id',
    nodeId: process.env.NEXT_PUBLIC_CARTOON_NODE_ID || 'cartoon_node_id',
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
    webappId: process.env.NEXT_PUBLIC_SKETCH_WEBAPP_ID || 'sketch_webapp_id',
    nodeId: process.env.NEXT_PUBLIC_SKETCH_NODE_ID || 'sketch_node_id',
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
    webappId: process.env.NEXT_PUBLIC_ANIME_WEBAPP_ID || 'anime_webapp_id',
    nodeId: process.env.NEXT_PUBLIC_ANIME_NODE_ID || 'anime_node_id',
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
    webappId: process.env.NEXT_PUBLIC_OIL_PAINTING_WEBAPP_ID || 'oil_painting_webapp_id',
    nodeId: process.env.NEXT_PUBLIC_OIL_PAINTING_NODE_ID || 'oil_painting_node_id',
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
    webappId: process.env.NEXT_PUBLIC_PIXEL_ART_WEBAPP_ID || 'pixel_art_webapp_id',
    nodeId: process.env.NEXT_PUBLIC_PIXEL_ART_NODE_ID || 'pixel_art_node_id',
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