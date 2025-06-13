// TEST-20240613-VERIFY
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';

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
            <div className="hidden md:flex items-center flex-nowrap space-x-4 ml-10 min-w-0 overflow-x-auto">
              {menuItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-gray-700 hover:text-purple-600 whitespace-nowrap"
                >
                  {t(item.label)}
                </Link>
              ))}
            </div>
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
      {menuOpen && ReactDOM.createPortal(
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-[99998] bg-black bg-opacity-20"
            onClick={() => setMenuOpen(false)}
          />
          {/* 左侧抽屉菜单 */}
          <div
            className="fixed inset-y-0 left-0 z-[99999] w-4/5 max-w-xs flex flex-col bg-white shadow-2xl transition-transform duration-300 overflow-y-auto"
            style={{
              opacity: 1,
              filter: 'none',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none',
              isolation: 'isolate',
              willChange: 'transform'
            }}
          >
            {/* 顶部Logo和关闭按钮紧凑排列 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => setMenuOpen(false)}>
                Flux AI
              </Link>
              <button className="ml-2 p-1" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">
                <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* 菜单内容整体下移，左对齐，字号适中，行高加大 */}
            <div className="flex-1 flex flex-col justify-start px-8 pt-6 space-y-6">
              {menuItems.map(item => (
                <Link key={item.to} to={item.to} className="text-gray-800 hover:text-purple-600 text-lg font-medium py-2 border-b border-gray-100" onClick={() => setMenuOpen(false)}>
                  {t(item.label)}
                </Link>
              ))}
              <div className="flex flex-col space-y-4 pt-4">
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
                    <Link to="/login" className="text-gray-700 hover:text-purple-600 text-lg py-2" onClick={() => setMenuOpen(false)}>{t('登录')}</Link>
                    <Link to="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 text-lg text-center" onClick={() => setMenuOpen(false)}>
                      {t('开始使用')}
                    </Link>
                  </>
                )}
                <LangSwitchBtn />
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
  );
};

export default Navbar; 