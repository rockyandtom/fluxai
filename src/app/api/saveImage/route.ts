import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';

// 保存图片链接的文件路径
const IMAGES_FILE_PATH = resolve('./public/saved-images');
const IMAGES_JSON_PATH = join(IMAGES_FILE_PATH, 'images.json');

// 确保目录存在
if (!existsSync(IMAGES_FILE_PATH)) {
  mkdirSync(IMAGES_FILE_PATH, { recursive: true });
}

// 初始化图片数据结构
interface SavedImagesData {
  [toolId: string]: {
    imageUrl: string;
    timestamp: number;
  }[];
}

// 读取保存的图片数据
function getSavedImages(): SavedImagesData {
  try {
    if (existsSync(IMAGES_JSON_PATH)) {
      const data = readFileSync(IMAGES_JSON_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取保存的图片数据时出错:', error);
  }
  
  // 如果文件不存在或解析出错，返回空对象
  return {};
}

// 保存图片数据
function saveImages(data: SavedImagesData): void {
  try {
    writeFileSync(IMAGES_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('保存图片数据时出错:', error);
  }
}

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const data = await request.json();
    const { toolId, imageUrl } = data;
    
    if (!toolId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 获取保存的图片数据
    const savedImages = getSavedImages();
    
    // 如果该工具没有保存过图片，初始化数组
    if (!savedImages[toolId]) {
      savedImages[toolId] = [];
    }
    
    // 添加新图片，确保每个工具最多保存30个图片
    savedImages[toolId].unshift({
      imageUrl,
      timestamp: Date.now()
    });
    
    // 限制每个工具只保存最新的30张图片
    if (savedImages[toolId].length > 30) {
      savedImages[toolId] = savedImages[toolId].slice(0, 30);
    }
    
    // 保存更新后的数据
    saveImages(savedImages);
    
    // 返回成功结果
    return NextResponse.json({
      success: true,
      message: '图片保存成功'
    });
  } catch (error) {
    console.error('保存图片时出错:', error);
    return NextResponse.json(
      { success: false, error: '保存图片失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');
    
    // 获取保存的图片数据
    const savedImages = getSavedImages();
    
    // 如果提供了工具ID，只返回该工具的图片
    if (toolId) {
      return NextResponse.json({
        success: true,
        images: savedImages[toolId] || []
      });
    }
    
    // 否则返回所有图片
    return NextResponse.json({
      success: true,
      images: savedImages
    });
  } catch (error) {
    console.error('获取保存的图片时出错:', error);
    return NextResponse.json(
      { success: false, error: '获取图片失败' },
      { status: 500 }
    );
  }
} 