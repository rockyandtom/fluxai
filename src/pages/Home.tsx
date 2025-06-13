import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

const API_BASE_URL = 'https://www.runninghub.cn';
const API_KEY = 'fb88fac46b0349c1986c9cbb4f14d44e';
const WEBAPP_ID = '1913616063358271489';
const NODE_ID = '51';

const detailKeys = [
  { key: 'gpt4o', title: 'compare.gpt4o.title', subtitle: 'compare.gpt4o.subtitle', link: 'compare.gpt4o.link', detail: 'compare.gpt4o.detail' },
  { key: 'midjourney', title: 'compare.midjourney.title', subtitle: 'compare.midjourney.subtitle', link: 'compare.midjourney.link', detail: 'compare.midjourney.detail' },
  { key: 'metaai', title: 'compare.metaai.title', subtitle: 'compare.metaai.subtitle', link: 'compare.metaai.link', detail: 'compare.metaai.detail' },
  { key: 'grokai', title: 'compare.grokai.title', subtitle: 'compare.grokai.subtitle', link: 'compare.grokai.link', detail: 'compare.grokai.detail' },
  { key: 'freepikai', title: 'compare.freepikai.title', subtitle: 'compare.freepikai.subtitle', link: 'compare.freepikai.link', detail: 'compare.freepikai.detail' },
  { key: 'geminiai', title: 'compare.geminiai.title', subtitle: 'compare.geminiai.subtitle', link: 'compare.geminiai.link', detail: 'compare.geminiai.detail' }
];

const Home: React.FC = () => {
  // Chibify相关状态
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [, setLang] = useState(i18n.language);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, []);

  useEffect(() => {
    const handler = () => setLang(i18n.language);
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [i18n]);

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
    <>
      <Helmet>
        <title>Flux AI: Leading AI Art Style Generation Platform</title>
        <meta name="description" content="Transform your images into stunning AI art with Flux AI. Our platform offers easy-to-use templates, powered by advanced AI technology, perfect for social media and creative projects. Start creating unique artwork today!" />
        <link rel="canonical" href="https://www.fluxai.life" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* 导航栏 */}
        <Navbar />

        {/* 主要内容 */}
        <main className="pt-24 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* Hero Section */}
          <section className="w-full max-w-3xl mx-auto px-2 sm:px-4 lg:px-8 py-10 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8">
                {t('FLUX AI: Innovators in the field of AI image generation')}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
                {t('使用最先进的AI技术，将您的创意转化为令人惊叹的艺术作品。无需专业技能，即刻开始创作！')}
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                <Link to="/create" className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold hover:opacity-90 w-full md:w-auto text-center">
                  {t('开始创作')}
                </Link>
                <Link to="/tutorials" className="px-8 py-4 rounded-full border-2 border-purple-600 text-purple-600 text-lg font-semibold hover:bg-purple-50 w-full md:w-auto text-center">
                  {t('查看教程')}
                </Link>
              </div>
            </div>
          </section>

          {/* 功能展示区 */}
          <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-10 md:py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">{t('Free AI Art with Flux AI: Generate Stunning Images Instantly')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('一键生成')}</h3>
                <p className="text-gray-600">{t('上传图片，选择风格，即刻获得AI生成的艺术作品')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('多样风格')}</h3>
                <p className="text-gray-600">{t('提供多种艺术风格，满足不同创作需求')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('简单易用')}</h3>
                <p className="text-gray-600">{t('无需专业技能，轻松上手，快速创作')}</p>
              </div>
            </div>
          </section>

          {/* 为什么选择Flux AI */}
          <section className="max-w-7xl mx-auto px-4 py-16">
            <div className="bg-white rounded-3xl shadow-2xl p-1 w-full mx-auto bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border border-transparent" style={{boxShadow:'0 8px 32px 0 rgba(99,102,241,0.12)'}}> 
              <div className="bg-white rounded-3xl p-14">
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6 text-center">{t('why_fluxai_title')}</h2>
                <p className="text-lg text-gray-700 mb-12 text-center">{t('why_fluxai_intro')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <h3 className="text-xl font-bold">{t('why_fluxai_comfyui_title')}</h3>
                    <p className="text-gray-700 text-base">{t('why_fluxai_comfyui_desc')}</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V5a4 4 0 00-8 0v2m8 0v2a4 4 0 01-8 0V7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold">{t('why_fluxai_lora_title')}</h3>
                    <p className="text-gray-700 text-base">{t('why_fluxai_lora_desc')}</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h1v-4h1" /></svg>
                    </div>
                    <h3 className="text-xl font-bold">{t('why_fluxai_pro_title')}</h3>
                    <p className="text-gray-700 text-base">{t('why_fluxai_pro_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 功能介绍区块 */}
          <section className="max-w-3xl mx-auto px-4 py-20">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-6">{t('AI一键生成图像，释放您的创造力')}</h2>
              <p className="text-lg text-gray-700 mb-8">{t('使用FLUX AI即可一键生成图像，打造您的3D卡通形象')}</p>
              <button
                onClick={() => {
                  if (user) {
                    window.location.href = '/#/chibify';
                  } else {
                    window.location.href = '/#/login';
                  }
                }}
                className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-xl shadow-lg hover:opacity-90 transition"
              >
                {t('立即体验')}
              </button>
            </div>
          </section>

          {/* 教程区域 */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">{t('Design AI Artwork with Flux AI (Step-by-Step Tutorial)')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">{t('新手入门')}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">1</span>
                    </span>
                    <p className="text-gray-600">{t('注册账号并登录')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">2</span>
                    </span>
                    <p className="text-gray-600">{t('上传您的图片')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">3</span>
                    </span>
                    <p className="text-gray-600">{t('选择您喜欢的风格')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-semibold">4</span>
                    </span>
                    <p className="text-gray-600">{t('等待AI生成结果')}</p>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">{t('进阶技巧')}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-semibold">1</span>
                    </span>
                    <p className="text-gray-600">{t('尝试不同的风格组合')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-semibold">2</span>
                    </span>
                    <p className="text-gray-600">{t('调整参数获得最佳效果')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-semibold">3</span>
                    </span>
                    <p className="text-gray-600">{t('保存和分享您的作品')}</p>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-semibold">4</span>
                    </span>
                    <p className="text-gray-600">{t('探索更多创作可能')}</p>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 作品展示区 */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">{t('Best AI Art Styles for Social Media')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-1.jpg" alt="AI Art 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-2.jpg" alt="AI Art 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-3.jpg" alt="AI Art 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-4.jpg" alt="AI Art 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-5.jpg" alt="AI Art 5" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-6.jpg" alt="AI Art 6" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-7.jpg" alt="AI Art 7" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img src="/images/ai-art-8.jpg" alt="AI Art 8" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
          </section>

          {/* 竞品对比区 */}
          <section className="w-full flex flex-col items-center py-20 bg-transparent">
            <h2 className="text-3xl font-bold text-center mb-12">{t('Flux AI vs Competitors: Why Choose Us')}</h2>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
              {detailKeys.map((item) => (
                <div
                  key={item.key}
                  className="bg-white rounded-2xl shadow-lg px-8 py-6 flex flex-col justify-between h-56 min-h-[14rem] max-h-60 relative transition hover:shadow-2xl"
                >
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{t(item.title)}</h3>
                    <div className="text-base text-gray-600 mb-4 line-clamp-2">{t(item.subtitle)}</div>
                  </div>
                  <a
                    href={`#/compare/${item.key}`}
                    className="absolute right-8 bottom-6 inline-block px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold shadow hover:opacity-90 transition"
                  >
                    {t('learn_more')}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* 常见问题区 */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">
              <a href="#/faq" className="hover:text-purple-600 transition cursor-pointer">{t('Troubleshooting Common Flux AI Issues')}</a>
            </h2>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-10 shadow-lg w-full max-w-6xl">
                <h3 className="text-xl font-semibold mb-6 text-center">{t('常见问题')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_what_is_fluxai')}</h4>
                    <p className="text-gray-600">{t('faq_brief_what_is_fluxai')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_templates_work')}</h4>
                    <p className="text-gray-600">{t('faq_brief_templates_work')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_free')}</h4>
                    <p className="text-gray-600">{t('faq_brief_free')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_upload')}</h4>
                    <p className="text-gray-600">{t('faq_brief_upload')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_styles')}</h4>
                    <p className="text-gray-600">{t('faq_brief_styles')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_easy')}</h4>
                    <p className="text-gray-600">{t('faq_brief_easy')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_not_right')}</h4>
                    <p className="text-gray-600">{t('faq_brief_not_right')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_different')}</h4>
                    <p className="text-gray-600">{t('faq_brief_different')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_copyright')}</h4>
                    <p className="text-gray-600">{t('faq_brief_copyright')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_quality')}</h4>
                    <p className="text-gray-600">{t('faq_brief_quality')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_slow')}</h4>
                    <p className="text-gray-600">{t('faq_brief_slow')}</p>
                  </div>
                  <div className="transition-shadow hover:shadow-2xl rounded-xl border border-gray-100 p-6 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-2">{t('faq_q_api')}</h4>
                    {i18n.language === 'en' ? (
                      <p className="text-gray-600">
                        For information regarding developer access or API availability for Flux AI's image generation capabilities, please refer to our dedicated "Developers" or "API" section on the Flux AI website, or contact our business development team. We are always exploring ways to expand the reach of Flux AI technology.
                      </p>
                    ) : (
                      <p className="text-gray-600">{t('faq_brief_api')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 价格方案区 */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <h2 className="text-3xl font-bold text-center mb-12">{t('Flux AI Subscription Plans & Pricing')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">{t('基础版')}</h3>
                <p className="text-3xl font-bold mb-4">{t('免费')}</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">{t('每日5次生成')}</li>
                  <li className="flex items-center text-gray-600">{t('基础风格模板')}</li>
                </ul>
                <button className="w-full py-2 rounded-full border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50">
                  {t('开始使用')}
                </button>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-600">
                <h3 className="text-xl font-semibold mb-4">{t('专业版')}</h3>
                <p className="text-3xl font-bold mb-4">{t('¥99/月')}</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">{t('无限次生成')}</li>
                  <li className="flex items-center text-gray-600">{t('所有风格模板')}</li>
                  <li className="flex items-center text-gray-600">{t('优先处理')}</li>
                </ul>
                <button className="w-full py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90">
                  {t('立即升级')}
                </button>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">{t('企业版')}</h3>
                <p className="text-3xl font-bold mb-4">{t('联系销售')}</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">{t('定制化服务')}</li>
                  <li className="flex items-center text-gray-600">{t('API接口')}</li>
                  <li className="flex items-center text-gray-600">{t('专属客服')}</li>
                </ul>
                <button className="w-full py-2 rounded-full border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50">
                  {t('联系我们')}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* 页脚 */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('关于我们')}</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('公司简介')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('加入我们')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('联系我们')}</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('产品服务')}</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('AI艺术生成')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('风格模板')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('API接口')}</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('帮助中心')}</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('使用教程')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('常见问题')}</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">{t('技术支持')}</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('关注我们')}</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              <p>&copy; 2024 Flux AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

const LangSwitchBtn: React.FC = () => {
  const { i18n } = useTranslation();
  return (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}
      className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm text-gray-700"
    >
      {i18n.language === 'zh' ? 'English' : '中文'}
    </button>
  );
};

export default Home; 