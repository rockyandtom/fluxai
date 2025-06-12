import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:demo'
};

// 检查环境变量是否完整
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
const isFirebaseConfigured = missingEnvVars.length === 0;

if (!isFirebaseConfigured) {
  console.warn('注意：Firebase环境变量未完全配置，使用演示配置');
  console.warn('缺少环境变量:', missingEnvVars.join(', '));
  console.warn('登录功能将不可用，但网站其他功能正常');
}

// 初始化 Firebase
let app;
let auth;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  // 添加客户端ID
  if (process.env.REACT_APP_GOOGLE_CLIENT_ID && isFirebaseConfigured) {
    googleProvider.setCustomParameters({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
    });
  }

  if (isFirebaseConfigured) {
    console.log('Firebase 初始化成功');
  }
} catch (error) {
  console.warn('Firebase 初始化失败:', error);
  console.warn('登录功能将不可用，但网站其他功能正常');
}

// 导出安全的实例
export { auth, googleProvider, isFirebaseConfigured };
export default app; 