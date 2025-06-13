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

const menuItems = [
  { to: '/create', label: '创作' },
  { to: '/tutorials', label: '教程' },
  { to: '/gallery', label: '作品展示' },
  { to: '/why-us', label: '为何选择我们' },
  { to: '/pricing', label: '价格方案' },
  { to: '/faq', label: '常见问题' },
  { to: '/blog', label: '学习中心' },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Flux AI
            </Link>
          </div>
          {/* PC端菜单 */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map(item => (
              <Link key={item.to} to={item.to} className="text-gray-700 hover:text-purple-600">{t(item.label)}</Link>
            ))}
          </div>
          {/* PC端右侧 */}
          <div className="hidden md:flex items-center space-x-4">
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
          {/* 移动端汉堡按钮 */}
          <button className="md:hidden flex items-center px-2 py-1" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* 移动端弹出菜单 */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end md:hidden">
          <div className="w-64 bg-white h-full shadow-lg flex flex-col p-6 relative animate-slideInRight">
            <button className="absolute top-4 right-4" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">
              <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-8 mt-2">
              <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => setMenuOpen(false)}>
                Flux AI
              </Link>
            </div>
            <div className="flex flex-col space-y-6">
              {menuItems.map(item => (
                <Link key={item.to} to={item.to} className="text-gray-700 hover:text-purple-600 text-lg" onClick={() => setMenuOpen(false)}>{t(item.label)}</Link>
              ))}
            </div>
            <div className="flex flex-col space-y-4 mt-8">
              {user ? (
                <button
                  onClick={() => { setMenuOpen(false); window.location.href = '/#/dashboard'; }}
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
                  <Link to="/login" className="text-gray-700 hover:text-purple-600 text-lg" onClick={() => setMenuOpen(false)}>{t('登录')}</Link>
                  <Link to="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 text-lg text-center" onClick={() => setMenuOpen(false)}>
                    {t('开始使用')}
                  </Link>
                </>
              )}
              <LangSwitchBtn />
            </div>
          </div>
          {/* 点击遮罩关闭菜单 */}
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
};

export default Navbar; 