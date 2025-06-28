import Head from 'next/head';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  Image,
  Flex,
  Card,
  CardBody,
  Button,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FaCheckCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// --- Section 0: Modern Hero with Gradient ---
const HeroSection = () => {
    const { t } = useTranslation('common');
    const { data: session } = useSession();
    const router = useRouter();

    const handleGetStarted = () => {
        if (session) {
            // 如果用户已登录，跳转到创作中心
            router.push('/create');
        } else {
            // 如果用户未登录，跳转到登录页面
            router.push('/login');
        }
    };

    return (
        <Box
            position="relative"
            className="dark-gradient-bg"
            color="white"
            py={{ base: 16, md: 20 }}
            minH={{ base: "90vh", md: "80vh" }}
            display="flex"
            alignItems="center"
            overflow="hidden"
        >
            {/* 装饰性背景元素 */}
            <Box
                position="absolute"
                top="10%"
                left="10%"
                w="200px"
                h="200px"
                bg="linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                rounded="full"
                filter="blur(40px)"
                animation="float 6s ease-in-out infinite"
            />
            <Box
                position="absolute"
                bottom="20%"
                right="15%"
                w="150px"
                h="150px"
                bg="linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))"
                rounded="full"
                filter="blur(30px)"
                animation="float 8s ease-in-out infinite reverse"
            />
            
            <Container maxW="container.xl" position="relative" zIndex={1}>
                <VStack
                    spacing={{ base: 6, md: 8 }}
                    textAlign="center"
                    w="full"
                >
                    {/* 添加小标签 */}
                    <Box
                        bg="rgba(255, 255, 255, 0.1)"
                        border="1px solid rgba(255, 255, 255, 0.2)"
                        rounded="full"
                        px={6}
                        py={2}
                        backdrop-filter="blur(10px)"
                        _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                        transition="all 0.3s"
                    >
                        <Text fontSize="sm" fontWeight="medium">
                            ✨ {t('home.hero.badge')}
                        </Text>
                    </Box>

                    <Heading 
                        as="h1" 
                        size={{ base: "3xl", md: "4xl", lg: "5xl" }}
                        fontWeight="bold" 
                        letterSpacing="tight"
                        lineHeight="shorter"
                        className="hero-title"
                        maxW="5xl"
                        position="relative"
                    >
                        {t('home.hero.title')}
                    </Heading>
                    
                    <Text 
                        fontSize={{ base: "lg", md: "xl" }} 
                        opacity={0.9} 
                        maxW="4xl"
                        lineHeight="tall"
                        fontWeight="medium"
                    >
                        {t('home.hero.subtitle')}
                    </Text>

                    {/* 功能亮点 */}
                    <HStack
                        spacing={{ base: 4, md: 8 }}
                        justify="center"
                        flexWrap="wrap"
                        gap={2}
                    >
                        {[
                            { icon: '🎨', text: 'home.hero.features.textToImage' },
                            { icon: '🎬', text: 'home.hero.features.textToVideo' },
                            { icon: '👤', text: 'home.hero.features.digitalHuman' },
                            { icon: '⚡', text: 'home.hero.features.instantGeneration' }
                        ].map((feature, index) => (
                            <Box
                                key={index}
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                rounded="lg"
                                px={4}
                                py={2}
                                _hover={{ 
                                    bg: "rgba(255, 255, 255, 0.1)",
                                    transform: "translateY(-2px)"
                                }}
                                transition="all 0.3s"
                            >
                                <Text fontSize="sm" fontWeight="medium">
                                    {feature.icon} {t(feature.text)}
                                </Text>
                            </Box>
                        ))}
                    </HStack>
                    
                    <Button 
                        size="lg" 
                        bg="white"
                        color="gray.800"
                        fontWeight="bold"
                        px={12}
                        py={6}
                        fontSize="lg"
                        rounded="xl"
                        shadow="lg"
                        _hover={{ 
                            transform: 'translateY(-3px)', 
                            shadow: 'xl',
                            bg: 'gray.50'
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        transition="all 0.2s"
                        onClick={handleGetStarted}
                    >
                        {t('home.getStarted')} →
                    </Button>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Section 1: Why Flux AI Title and Description Only ---
const WhyFluxAISection = () => {
    const { t } = useTranslation('common');
    
    return (
        <Box bg="#0a0a0a" id="why-choose-us">
            <Container maxW="container.xl" py={{ base: 12, md: 20 }}>
                <VStack spacing={6} textAlign="center">
                    <Heading as="h2" size="2xl" color="white" className="hero-title">
                        {t('home.why.title')}
                    </Heading>
                    <Text fontSize="lg" color="gray.300" lineHeight="tall" maxW="4xl">
                        {t('home.why.subtitle')}
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Section 1.5: Feature Cards Below (移到下方的三个卡片) ---
const FeatureCardsSection = () => {
    const { t } = useTranslation('common');
    
    return (
        <Box bg="#0a0a0a">
            <Container maxW="container.xl" py={{ base: 8, md: 12 }}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {[1, 2, 3].map(i => (
                        <Card 
                            key={i}
                            className="modern-card"
                            shadow="lg"
                            _hover={{ 
                                transform: 'translateY(-4px)', 
                                shadow: 'xl',
                                bg: 'rgba(255, 255, 255, 0.08)'
                            }}
                            transition="all 0.3s"
                            rounded="xl"
                            h="full"
                            bg="rgba(255, 255, 255, 0.05)"
                            border="1px solid rgba(255, 255, 255, 0.1)"
                        >
                            <CardBody p={6}>
                                <VStack align="start" spacing={4} h="full">
                                    <Heading as="h3" size="md" color="white">
                                        {t(`home.why.q${i}.question`)}
                                    </Heading>
                                    <Text color="gray.300" lineHeight="tall" flex={1}>
                                        {t(`home.why.q${i}.answer`)}
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
};

// --- Section 2: Modern Competitor Comparison ---
const CompareSection = () => {
    const { t } = useTranslation('common');
    
    return (
        <Box bg="#1a1a2e" py={{ base: 12, md: 18 }}>
            <Container maxW="container.xl">
                <VStack spacing={10}>
                    <VStack spacing={4} textAlign="center">
                        <Heading as="h2" size="2xl" color="white" className="hero-title">
                            {t('home.compare.title')}
                        </Heading>
                        <Text fontSize="lg" color="gray.300" maxW="3xl">
                            {t('home.compare.subtitle')}
                        </Text>
                    </VStack>
                    
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card 
                                key={i}
                                className="modern-card"
                                shadow="lg"
                                _hover={{ 
                                    transform: 'translateY(-4px)', 
                                    shadow: 'xl',
                                    bg: 'rgba(255, 255, 255, 0.08)'
                                }}
                                transition="all 0.3s"
                                rounded="xl"
                                overflow="hidden"
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                            >
                                <CardBody p={6}>
                                    <VStack align="start" spacing={4}>
                                        <Text fontWeight="bold" color="white" fontSize="lg">
                                            {t(`home.compare.item${i}.question`)}
                                        </Text>
                                        <Text color="gray.300" lineHeight="tall">
                                            {t(`home.compare.item${i}.answer`)}
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Section 3: Modern Solutions with Cards ---
const SolutionsSection = () => {
    const { t } = useTranslation('common');
    
    const solutionFeatures = [
        {
            icon: '🎨',
            title: t('home.solutions.scenario1'),
            description: t('home.solutions.item1'),
            gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(147, 51, 234, 0.2))'
        },
        {
            icon: '🎬', 
            title: t('home.solutions.scenario2'),
            description: t('home.solutions.item2'),
            gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))'
        },
        {
            icon: '👤',
            title: t('home.solutions.scenario3'), 
            description: t('home.solutions.item3'),
            gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))'
        }
    ];

    return (
        <Box bg="#0a0a0a" position="relative" overflow="hidden">
            {/* 背景装饰 */}
            <Box
                position="absolute"
                top="20%"
                right="-10%"
                w="400px"
                h="400px"
                bg="linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))"
                rounded="full"
                filter="blur(60px)"
                animation="float 8s ease-in-out infinite"
            />
            <Box
                position="absolute"
                bottom="10%"
                left="-10%"
                w="300px"
                h="300px"
                bg="linear-gradient(45deg, rgba(236, 72, 153, 0.05), rgba(59, 130, 246, 0.05))"
                rounded="full"
                filter="blur(50px)"
                animation="float 10s ease-in-out infinite reverse"
            />
            
            <Container maxW="container.xl" py={{ base: 12, md: 18 }} position="relative" zIndex={1}>
                <VStack spacing={{ base: 12, md: 16 }} textAlign="center">
                    {/* 标题部分 */}
                    <VStack spacing={6} maxW="4xl">
                        <Heading as="h2" size="2xl" color="white" className="hero-title">
                            {t('home.solutions.title')}
                        </Heading>
                        <Text fontSize="xl" color="gray.300" lineHeight="tall" fontWeight="medium">
                            {t('home.solutions.description')}
                        </Text>
                    </VStack>
                    
                    {/* 解决方案卡片网格 */}
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                        {solutionFeatures.map((feature, index) => (
                            <Card
                                key={index}
                                className="modern-card"
                                shadow="lg"
                                _hover={{ 
                                    transform: 'translateY(-8px)', 
                                    shadow: '2xl',
                                    bg: 'rgba(255, 255, 255, 0.08)'
                                }}
                                transition="all 0.4s ease"
                                rounded="2xl"
                                h="full"
                                bg="rgba(255, 255, 255, 0.03)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                overflow="hidden"
                                position="relative"
                            >
                                {/* 渐变背景 */}
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    h="4px"
                                    bg={feature.gradient}
                                />
                                
                                <CardBody p={8}>
                                    <VStack align="center" spacing={6} h="full" textAlign="center">
                                        {/* 图标 */}
                                        <Box
                                            fontSize="4xl"
                                            p={4}
                                            bg={feature.gradient}
                                            rounded="2xl"
                                            border="1px solid rgba(255, 255, 255, 0.1)"
                                            _hover={{ transform: 'scale(1.1)' }}
                                            transition="all 0.3s"
                                        >
                                            {feature.icon}
                                        </Box>
                                        
                                        {/* 标题 */}
                                        <Heading as="h3" size="lg" color="white" lineHeight="short">
                                            {feature.title}
                                        </Heading>
                                        
                                        {/* 描述 */}
                                        <Text 
                                            color="gray.300" 
                                            lineHeight="tall" 
                                            fontSize="md"
                                            flex={1}
                                            display="flex"
                                            alignItems="center"
                                        >
                                            {feature.description}
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>

                    {/* 底部亮点说明 */}
                    <Box
                        maxW="5xl"
                        w="full"
                        p={8}
                        bg="linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                        rounded="2xl"
                        position="relative"
                        _hover={{ 
                            bg: 'rgba(255, 255, 255, 0.08)',
                            transform: 'translateY(-2px)'
                        }}
                        transition="all 0.3s"
                    >
                        <VStack spacing={6}>
                            <Heading as="h3" size="lg" color="white" textAlign="center">
                                {t('home.solutions.subtitle')}
                            </Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" alignItems="start">
                                <VStack spacing={3} h="full" justify="center" textAlign="center">
                                    <Box color="green.400" fontSize="xl">✓</Box>
                                    <Text color="gray.200" fontSize="lg" lineHeight="tall" minH="3.5em" display="flex" alignItems="center" justifyContent="center">
                                        {t('home.solutions.scenario1')}
                                    </Text>
                                </VStack>
                                <VStack spacing={3} h="full" justify="center" textAlign="center">
                                    <Box color="green.400" fontSize="xl">✓</Box>
                                    <Text color="gray.200" fontSize="lg" lineHeight="tall" minH="3.5em" display="flex" alignItems="center" justifyContent="center">
                                        {t('home.solutions.scenario2')}
                                    </Text>
                                </VStack>
                                <VStack spacing={3} h="full" justify="center" textAlign="center">
                                    <Box color="green.400" fontSize="xl">✓</Box>
                                    <Text color="gray.200" fontSize="lg" lineHeight="tall" minH="3.5em" display="flex" alignItems="center" justifyContent="center">
                                        {t('home.solutions.scenario3')}
                                    </Text>
                                </VStack>
                            </SimpleGrid>
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Section 4: Modern Case Studies (Card Layout) ---
const ShowcaseSection = () => {
    const { t } = useTranslation('common');
    
    const showcaseItems = [
        {
            title: t('home.showcase_new.image.title'),
            cases: [
                t('home.showcase_new.image.case1'),
                t('home.showcase_new.image.case2')
            ]
        },
        {
            title: t('home.showcase_new.video.title'),
            cases: [
                t('home.showcase_new.video.case1'),
                t('home.showcase_new.video.case2')
            ]
        },
        {
            title: t('home.showcase_new.digital_human.title'),
            cases: [
                t('home.showcase_new.digital_human.case1'),
                t('home.showcase_new.digital_human.case2')
            ]
        }
    ];
    
    return (
        <Box bg="#1a1a2e" py={{ base: 12, md: 18 }}>
            <Container maxW="container.xl">
                <VStack spacing={10}>
                    <VStack spacing={4} textAlign="center">
                        <Heading as="h2" size="2xl" color="white" className="hero-title">
                            {t('home.showcase_new.title')}
                        </Heading>
                        <Text fontSize="lg" color="gray.300" maxW="3xl">
                            {t('home.showcase_new.subtitle')}
                        </Text>
                    </VStack>
                    
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                        {showcaseItems.map((item, index) => (
                            <Card
                                key={index}
                                className="modern-card"
                                shadow="lg"
                                _hover={{ 
                                    transform: 'translateY(-4px)', 
                                    shadow: 'xl',
                                    bg: 'rgba(255, 255, 255, 0.08)'
                                }}
                                transition="all 0.3s"
                                rounded="xl"
                                h="full"
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                            >
                                <CardBody p={6}>
                                    <VStack align="start" spacing={6} h="full">
                                        <Heading as="h3" size="lg" color="white">
                                            {item.title}
                                        </Heading>
                                        <VStack align="start" spacing={4} flex={1}>
                                            {item.cases.map((caseText, caseIndex) => (
                                                <Text 
                                                    key={caseIndex}
                                                    fontSize="md" 
                                                    color="gray.300"
                                                    lineHeight="tall"
                                                >
                                                    • {caseText}
                                                </Text>
                                            ))}
                                        </VStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Section 4.5: Modern AI Art Styles Grid ---
const AIArtStylesSection = () => {
    const { t } = useTranslation('common');
    const images = Array.from({ length: 8 }, (_, i) => `/ai-style-${i + 1}.jpg`);

            return (
            <Box bg="#0a0a0a" id="showcase">
                <Container maxW="container.xl" py={{ base: 12, md: 18 }}>
                    <VStack spacing={10}>
                        <VStack spacing={4} textAlign="center">
                            <Heading as="h2" size="2xl" color="white" className="hero-title">
                                {t('home.artStyles.title')}
                            </Heading>
                        <Text fontSize="lg" color="gray.300" maxW="3xl">
                            {t('home.artStyles.subtitle')}
                        </Text>
                    </VStack>
                    
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
                        {images.map((src, index) => (
                            <Box
                                key={index}
                                _hover={{ 
                                    transform: 'scale(1.05)', 
                                    shadow: 'xl' 
                                }}
                                transition="all 0.3s"
                                cursor="pointer"
                            >
                                <Image
                                    src={src}
                                    alt={`AI Art Style ${index + 1}`}
                                    rounded="xl"
                                    shadow="lg"
                                    objectFit="cover"
                                    w="full"
                                    h="250px"
                                />
                            </Box>
                        ))}
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Section 5: Modern FAQ with Card Design (保留所有12个问题) ---
const FAQSection = () => {
    const { t } = useTranslation('common');
    
    return (
        <Box bg="#1a1a2e" py={{ base: 12, md: 18 }} id="faq">
            <Container maxW="container.lg">
                <VStack spacing={10}>
                    <VStack spacing={4} textAlign="center">
                        <Heading as="h2" size="2xl" color="white" className="hero-title">
                            {t('home.faq_new.title')}
                        </Heading>
                        <Text fontSize="lg" color="gray.300" maxW="2xl">
                            {t('home.faq_new.subtitle')}
                        </Text>
                    </VStack>
                    
                    <Card 
                        className="modern-card"
                        shadow="xl" 
                        rounded="2xl" 
                        w="full"
                        overflow="hidden"
                        bg="rgba(255, 255, 255, 0.05)"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                    >
                        <CardBody p={0}>
                            <Accordion allowToggle>
                                {[...Array(12).keys()].map(i => (
                                    <AccordionItem 
                                        key={i}
                                        border="none"
                                        borderBottom="1px"
                                        borderColor="rgba(255, 255, 255, 0.1)"
                                        _last={{ borderBottom: 'none' }}
                                    >
                                        <Heading as="h3" size="md">
                                            <AccordionButton 
                                                py={6} 
                                                px={8}
                                                _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
                                                transition="all 0.2s"
                                            >
                                                <Box 
                                                    flex="1" 
                                                    textAlign="left" 
                                                    fontWeight="semibold"
                                                    color="white"
                                                >
                                                    {t(`home.faq_new.q${i + 1}.question`)}
                                                </Box>
                                                <AccordionIcon color="white" />
                                            </AccordionButton>
                                        </Heading>
                                        <AccordionPanel 
                                            pb={6} 
                                            px={8}
                                            color="gray.300"
                                            lineHeight="tall"
                                        >
                                            {t(`home.faq_new.q${i + 1}.answer`)}
                                        </AccordionPanel>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
        </Box>
    );
};

// --- Main Page Component ---
export default function Home() {
  const { t } = useTranslation('common');
  
  const pageTitle = t('home.seo.title', 'AI 创作工具平台 | Flux AI');
  const pageDescription = t('home.seo.description', 'Flux AI 是一个领先的 AI 创作工具平台，提供强大的文生图、文生视频和数字人技术。无论您是设计师、营销人员还是内容创作者，都能在这里找到激发灵感的工具，轻松创作出专业级视觉内容。');

  return (
    <Box bg="#0a0a0a" minH="100vh">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Flux AI" />
      </Head>
      <Navbar />
      <main>
        <HeroSection />
        <WhyFluxAISection />
        <FeatureCardsSection />
        <CompareSection />
        <SolutionsSection />
        <ShowcaseSection />
        <AIArtStylesSection />
        <FAQSection />
      </main>
      <Footer />
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