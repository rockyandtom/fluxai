import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const MAX_LOGIN_ATTEMPTS = 5;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, loginAttempts } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      newErrors.password = '请输入密码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await signInWithEmail(formData.email, formData.password);
        console.log('登录成功，准备跳转到首页');
        navigate('/');
      } catch (error: any) {
        console.error('登录错误:', error);
        let errorMessage = '登录失败，请检查账号密码';
        
        // 处理Firebase特定错误
        if (error.code === 'auth/user-not-found') {
          errorMessage = '用户不存在';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = '密码错误';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = '无效的邮箱地址';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = '账户已被禁用';
        } else if (error.message.includes('账户已被锁定')) {
          errorMessage = error.message;
        }
        
        setErrors({ submit: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      console.log('谷歌登录成功，准备跳转到首页');
      navigate('/');
    } catch (error) {
      console.error('谷歌登录错误:', error);
      setErrors({ submit: `谷歌登录失败: ${error instanceof Error ? error.message : '未知错误'}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前邮箱的登录尝试信息
  const currentAttempts = loginAttempts[formData.email];
  const remainingAttempts = currentAttempts ? MAX_LOGIN_ATTEMPTS - currentAttempts.count : MAX_LOGIN_ATTEMPTS;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('登录账号')}</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          或{' '}
          <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            {t('注册新账号')}
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.submit && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {t(errors.submit)}
            </div>
          )}

          {currentAttempts && currentAttempts.count > 0 && (
            <div className="mb-4 p-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg">
              {t('剩余登录尝试次数')}: {remainingAttempts}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('邮箱地址')}</label>
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
                {errors.email && <p className="mt-2 text-sm text-red-600">{t(errors.email)}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('密码')}</label>
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
                {errors.password && <p className="mt-2 text-sm text-red-600">{t(errors.password)}</p>}
              </div>
              <div className="text-right mt-2">
                <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">{t('忘记密码？')}</a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? '登录中...' : '登录'}
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
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={isLoading}
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                {isLoading ? '登录中...' : '使用谷歌账号登录'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 