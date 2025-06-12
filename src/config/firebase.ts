import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
};

// 检查环境变量是否完整，但不中断应用
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.warn('注意：缺少以下环境变量:', missingEnvVars.join(', '));
  console.warn('Firebase 功能可能无法正常工作，请检查.env.local文件');
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 获取 Auth 实例
export const auth = getAuth(app);

// 创建 Google 认证提供者
export const googleProvider = new GoogleAuthProvider();

// 添加客户端ID
if (process.env.REACT_APP_GOOGLE_CLIENT_ID) {
  googleProvider.setCustomParameters({
    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
  });
} else {
  console.warn('未设置谷歌客户端ID，谷歌登录可能无法正常工作');
}

// 调试信息
console.log('Firebase 初始化完成，环境变量状态:');
console.log('API Key:', process.env.REACT_APP_FIREBASE_API_KEY ? '已设置' : '未设置');
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID ? '已设置' : '未设置');

export default app; 