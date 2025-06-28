import runninghubAPI from '../../../utils/runninghubAPI';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { webappId, nodeInfoList } = req.body;

  if (!webappId || !nodeInfoList || !Array.isArray(nodeInfoList) || nodeInfoList.length === 0) {
    return res.status(400).json({ error: 'Missing required parameters: webappId or nodeInfoList.' });
  }

  const data = {
    webappId: String(webappId),
    apiKey: process.env.RUNNINGHUB_API_KEY,
    nodeInfoList: nodeInfoList.map(n => ({
      nodeId: String(n.nodeId),
      fieldName: n.fieldName,
      fieldValue: n.fieldValue,
    })),
  };

  try {
    const responseData = await runninghubAPI.post('/task/openapi/ai-app/run', data);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Run handler error:', error);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.message || 'Internal Server Error';
    res.status(statusCode).json({ error: errorMessage, details: error.response?.data });
  }
} 