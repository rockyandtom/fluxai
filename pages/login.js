import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Link,
  useToast,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import NextLink from 'next/link';
import Navbar from '../components/Navbar';

export default function Login() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    // 每次页面加载或路由变化时，处理错误提示并清空表单
    setEmail('');
    setPassword('');
    setError('');

    if (router.query.error) {
      let errorMessage = '';
      switch (router.query.error) {
        case 'CredentialsSignin':
          errorMessage = t('auth.login.credentialsError');
          break;
        case 'AuthenticationFailed':
          errorMessage = t('auth.login.authFailed');
          break;
        default:
          errorMessage = t('auth.login.serverError');
      }
      setError(errorMessage);
      toast({
        title: t('auth.login.error'),
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [router.asPath, router.query.error, t, toast]);

  // 如果用户已经登录，重定向到创作中心
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/create');
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result.error) {
      let errorMessage = '';
      if (result.error === 'CredentialsSignin') {
        errorMessage = t('auth.login.credentialsError');
      } else {
        errorMessage = t('auth.login.serverError');
      }
      setError(errorMessage);
      toast({
        title: t('auth.login.error'),
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } else {
      toast({
        title: t('auth.login.success'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      router.push('/create');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/create',
        redirect: true,
      });
    } catch (error) {
      toast({
        title: t('auth.login.error'),
        description: t('auth.login.googleError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <Box bg="#0a0a0a" minH="100vh">
      <Navbar />
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        {status === 'loading' ? (
          <Stack spacing="8" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {t('common.loading')}
            </Text>
          </Stack>
        ) : status === 'authenticated' ? (
          <Stack spacing="8" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="white">
              正在跳转...
            </Text>
          </Stack>
        ) : (
          <Stack spacing="8">
            <Stack spacing="6" textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="white" className="hero-title">
                {t('auth.login.title')}
              </Text>
              <Text color="gray.300">
                {t('auth.login.subtitle')}
              </Text>
            </Stack>
            <Box
              py={{ base: '0', sm: '8' }}
              px={{ base: '4', sm: '10' }}
              bg="rgba(255, 255, 255, 0.05)"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              boxShadow="xl"
              borderRadius={{ base: 'none', sm: 'xl' }}
              className="modern-card"
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing="6">
                  <Stack spacing="5">
                    <FormControl isInvalid={!!error}>
                      <FormLabel htmlFor="email" color="white">{t('auth.login.email')}</FormLabel>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.login.emailPlaceholder')}
                        required
                        autoComplete="email"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                      />
                    </FormControl>
                    <FormControl isInvalid={!!error}>
                      <FormLabel htmlFor="password" color="white">{t('auth.login.password')}</FormLabel>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.login.passwordPlaceholder')}
                        required
                        autoComplete="current-password"
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                      />
                      {error && <FormErrorMessage color="red.300">{error}</FormErrorMessage>}
                    </FormControl>
                  </Stack>
                  <Stack spacing="4">
                    <Button
                      type="submit"
                      colorScheme="blue"
                      isLoading={isLoading}
                      loadingText={t('auth.login.signingIn')}
                      _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      {t('auth.login.signIn')}
                    </Button>
                    <VStack spacing="4">
                      <Text color="gray.400">{t('auth.login.or')}</Text>
                      <Button
                        w="full"
                        variant="outline"
                        leftIcon={<FcGoogle />}
                        onClick={handleGoogleSignIn}
                        isLoading={isGoogleLoading}
                        loadingText={t('auth.login.googleSignInLoading')}
                        borderColor="rgba(255, 255, 255, 0.2)"
                        color="white"
                        _hover={{ 
                          bg: 'rgba(255, 255, 255, 0.1)', 
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translateY(-1px)'
                        }}
                        transition="all 0.2s"
                      >
                        {t('auth.login.googleSignIn')}
                      </Button>
                    </VStack>
                  </Stack>
                </Stack>
              </form>
            </Box>
            <Stack pt={6}>
              <Text align={'center'} color="gray.300">
                {t('auth.common.noAccount')}{' '}
                <Link as={NextLink} href="/register" color={'blue.400'} _hover={{ color: 'blue.300' }}>
                  {t('auth.common.register')}
                </Link>
              </Text>
            </Stack>
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 