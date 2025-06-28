import runninghubAPI from '../../../utils/runninghubAPI';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'Missing required parameter: taskId' });
  }

  try {
    const responseData = await runninghubAPI.post('/task/openapi/outputs', {
      apiKey: process.env.RUNNINGHUB_API_KEY,
      taskId: taskId,
    });

    // 寻找第一个有效的文件（图片或视频）
    const resultItem = responseData?.find(item => 
      item.fileUrl && (
        !item.fileType || // 如果没有fileType但有URL，也接受
        ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4'].some(ext => item.fileType.toLowerCase().includes(ext))
      )
    );

    if (resultItem) {
      res.status(200).json({ 
        success: true,
        imageUrl: resultItem.fileUrl, 
        taskCostTime: resultItem.taskCostTime || null, // 返回时长，如果不存在则为null
      });
    } else {
      res.status(404).json({ success: false, error: 'No valid output file found.' });
    }

  } catch (error) {
    console.error('Result handler error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
} 