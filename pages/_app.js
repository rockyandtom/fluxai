import 'styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  colors: {
    brand: {
      50: '#E6F6FF',
      100: '#BAE3FF',
      200: '#7CC4FA',
      300: '#47A3F3',
      400: '#2186EB',
      500: '#0967D2',
      600: '#0552B5',
      700: '#03449E',
      800: '#01337D',
      900: '#002159',
    },
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // 语言持久化处理
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language');
      const currentLocale = router.locale;
      
      // 如果有保存的语言偏好且与当前语言不同，则切换
      if (savedLanguage && savedLanguage !== currentLocale && ['en', 'zh'].includes(savedLanguage)) {
        router.push(router.asPath, router.asPath, { locale: savedLanguage });
      }
    }
  }, []);

  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>Flux AI</title>
          <meta name="description" content="Flux AI - Your Intelligent Creative Partner" />
        </Head>
        <Navbar />
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp); 