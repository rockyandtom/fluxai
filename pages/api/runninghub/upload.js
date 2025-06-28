import fs from 'fs';
import FormData from 'form-data';
import formidable from 'formidable';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    let file = files.file;
    if (Array.isArray(file)) file = file[0];
    console.log('files.file:', file);
    
    if (!file) {
      return res.status(400).json({ error: '未上传文件' });
    }
    
    const filePath = file.filepath || file.path;
    const fileName = file.originalFilename || file.name;
    
    if (!filePath) {
      return res.status(400).json({ error: '文件路径不存在，无法读取文件' });
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), fileName);
    
    const response = await axios.post(
      `${process.env.RUNNINGHUB_API_URL}/task/openapi/upload?apiKey=${process.env.RUNNINGHUB_API_KEY}`,
      formData,
      { 
        headers: formData.getHeaders(),
        timeout: 30000, // 30秒超时
      }
    );
    
    if (response.data.code !== 0) {
      return res.status(500).json({ error: response.data.msg || '上传失败' });
    }
    
    return res.status(200).json({ fileId: response.data.data.fileName });
    
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message || '上传失败' });
  }
} 