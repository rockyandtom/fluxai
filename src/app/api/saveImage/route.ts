import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';

// 保存图片链接的文件路径
const IMAGES_FILE_PATH = resolve('./public/saved-images');
const IMAGES_JSON_PATH = join(IMAGES_FILE_PATH, 'images.json');

// 确保目录存在
try {
  if (!existsSync(IMAGES_FILE_PATH)) {
    console.log(`Creating directory: ${IMAGES_FILE_PATH}`);
    mkdirSync(IMAGES_FILE_PATH, { recursive: true });
  }
  
  // 确保JSON文件存在
  if (!existsSync(IMAGES_JSON_PATH)) {
    console.log(`Creating empty JSON file: ${IMAGES_JSON_PATH}`);
    writeFileSync(IMAGES_JSON_PATH, '{}', 'utf-8');
  }
} catch (error) {
  console.error('Error initializing saved-images directory:', error);
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
      const parsed = JSON.parse(data);
      console.log(`Successfully read saved images data with ${Object.keys(parsed).length} tools`);
      return parsed;
    } else {
      console.log(`Images JSON file not found, returning empty object`);
      return {};
    }
  } catch (error) {
    console.error('Error reading saved images data:', error);
    // 如果解析出错，返回空对象并尝试创建新文件
    try {
      writeFileSync(IMAGES_JSON_PATH, '{}', 'utf-8');
      console.log('Created new empty images.json file');
    } catch (writeError) {
      console.error('Failed to create new images.json file:', writeError);
    }
    return {};
  }
}

// 保存图片数据到文件系统
function saveImages(data: SavedImagesData): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    console.log(`Saving data to ${IMAGES_JSON_PATH}, data size: ${jsonString.length} bytes`);
    
    writeFileSync(IMAGES_JSON_PATH, jsonString, 'utf-8');
    console.log(`Successfully saved images data with ${Object.keys(data).length} tools`);
    
    // 验证文件是否正确写入
    if (existsSync(IMAGES_JSON_PATH)) {
      const fileStats = require('fs').statSync(IMAGES_JSON_PATH);
      console.log(`File saved successfully, size: ${fileStats.size} bytes`);
    } else {
      console.error(`File not found after saving: ${IMAGES_JSON_PATH}`);
    }
  } catch (error) {
    console.error('Error saving images data:', error);
    throw error; // Re-throw to handle in caller
  }
}

export async function POST(request: Request) {
  try {
    // 获取请求数据
    const data = await request.json();
    const { toolId, imageUrl } = data;
    
    console.log(`POST request to saveImage received with toolId: ${toolId}`);
    
    if (!toolId || !imageUrl) {
      console.log('Missing required parameters:', { toolId, imageUrl: imageUrl ? '[exists]' : '[missing]' });
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // 验证图片URL格式
    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
      console.error('Invalid image URL format:', imageUrl);
      return NextResponse.json(
        { success: false, error: 'Invalid image URL format' },
        { status: 400 }
      );
    }
    
    // 判断URL是否是有效的图片URL
    if (!imageUrl.match(/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) &&
        !imageUrl.includes('runninghub.cn') && 
        !imageUrl.includes('rh-images.xiaoyaoyou.com')) {
      console.warn('URL may not be a valid image:', imageUrl);
      // 继续处理，但记录警告
    }
    
    console.log(`Saving image for tool ${toolId}, URL: ${imageUrl.substring(0, 50)}...`);
    
    // 获取保存的图片数据
    const savedImages = getSavedImages();
    
    // 如果该工具没有保存过图片，初始化数组
    if (!savedImages[toolId]) {
      console.log(`Initializing new array for tool ${toolId}`);
      savedImages[toolId] = [];
    }
    
    // 检查是否已存在相同URL，避免重复
    const exists = savedImages[toolId].some(item => item.imageUrl === imageUrl);
    if (exists) {
      console.log(`Image URL already exists for tool ${toolId}, skipping save`);
      return NextResponse.json({
        success: true,
        message: 'Image already exists'
      });
    }
    
    // 添加新图片，确保每个工具最多保存30个图片
    savedImages[toolId].unshift({
      imageUrl,
      timestamp: Date.now()
    });
    
    // 限制每个工具只保存最新的30张图片
    if (savedImages[toolId].length > 30) {
      console.log(`Trimming images for tool ${toolId} to 30 (from ${savedImages[toolId].length})`);
      savedImages[toolId] = savedImages[toolId].slice(0, 30);
    }
    
    // 保存更新后的数据
    saveImages(savedImages);
    
    // 返回成功结果
    return NextResponse.json({
      success: true,
      message: 'Image saved successfully',
      toolId,
      imagesCount: savedImages[toolId].length
    });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save image: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');
    
    console.log(`Getting saved images${toolId ? ` for tool ${toolId}` : ' for all tools'}`);
    
    // 获取保存的图片数据
    const savedImages = getSavedImages();
    
    // 如果提供了工具ID，只返回该工具的图片
    if (toolId) {
      const images = savedImages[toolId] || [];
      console.log(`Returning ${images.length} images for tool ${toolId}`);
      
      return NextResponse.json({
        success: true,
        images: images
      });
    }
    
    // 否则返回所有图片
    console.log(`Returning all saved images for ${Object.keys(savedImages).length} tools`);
    return NextResponse.json({
      success: true,
      images: savedImages
    });
  } catch (error) {
    console.error('Error retrieving saved images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve images' },
      { status: 500 }
    );
  }
} 