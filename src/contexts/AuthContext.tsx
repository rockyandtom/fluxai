import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  registerWithEmail: (email: string, password: string) => Promise<User>;
  loginAttempts: Record<string, { count: number; lastAttempt: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState<Record<string, { count: number; lastAttempt: number }>>({});
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 10 * 60 * 1000; // 10分钟锁定

  useEffect(() => {
    console.log('AuthProvider 初始化');
    console.log('环境变量检查 (AuthProvider):');
    console.log('GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID ? '已设置' : '未设置');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('认证状态变化:', user ? '用户已登录' : '用户未登录');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    console.log('AuthContext: 开始谷歌登录流程');
    console.log('googleProvider 配置:', googleProvider);
    
    try {
      console.log('尝试弹出谷歌登录窗口');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('谷歌登录成功, 用户信息:', result.user.email);
      setUser(result.user);
    } catch (error) {
      console.error('AuthContext - Google 登录错误:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('登出错误:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    // 检查是否被锁定
    const attempts = loginAttempts[email];
    const now = Date.now();
    if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
      if (now - attempts.lastAttempt < LOCK_TIME) {
        throw new Error('账户已被锁定，请稍后再试');
      } else {
        // 锁定期已过，重置计数
        setLoginAttempts(prev => ({ ...prev, [email]: { count: 0, lastAttempt: 0 } }));
      }
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      // 登录成功，重置尝试次数
      setLoginAttempts(prev => ({ ...prev, [email]: { count: 0, lastAttempt: 0 } }));
      return result.user;
    } catch (error) {
      // 登录失败，增加尝试次数
      setLoginAttempts(prev => {
        const prevAttempts = prev[email] || { count: 0, lastAttempt: 0 };
        return {
          ...prev,
          [email]: {
            count: prevAttempts.count + 1,
            lastAttempt: Date.now(),
          },
        };
      });
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    setUser(result.user);
    return result.user;
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    signInWithEmail,
    registerWithEmail,
    loginAttempts,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 