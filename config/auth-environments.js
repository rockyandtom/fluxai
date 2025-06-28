/* @preserve 
 * 认证环境配置管理
 * 用于管理不同环境下的NextAuth配置
 * 创建时间: 2025-06-28
 */

/**
 * 认证配置环境枚举
 */
export const AUTH_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION_SQLITE: 'production_sqlite', // 当前使用
  PRODUCTION_POSTGRESQL: 'production_postgresql', // 数据库迁移后使用
};

/**
 * 根据环境获取认证配置
 */
export const getAuthConfig = () => {
  const environment = process.env.AUTH_ENVIRONMENT || AUTH_ENVIRONMENTS.PRODUCTION_SQLITE;
  
  const configs = {
    [AUTH_ENVIRONMENTS.DEVELOPMENT]: {
      providers: ['google', 'credentials'],
      database: {
        enabled: true,
        type: 'sqlite',
        url: 'file:./prisma/dev.db'
      },
      features: {
        userRegistration: true,
        passwordLogin: true,
        dataStorage: true
      }
    },
    
    [AUTH_ENVIRONMENTS.PRODUCTION_SQLITE]: {
      providers: ['google'], // 仅支持Google登录
      database: {
        enabled: false, // 禁用数据库
        type: 'none'
      },
      features: {
        userRegistration: false,
        passwordLogin: false,
        dataStorage: false
      }
    },
    
    [AUTH_ENVIRONMENTS.PRODUCTION_POSTGRESQL]: {
      providers: ['google', 'credentials'],
      database: {
        enabled: true,
        type: 'postgresql',
        url: process.env.DATABASE_URL
      },
      features: {
        userRegistration: true,
        passwordLogin: true,
        dataStorage: true
      }
    }
  };

  return configs[environment];
};

/**
 * 检查当前环境是否支持特定功能
 */
export const isFeatureEnabled = (feature) => {
  const config = getAuthConfig();
  return config.features[feature] || false;
};

/**
 * 获取当前环境描述
 */
export const getCurrentEnvironmentInfo = () => {
  const environment = process.env.AUTH_ENVIRONMENT || AUTH_ENVIRONMENTS.PRODUCTION_SQLITE;
  const config = getAuthConfig();
  
  return {
    environment,
    description: getEnvironmentDescription(environment),
    supportedProviders: config.providers,
    databaseEnabled: config.database.enabled,
    features: config.features
  };
};

function getEnvironmentDescription(environment) {
  const descriptions = {
    [AUTH_ENVIRONMENTS.DEVELOPMENT]: '开发环境 - 完整功能',
    [AUTH_ENVIRONMENTS.PRODUCTION_SQLITE]: '生产环境 - 简化版本（仅Google登录）',
    [AUTH_ENVIRONMENTS.PRODUCTION_POSTGRESQL]: '生产环境 - 完整功能（PostgreSQL）'
  };
  
  return descriptions[environment];
} 