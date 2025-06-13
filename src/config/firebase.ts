import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// Firebase 配置（Create React App 推荐用 process.env.REACT_APP_XXX）
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
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
  console.warn('注意：Firebase环境变量未完全配置，登录功能将不可用');
  console.warn('缺少环境变量:', missingEnvVars.join(', '));
}

// 初始化 Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let googleProvider: GoogleAuthProvider | undefined;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  if (isFirebaseConfigured) {
    console.log('Firebase 初始化成功', firebaseConfig);
  }
} catch (error) {
  console.warn('Firebase 初始化失败:', error);
  console.warn('登录功能将不可用');
}

// 导出安全的实例
export { auth, googleProvider, isFirebaseConfigured };
export default app;
