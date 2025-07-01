/* 
 * 🚀 NEW VERSION - 2025-06-30 
 * 现代化登录页面 - 完全重新设计的UI
 */
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  Box,
  Button,
  Container,
  Stack,
  Text,
  Link,
  useToast,
  VStack,
  HStack,
  Heading,
  Flex,
  Image,
  Icon,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import NextLink from 'next/link';
import Navbar from '../components/Navbar';

export default function Login() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    if (router.query.error) {
      let errorMessage = '';
      switch (router.query.error) {
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
          errorMessage = t('auth.loginNew.googleLoginFailed');
          break;
        default:
          errorMessage = t('auth.loginNew.loginFailed');
      }
      toast({
        title: t('auth.loginNew.loginError'),
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [router.query.error, toast]);

  // 如果用户已经登录，重定向到创作中心
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/create');
    }
  }, [status, session, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/create',
        redirect: true,
      });
    } catch (error) {
      toast({
        title: t('auth.loginNew.loginError'),
        description: t('auth.loginNew.googleLoginFailed'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setIsGoogleLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Box bg="#0a0a0a" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Box 
            w={12} 
            h={12} 
            border="4px solid rgba(255, 255, 255, 0.1)"
            borderTop="4px solid #3182ce"
            borderRadius="50%"
            animation="spin 1s linear infinite"
          />
          <Text fontSize="lg" fontWeight="medium" color="white">
            {t('auth.loginNew.loading')}
          </Text>
        </VStack>
      </Box>
    );
  }

  if (status === 'authenticated') {
    return (
      <Box bg="#0a0a0a" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Box color="green.400" fontSize="3xl">✓</Box>
          <Text fontSize="lg" fontWeight="medium" color="white">
            {t('auth.loginNew.loginSuccess')}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hero-title {
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      <Box bg="#0a0a0a" minH="100vh">
        <Navbar />
      
      {isMobile ? (
        // 移动端布局
        <Container maxW="md" py={8} px={4} minH="100vh">
          <Flex direction="column" justify="center" minH="calc(100vh - 100px)" position="relative">
            {/* 移动端背景装饰 */}
            <Box
              position="absolute"
              top="20%"
              left="-20%"
              w="180px"
              h="180px"
              bg="linear-gradient(45deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08))"
              rounded="full"
              filter="blur(40px)"
              animation="float 8s ease-in-out infinite"
            />
            <Box
              position="absolute"
              bottom="20%"
              right="-20%"
              w="150px"
              h="150px"
              bg="linear-gradient(45deg, rgba(236, 72, 153, 0.08), rgba(59, 130, 246, 0.08))"
              rounded="full"
              filter="blur(30px)"
              animation="float 10s ease-in-out infinite reverse"
            />
            <VStack spacing={6} w="full" position="relative" zIndex={1}>
              {/* 移动端头部区域 */}
              <VStack spacing={4} textAlign="center">
                <Box
                  p={3}
                  bg="linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.12))"
                  border="1px solid rgba(255, 255, 255, 0.15)"
                  borderRadius="xl"
                  backdropFilter="blur(15px)"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "scale(1.05)",
                    bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(147, 51, 234, 0.18))"
                  }}
                >
                  <Text fontSize="xl">🚀</Text>
                </Box>
                <VStack spacing={2}>
                  <Heading fontSize="xl" fontWeight="bold" color="white" className="hero-title">
                    {t('auth.loginNew.welcomeTitle')}
                  </Heading>
                  <Text color="gray.300" fontSize="sm" textAlign="center" maxW="280px" lineHeight="tall">
                    {t('auth.loginNew.welcomeDescription')}
                  </Text>
                </VStack>
              </VStack>

              {/* 移动端登录表单 */}
              <Box
                w="full"
                bg="rgba(255, 255, 255, 0.08)"
                backdropFilter="blur(24px)"
                border="1px solid rgba(255, 255, 255, 0.15)"
                borderRadius="xl"
                p={5}
                shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                position="relative"
                zIndex={1}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.12)",
                  transform: "translateY(-2px)",
                  shadow: "0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
              >
                <VStack spacing={4}>
                  <VStack spacing={2} textAlign="center">
                    <Heading color="white" size="sm" fontWeight="semibold">
                      {t('auth.loginNew.formTitle')}
                    </Heading>
                    <Text color="gray.400" fontSize="xs">
                      {t('auth.loginNew.formDescription')}
                    </Text>
                  </VStack>

                  <Button
                    w="full"
                    size="md"
                    leftIcon={<FcGoogle size="18" />}
                    onClick={handleGoogleSignIn}
                    isLoading={isGoogleLoading}
                    loadingText={t('auth.loginNew.loggingIn')}
                    bg="white"
                    color="black"
                    fontWeight="600"
                    fontSize="sm"
                    _hover={{ 
                      bg: 'gray.100',
                      transform: 'translateY(-1px)',
                      shadow: 'lg'
                    }}
                    _active={{ 
                      bg: 'gray.200',
                      transform: 'translateY(0)'
                    }}
                    borderRadius="lg"
                    py={5}
                    transition="all 0.2s"
                    shadow="md"
                  >
                    {t('auth.loginNew.googleButton')}
                  </Button>

                  <HStack spacing={2} color="gray.500" fontSize="2xs">
                    <Icon as={FaShieldAlt} size="10px" />
                    <Text>{t('auth.loginNew.secureTransmission')}</Text>
                  </HStack>

                  <Divider borderColor="rgba(255, 255, 255, 0.1)" />

                  <Text color="gray.400" fontSize="xs" textAlign="center">
                    {t('auth.loginNew.noAccount')}{' '}
                    <Link 
                      as={NextLink} 
                      href="/register" 
                      color="blue.400" 
                      fontWeight="600"
                      _hover={{ color: 'blue.300', textDecoration: 'none' }}
                    >
                      {t('auth.loginNew.registerNow')}
                    </Link>
                  </Text>
                </VStack>
              </Box>

              {/* 移动端底部说明 */}
              <Text color="gray.600" fontSize="xs" textAlign="center" fontStyle="italic" px={4} opacity={0.8}>
                {t('auth.loginNew.disclaimer')}
              </Text>
            </VStack>
          </Flex>
        </Container>
      ) : (
        // 桌面端布局 - 左右分屏，右侧背景延伸到底部
        <Box minH="100vh">
          <Flex h="100vh" position="relative">
            {/* 左侧 - 登录表单 */}
            <Flex
              w="50%"
              bg="#0a0a0a"
              alignItems="center"
              justifyContent="center"
              px={8}
              py={12}
              position="relative"
              minH="100vh"
            >
              {/* 左侧背景装饰 */}
              <Box
                position="absolute"
                top="20%"
                left="-10%"
                w="200px"
                h="200px"
                bg="linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))"
                rounded="full"
                filter="blur(40px)"
                animation="float 10s ease-in-out infinite"
              />

              <Box w="full" maxW="400px" position="relative" zIndex={1}>
                <VStack spacing={8} justify="center" minH="calc(100vh - 200px)">
                  {/* Logo和欢迎区域 */}
                  <VStack spacing={4} textAlign="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(147, 51, 234, 0.12))"
                      border="1px solid rgba(255, 255, 255, 0.15)"
                      borderRadius="xl"
                      backdropFilter="blur(15px)"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      _hover={{
                        transform: "scale(1.05)",
                        bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(147, 51, 234, 0.18))"
                      }}
                    >
                      <Text fontSize="2xl">🚀</Text>
                    </Box>
                    <VStack spacing={3}>
                      <Heading fontSize={{ base: "2xl", lg: "3xl" }} fontWeight="bold" color="white" className="hero-title">
                        {t('auth.loginNew.welcomeTitle')}
                      </Heading>
                      <Text color="gray.300" fontSize="md" maxW="320px" lineHeight="tall" textAlign="center">
                        {t('auth.loginNew.welcomeDescription')}
                      </Text>
                    </VStack>
                  </VStack>

                  {/* 登录表单 */}
                  <Box
                    w="full"
                    bg="rgba(255, 255, 255, 0.08)"
                    backdropFilter="blur(24px)"
                    border="1px solid rgba(255, 255, 255, 0.15)"
                    borderRadius="xl"
                    p={6}
                    shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.12)",
                      transform: "translateY(-2px)",
                      shadow: "0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <VStack spacing={5}>
                      <VStack spacing={2} textAlign="center" w="full">
                        <Heading color="white" size="md" fontWeight="600">
                          {t('auth.loginNew.formTitle')}
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                          {t('auth.loginNew.formDescription')}
                        </Text>
                      </VStack>

                      <Button
                        w="full"
                        size="md"
                        leftIcon={<FcGoogle size="20" />}
                        onClick={handleGoogleSignIn}
                        isLoading={isGoogleLoading}
                        loadingText={t('auth.loginNew.connectingGoogle')}
                        bg="white"
                        color="black"
                        fontWeight="600"
                        fontSize="sm"
                        _hover={{ 
                          bg: 'gray.100',
                          transform: 'translateY(-1px)',
                          shadow: 'lg'
                        }}
                        _active={{ 
                          bg: 'gray.200',
                          transform: 'translateY(0)'
                        }}
                        borderRadius="lg"
                        py={5}
                        transition="all 0.2s"
                        shadow="md"
                      >
                        {t('auth.loginNew.googleButton')}
                      </Button>

                      <HStack spacing={2} color="gray.500" fontSize="xs">
                        <Icon as={FaShieldAlt} size="12px" />
                        <Text>{t('auth.loginNew.secureTransmission')}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* 底部链接和说明 */}
                  <VStack spacing={3}>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      {t('auth.loginNew.noAccount')}{' '}
                      <Link 
                        as={NextLink} 
                        href="/register" 
                        color="blue.400" 
                        fontWeight="600"
                        _hover={{ 
                          color: 'blue.300', 
                          textDecoration: 'none',
                          transform: 'translateX(2px)',
                          transition: 'all 0.2s ease'
                        }}
                        transition="all 0.2s ease"
                      >
                        {t('auth.loginNew.registerNow')} →
                      </Link>
                    </Text>

                    <Text color="gray.600" fontSize="xs" textAlign="center" fontStyle="italic" opacity={0.8}>
                      {t('auth.loginNew.disclaimer')}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </Flex>

            {/* 右侧 - 产品宣传图片，背景延伸到底部 */}
            <Box
              position="absolute"
              top={0}
              right={0}
              w="50%"
              h="100vh"
              bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)"
              zIndex={0}
            />
            <Flex
              w="50%"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
              pt={20}
              pb={12}
              zIndex={1}
              minH="100vh"
            >
              {/* 右侧背景装饰 */}
              <Box
                position="absolute"
                top="15%"
                right="10%"
                w="180px"
                h="180px"
                bg="linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                rounded="full"
                filter="blur(40px)"
                animation="float 6s ease-in-out infinite"
              />
              <Box
                position="absolute"
                bottom="20%"
                left="10%"
                w="140px"
                h="140px"
                bg="linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))"
                rounded="full"
                filter="blur(30px)"
                animation="float 8s ease-in-out infinite reverse"
              />

              <VStack spacing={8} textAlign="center" maxW="500px" px={8} position="relative" zIndex={1} w="full" justify="center" minH="calc(100vh - 200px)">
                <VStack spacing={5}>
                  <Heading 
                    size="xl" 
                    color="white" 
                    className="hero-title"
                    lineHeight="shorter"
                    fontWeight="bold"
                  >
                    {t('auth.loginNew.promoTitle')}
                  </Heading>
                  
                  <Text color="gray.300" fontSize="lg" lineHeight="tall" maxW="400px">
                    {t('auth.loginNew.promoDescription')}
                  </Text>
                </VStack>

                {/* 宣传图片区域 - 放大并优化 */}
                <Box
                  position="relative"
                  w="full"
                  maxW="480px"
                  h="320px"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  borderRadius="xl"
                  overflow="hidden"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  shadow="0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                  _hover={{ 
                    bg: 'rgba(255, 255, 255, 0.08)',
                    transform: 'translateY(-4px)',
                    shadow: '0 32px 64px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <Image
                    src="/flux-ai-promo.jpg"
                    alt={t('home.hero.title')}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    borderRadius="xl"
                    quality={90}
                    fallback={
                      <VStack spacing={6} color="gray.400" p={8} h="100%" justify="center">
                        <Box 
                          fontSize="5xl"
                          p={6}
                          bg="linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))"
                          borderRadius="xl"
                          backdropFilter="blur(10px)"
                        >
                          🎨
                        </Box>
                        <VStack spacing={4}>
                          <Text fontWeight="bold" fontSize="xl" color="white">
                            {t('auth.loginNew.aiCreationTools')}
                          </Text>
                          <VStack spacing={2} fontSize="md">
                            <Text>✨ {t('auth.loginNew.features.imageGeneration')}</Text>
                            <Text>🎬 {t('auth.loginNew.features.videoGeneration')}</Text>
                            <Text>👤 {t('auth.loginNew.features.aiAvatar')}</Text>
                          </VStack>
                        </VStack>
                      </VStack>
                    }
                  />
                </Box>

                {/* 功能说明 */}
                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  borderRadius="lg"
                  p={3}
                  backdropFilter="blur(10px)"
                >
                  <Text color="gray.300" fontSize="sm" fontWeight="500">
                    {t('auth.loginNew.promoSlogan')}
                  </Text>
                </Box>
              </VStack>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 