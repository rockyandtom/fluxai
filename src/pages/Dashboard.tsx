import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/'); // 登出后跳转到首页
    } catch (error) {
      console.error('登出错误:', error);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 pt-24 w-full max-w-5xl">
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 text-center md:text-left">工作台</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              退出登录
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">账户信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">邮箱</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">账户ID</label>
                <p className="mt-1 text-sm text-gray-900">{user?.uid}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">邮箱验证状态</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.emailVerified ? (
                    <span className="text-green-600">已验证</span>
                  ) : (
                    <span className="text-red-600">未验证</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">快速开始</h3>
              <p className="text-sm opacity-90 mb-4">
                开始使用AI助手，探索无限可能
              </p>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors">
                开始对话
              </button>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">历史记录</h3>
              <p className="text-sm opacity-90 mb-4">
                查看您的历史对话记录
              </p>
              <button className="bg-white text-pink-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 transition-colors">
                查看记录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 