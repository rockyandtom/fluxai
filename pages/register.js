import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
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
  Icon,
  useBreakpointValue,
  Divider,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { FaArrowRight, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Navbar from '../components/Navbar';

export default function Register() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // 如果用户已经登录，重定向到创作中心
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/create');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (router.query.error) {
      let errorMessage = '';
      switch (router.query.error) {
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
          errorMessage = t('auth.register.googleError');
          break;
        default:
          errorMessage = t('auth.register.error');
      }
      toast({
        title: t('auth.register.error'),
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [router.query.error, toast]);

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
        description: t('auth.register.googleError'),
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
            {t('auth.common.loading')}
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
            {t('auth.common.registerSuccess')}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
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
              bg="linear-gradient(45deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))"
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
              bg="linear-gradient(45deg, rgba(236, 72, 153, 0.08), rgba(16, 185, 129, 0.08))"
              rounded="full"
              filter="blur(30px)"
              animation="float 10s ease-in-out infinite reverse"
            />
              <VStack spacing={6} w="full" position="relative" zIndex={1}>
                              {/* 移动端头部区域 */}
                <VStack spacing={4} textAlign="center">
                  <Box
                    p={3}
                    bg="linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))"
                    border="1px solid rgba(255, 255, 255, 0.15)"
                    borderRadius="xl"
                    backdropFilter="blur(15px)"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      transform: "scale(1.05)",
                      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(59, 130, 246, 0.18))"
                    }}
                  >
                    <Text fontSize="xl">✨</Text>
                  </Box>
                  <VStack spacing={2}>
                    <Heading fontSize="xl" fontWeight="bold" color="white" className="hero-title">
                      {t('auth.register.welcomeTitle')}
                    </Heading>
                    <Text color="gray.300" fontSize="sm" textAlign="center" maxW="280px" lineHeight="tall">
                      {t('auth.register.welcomeDescription')}
                    </Text>
                  </VStack>
                </VStack>

                              {/* 移动端注册表单 */}
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
                        {t('auth.register.formTitle')}
                      </Heading>
                      <Text color="gray.400" fontSize="xs">
                        {t('auth.register.formDescription')}
                      </Text>
                    </VStack>

                    <Button
                      w="full"
                      size="md"
                      leftIcon={<FcGoogle size="18" />}
                      onClick={handleGoogleRegister}
                      isLoading={isGoogleLoading}
                      loadingText={t('auth.register.signingUp')}
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
                      {t('auth.register.googleSignUp')}
                    </Button>

                    <HStack spacing={2} color="gray.500" fontSize="2xs">
                      <Icon as={FaShieldAlt} size="10px" />
                      <Text>{t('auth.register.secureTransmission')}</Text>
                    </HStack>

                    <Divider borderColor="rgba(255, 255, 255, 0.1)" />

                    <Text color="gray.400" fontSize="xs" textAlign="center">
                      {t('auth.register.hasAccount')}{' '}
                      <Link 
                        as={NextLink} 
                        href="/login" 
                        color="blue.400" 
                        fontWeight="600"
                        _hover={{ color: 'blue.300', textDecoration: 'none' }}
                      >
                        {t('auth.register.loginLink')}
                      </Link>
                    </Text>
                  </VStack>
                </Box>

                              {/* 移动端底部说明 */}
                <Text color="gray.600" fontSize="xs" textAlign="center" fontStyle="italic" px={4} opacity={0.8}>
                  {t('auth.register.termsText')}
                </Text>
              </VStack>
            </Flex>
          </Container>
      ) : (
        // 桌面端布局 - 完全重新设计，确保右侧背景到底部
        <Box minH="100vh" bg="#0a0a0a">
          <Flex minH="100vh" direction="row">
            {/* 左侧 - 注册表单 */}
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
              {/* 左侧背景装饰 - 增强动画效果 */}
              <Box
                position="absolute"
                top="15%"
                left="-15%"
                w="300px"
                h="300px"
                bg="linear-gradient(45deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))"
                rounded="full"
                filter="blur(60px)"
                animation="float 12s ease-in-out infinite"
              />
              <Box
                position="absolute"
                bottom="25%"
                right="-10%"
                w="200px"
                h="200px"
                bg="linear-gradient(45deg, rgba(236, 72, 153, 0.06), rgba(16, 185, 129, 0.06))"
                rounded="full"
                filter="blur(40px)"
                animation="float 8s ease-in-out infinite reverse"
              />

              <Box w="full" maxW="400px" position="relative" zIndex={1}>
                <VStack spacing={8} justify="center" minH="calc(100vh - 200px)">
                  {/* Logo和欢迎区域 */}
                  <VStack spacing={4} textAlign="center">
                    <Box
                      p={3}
                      bg="linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))"
                      border="1px solid rgba(255, 255, 255, 0.15)"
                      borderRadius="xl"
                      backdropFilter="blur(15px)"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      _hover={{
                        transform: "scale(1.05)",
                        bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(59, 130, 246, 0.18))"
                      }}
                    >
                      <Text fontSize="2xl">✨</Text>
                    </Box>
                    <VStack spacing={3}>
                      <Heading fontSize={{ base: "2xl", lg: "3xl" }} fontWeight="bold" color="white" className="hero-title">
                        {t('auth.register.welcomeTitle')}
                      </Heading>
                      <Text color="gray.300" fontSize="md" maxW="320px" lineHeight="tall" textAlign="center">
                        {t('auth.register.welcomeDescription')}
                      </Text>
                    </VStack>
                  </VStack>

                  {/* 注册表单 */}
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
                          {t('auth.register.formTitle')}
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                          {t('auth.register.formDescription')}
                        </Text>
                      </VStack>

                      <Button
                        w="full"
                        size="md"
                        leftIcon={<FcGoogle size="20" />}
                        onClick={handleGoogleRegister}
                        isLoading={isGoogleLoading}
                        loadingText={t('auth.register.googleSignUpLoading')}
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
                        {t('auth.register.googleSignUp')}
                      </Button>

                      <HStack spacing={2} color="gray.500" fontSize="xs">
                        <Icon as={FaShieldAlt} size="12px" />
                        <Text>{t('auth.register.secureTransmission')}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* 底部链接和说明 */}
                  <VStack spacing={3}>
                    <Text color="gray.400" fontSize="sm" textAlign="center">
                      {t('auth.register.hasAccount')}{' '}
                      <Link 
                        as={NextLink} 
                        href="/login" 
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
                        {t('auth.register.loginLink')} →
                      </Link>
                    </Text>

                    <Text color="gray.600" fontSize="xs" textAlign="center" fontStyle="italic" opacity={0.8}>
                      {t('auth.register.termsText')}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </Flex>

            {/* 右侧 - 产品亮点展示 - 确保背景到底部 */}
            <Flex
              w="50%"
              bg="linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
              minH="100vh"
              px={{ base: 8, lg: 10, xl: 12 }}
              py={16}
            >
              {/* 右侧背景装饰 - 增强效果 */}
              <Box
                position="absolute"
                top="10%"
                right="5%"
                w="250px"
                h="250px"
                bg="linear-gradient(45deg, rgba(16, 185, 129, 0.12), rgba(59, 130, 246, 0.12))"
                rounded="full"
                filter="blur(60px)"
                animation="float 10s ease-in-out infinite"
              />
              <Box
                position="absolute"
                bottom="15%"
                left="5%"
                w="200px"
                h="200px"
                bg="linear-gradient(45deg, rgba(245, 158, 11, 0.12), rgba(236, 72, 153, 0.12))"
                rounded="full"
                filter="blur(40px)"
                animation="float 12s ease-in-out infinite reverse"
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="150px"
                h="150px"
                bg="linear-gradient(45deg, rgba(16, 185, 129, 0.08), rgba(139, 69, 19, 0.08))"
                rounded="full"
                filter="blur(50px)"
                animation="float 15s ease-in-out infinite"
              />

              <VStack spacing={6} textAlign="center" maxW="500px" px={6} position="relative" zIndex={1} pt={4}>
                <VStack spacing={4}>
                  <Heading 
                    size={{ base: "lg", md: "xl" }}
                    color="white" 
                    className="hero-title"
                    lineHeight="shorter"
                    fontWeight="bold"
                    maxW="400px"
                  >
                    {t('auth.register.rightSideTitle')}
                  </Heading>
                  
                  <Text 
                    color="gray.300" 
                    fontSize={{ base: "sm", md: "md" }}
                    lineHeight="relaxed" 
                    maxW="400px"
                    textAlign="center"
                  >
                    {t('auth.register.rightSideDescription')}
                  </Text>
                </VStack>

                {/* 功能亮点列表 */}
                <VStack spacing={3} w="full" maxW="420px">
                  {[
                    { icon: '🎨', textKey: 'textToImage', descKey: 'textToImage' },
                    { icon: '🎬', textKey: 'textToVideo', descKey: 'textToVideo' },
                    { icon: '👤', textKey: 'digitalHuman', descKey: 'digitalHuman' },
                    { icon: '⚡', textKey: 'realTime', descKey: 'realTime' }
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      w="full"
                      bg="rgba(255, 255, 255, 0.05)"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      borderRadius="lg"
                      p={4}
                      backdropFilter="blur(10px)"
                      _hover={{ 
                        bg: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateX(4px)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                      transition="all 0.3s"
                      minH="60px"
                    >
                      <HStack spacing={3} align="flex-start">
                        <Box
                          fontSize="lg"
                          p={2}
                          bg="rgba(255, 255, 255, 0.1)"
                          borderRadius="md"
                          minW="44px"
                          h="44px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          {feature.icon}
                        </Box>
                        <VStack align="start" spacing={1} flex={1} minW={0}>
                          <Text 
                            color="white" 
                            fontSize={{ base: "sm", md: "md" }}
                            fontWeight="600"
                            lineHeight="shorter"
                            noOfLines={2}
                          >
                            {t(`auth.register.features.${feature.textKey}.title`)}
                          </Text>
                          <Text 
                            color="gray.400" 
                            fontSize={{ base: "xs", md: "xs" }}
                            lineHeight="relaxed"
                            noOfLines={3}
                          >
                            {t(`auth.register.features.${feature.descKey}.description`)}
                          </Text>
                        </VStack>
                        <Icon as={FaCheckCircle} color="green.400" fontSize="md" flexShrink={0} />
                      </HStack>
                    </Box>
                  ))}
                </VStack>

                {/* 底部激励文案 */}
                <Box
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                  borderRadius="lg"
                  p={5}
                  backdropFilter="blur(10px)"
                  maxW="420px"
                  w="full"
                >
                  <VStack spacing={3}>
                    <Text 
                      color="white" 
                      fontSize={{ base: "sm", md: "md" }}
                      fontWeight="600"
                      textAlign="center"
                      lineHeight="shorter"
                    >
                      🌟 {t('auth.register.bottomTitle')}
                    </Text>
                    <Text 
                      color="gray.300" 
                      fontSize={{ base: "xs", md: "sm" }}
                      textAlign="center"
                      lineHeight="relaxed"
                      maxW="380px"
                    >
                      {t('auth.register.bottomDescription')}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Flex>
          </Flex>
        </Box>
      )}
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