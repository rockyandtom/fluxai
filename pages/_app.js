import 'styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import Head from 'next/head';

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
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>Flux AI</title>
          <meta name="description" content="Flux AI - Your Intelligent Creative Partner" />
          {/* Google tag (gtag.js) */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-D1MZFL0J94"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-D1MZFL0J94');
              `,
            }}
          />
        </Head>
        <Navbar />
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp); 