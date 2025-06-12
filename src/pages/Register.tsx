import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 添加环境变量检查
  useEffect(() => {
    console.log('Register组件加载，环境变量检查:');
    console.log('GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID ? '已设置' : '未设置');
    console.log('FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? '已设置' : '未设置');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('输入变化:', name, value); // 调试日志
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    console.log('开始验证表单'); // 调试日志
    const newErrors: Record<string, string> = {};
    
    // 邮箱验证
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少为8位';
    }

    // 确认密码验证
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    console.log('验证结果:', newErrors); // 调试日志
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('表单提交'); // 调试日志
    if (validateForm()) {
      setIsLoading(true);
      try {
        // TODO: 实现邮箱注册逻辑
        console.log('注册表单提交:', formData);
        // 注册成功后跳转到信息完善页面
        navigate('/complete-profile');
      } catch (error) {
        console.error('注册错误:', error);
        setErrors({ submit: '注册失败，请稍后重试' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('尝试谷歌登录开始'); // 调试日志
    console.log('signInWithGoogle 函数是否存在:', !!signInWithGoogle);
    setIsLoading(true);
    try {
      if (typeof signInWithGoogle !== 'function') {
        throw new Error('Google登录函数未正确定义');
      }
      await signInWithGoogle();
      console.log('谷歌登录成功'); // 调试日志
      // 谷歌登录成功后跳转到信息完善页面
      navigate('/complete-profile');
    } catch (error) {
      console.error('谷歌登录错误:', error);
      setErrors({ submit: `谷歌登录失败: ${error instanceof Error ? error.message : '未知错误'}` });
    } finally {
      setIsLoading(false);
      console.log('谷歌登录流程结束');
    }
  };

  // 检查 Firebase 配置
  console.log('Firebase 配置:', {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '已设置' : '未设置',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '已设置' : '未设置',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '已设置' : '未设置',
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          创建新账号
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.submit && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {errors.submit}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? '注册中...' : '注册'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isLoading}
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                {isLoading ? '登录中...' : '使用谷歌账号注册'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 