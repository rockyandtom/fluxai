import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

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

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Flux AI
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/create" className="text-gray-700 hover:text-purple-600">{t('创作')}</Link>
            <Link to="/tutorials" className="text-gray-700 hover:text-purple-600">{t('教程')}</Link>
            <Link to="/gallery" className="text-gray-700 hover:text-purple-600">{t('作品展示')}</Link>
            <Link to="/why-us" className="text-gray-700 hover:text-purple-600">{t('为何选择我们')}</Link>
            <Link to="/pricing" className="text-gray-700 hover:text-purple-600">{t('价格方案')}</Link>
            <Link to="/faq" className="text-gray-700 hover:text-purple-600">{t('常见问题')}</Link>
            <Link to="/blog" className="text-gray-700 hover:text-purple-600">{t('学习中心')}</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <button
                onClick={() => window.location.href = '/#/dashboard'}
                className="flex items-center focus:outline-none"
                title={user.displayName || user.email || '用户中心'}
              >
                <img
                  src={user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || user.email || 'U')}
                  alt="用户头像"
                  className="w-10 h-10 rounded-full border-2 border-purple-400 shadow"
                />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-purple-600">{t('登录')}</Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90">
                  {t('开始使用')}
                </Link>
              </>
            )}
            <LangSwitchBtn />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 