import React, { useState } from 'react';

const API_BASE_URL = 'https://www.runninghub.cn';
const API_KEY = 'fb88fac46b0349c1986c9cbb4f14d44e';
const WEBAPP_ID = '1913616063358271489';
const NODE_ID = '51';

const Chibify: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 上传图片
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/task/openapi/upload?apiKey=${API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result.code !== 0) throw new Error(result.msg || '上传失败');
    return result.data.fileName;
  };

  // 发起AI任务
  const runAITask = async (fileId: string): Promise<{ taskId: string }> => {
    const data = {
      webappId: WEBAPP_ID,
      apiKey: API_KEY,
      nodeInfoList: [
        { nodeId: NODE_ID, fieldName: 'image', fieldValue: fileId }
      ]
    };
    const response = await fetch(`${API_BASE_URL}/task/openapi/ai-app/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'www.runninghub.cn'
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (result.code !== 0 || !result.data) throw new Error(result.msg || '任务创建失败');
    return { taskId: result.data.taskId };
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string): Promise<void> => {
    let status = '';
    let retry = 0;
    while (retry < 60) {
      const response = await fetch(`${API_BASE_URL}/task/openapi/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Host': 'www.runninghub.cn'
        },
        body: JSON.stringify({ apiKey: API_KEY, taskId })
      });
      const result = await response.json();
      if (result.code !== 0) throw new Error(result.msg || '获取状态失败');
      status = typeof result.data === 'string' ? result.data : result.data.status;
      if (status === 'SUCCESS' || status === 'COMPLETED') return;
      if (status === 'FAILED' || status === 'ERROR') throw new Error('任务执行失败');
      await new Promise(r => setTimeout(r, 3000));
      retry++;
    }
    throw new Error('任务超时，请稍后重试');
  };

  // 获取任务结果
  const getTaskResult = async (taskId: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/task/openapi/outputs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': 'www.runninghub.cn'
      },
      body: JSON.stringify({ apiKey: API_KEY, taskId })
    });
    const result = await response.json();
    if (result.code !== 0) throw new Error(result.msg || '获取结果失败');
    if (result.data && Array.isArray(result.data) && result.data[0]?.fileUrl) {
      return result.data[0].fileUrl;
    }
    throw new Error('未获取到图片结果');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const fileId = await uploadImage(image);
      const { taskId } = await runAITask(fileId);
      await pollTaskStatus(taskId);
      const imageUrl = await getTaskResult(taskId);
      setResult(imageUrl);
    } catch (err: any) {
      setError(err.message || '请求失败，请检查网络或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex flex-col items-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-auto">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-6 text-center">Chibify 体验</h2>
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-pink-500 file:via-purple-500 file:to-blue-500 file:text-white hover:file:opacity-90"
            required
          />
          <button
            type="submit"
            disabled={loading || !image}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成我的3D玩偶'}
          </button>
        </form>
        {error && <div className="mt-6 text-red-500 text-center">{error}</div>}
        {result && (
          <div className="mt-8 text-center">
            <h3 className="text-xl font-bold mb-4">生成结果</h3>
            <img src={result} alt="Chibify 结果" className="mx-auto rounded-2xl shadow-lg max-h-80" />
            <a href={result} download className="block mt-4 text-blue-600 hover:underline">下载图片</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chibify; 