import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

const detailKeys = [
  { key: 'gpt4o', link: 'compare.gpt4o.link', detail: 'compare.gpt4o.detail' },
  { key: 'midjourney', link: 'compare.midjourney.link', detail: 'compare.midjourney.detail' },
  { key: 'metaai', link: 'compare.metaai.link', detail: 'compare.metaai.detail' },
  { key: 'grokai', link: 'compare.grokai.link', detail: 'compare.grokai.detail' },
  { key: 'freepikai', link: 'compare.freepikai.link', detail: 'compare.freepikai.detail' },
  { key: 'geminiai', link: 'compare.geminiai.link', detail: 'compare.geminiai.detail' }
];

const CompareDetail: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { t } = useTranslation();
  const item = detailKeys.find(i => i.key === type);

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="bg-white p-8 rounded shadow text-center">
            <h2 className="text-2xl font-bold mb-4">{t('未找到对比内容')}</h2>
            <p className="text-gray-600">{t('请检查链接或返回首页')}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24 pb-12">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6">{t(item.link)}</h1>
          <p className="text-gray-700 text-lg mb-8">{t(item.detail)}</p>
          <a href="/#/" className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition">{t('返回首页')}</a>
        </div>
      </div>
    </>
  );
};

export default CompareDetail; 