import { NextResponse } from 'next/server';

// 创建内存缓存存储图片数据，用于无服务器环境
const MEMORY_CACHE: {
  [toolId: string]: {
    imageUrl: string;
    timestamp: number;
  }[];
} = {};

// 初始化图片数据结构
interface SavedImagesData {
  [toolId: string]: {
    imageUrl: string;
    timestamp: number;
  }[];
}

// 获取图片数据的接口
function getSavedImages(): SavedImagesData {
  console.log('Getting saved images from memory cache');
  return MEMORY_CACHE;
}

// 保存图片数据的接口
function saveImages(data: SavedImagesData): void {
  console.log(`Saving images data to memory cache with ${Object.keys(data).length} tools`);
  // 深拷贝对象，避免引用问题
  Object.keys(data).forEach(key => {
    MEMORY_CACHE[key] = [...data[key]];
  });
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
      message: 'Image saved successfully (memory mode)',
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
    
    console.log(`Getting saved images${toolId ? ` for tool ${toolId}` : ' for all tools'} from memory cache`);
    
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
      { success: false, error: 'Failed to retrieve images: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 