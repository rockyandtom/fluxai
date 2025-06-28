import runninghubAPI from '../../../utils/runninghubAPI';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'Missing required parameter: taskId' });
  }

  try {
    const responseData = await runninghubAPI.post('/task/openapi/status', {
      apiKey: process.env.RUNNINGHUB_API_KEY,
      taskId: taskId,
    });
    // The interceptor already handles code checking and returns `data`
    res.status(200).json({ status: responseData });
  } catch (error) {
    console.error('Status handler error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
} 