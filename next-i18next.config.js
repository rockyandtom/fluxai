const path = require('path');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'zh',
    locales: ['en', 'zh'],
    localeDetection: false, // 禁用自动语言检测，避免冲突
  },
  defaultNS: 'common',
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  react: { useSuspense: false }, // Recommended for Next.js < 13
  fallbackLng: {
    default: ['zh'],
    en: ['zh'],
  },
  debug: process.env.NODE_ENV === 'development',
}; 