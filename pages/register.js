import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Navbar from '../components/Navbar';

export default function Register() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // 如果用户已经登录，重定向到创作中心
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/create');
    }
  }, [status, session, router]);

  useEffect(() => {
    // 每次页面加载时，清空表单
    setEmail('');
    setPassword('');
    setError('');
    setIsLoading(false);
    setIsGoogleLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 处理后端返回的特定错误信息 (如 409 Conflict)
        throw new Error(data.message || '注册失败');
      }

      // 注册成功
      toast({
        title: t('auth.register.success'),
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
      
      // 立即尝试为新用户登录
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        // 如果自动登录失败，引导用户去登录页面
        router.push('/login');
      } else {
        // 自动登录成功，跳转到创作中心
        router.push('/create');
      }

    } catch (error) {
      // 捕获所有错误 (包括 fetch 失败和后端返回的错误)
      setError(error.message);
      toast({
        title: t('auth.register.error'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/create',
        redirect: true,
      });
    } catch (error) {
      toast({
        title: t('auth.register.error'),
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
                {t('auth.register.title')}
              </Text>
              <Text color="gray.300">
                {t('auth.register.subtitle')}
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
                  <VStack spacing="4">
                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<FcGoogle />}
                      onClick={handleGoogleRegister}
                      isLoading={isGoogleLoading}
                      loadingText={t('auth.register.googleSignUpLoading')}
                      borderColor="rgba(255, 255, 255, 0.2)"
                      color="white"
                      _hover={{ 
                        bg: 'rgba(255, 255, 255, 0.1)', 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-1px)'
                      }}
                      transition="all 0.2s"
                    >
                      {t('auth.register.googleSignUp')}
                    </Button>
                    <Text color="gray.400">{t('auth.register.or')}</Text>
                  </VStack>
                  <Stack spacing="5">
                    <FormControl isInvalid={!!error}>
                      <FormLabel htmlFor="email" color="white">{t('auth.register.email')}</FormLabel>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.register.emailPlaceholder')}
                        required
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        color="white"
                        _placeholder={{ color: 'gray.400' }}
                        _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
                      />
                    </FormControl>
                    <FormControl isInvalid={!!error}>
                      <FormLabel htmlFor="password" color="white">{t('auth.register.password')}</FormLabel>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('auth.register.passwordPlaceholder')}
                        required
                        autoComplete="new-password"
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
                      loadingText={t('auth.register.signingUp')}
                      _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      {t('auth.register.signUp')}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Box>
            <Stack pt={6}>
              <Text align={'center'} color="gray.300">
                {t('auth.common.hasAccount')}{' '}
                <Link as={NextLink} href="/login" color={'blue.400'} _hover={{ color: 'blue.300' }}>
                  {t('auth.common.login')}
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