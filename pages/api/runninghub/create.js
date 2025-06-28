import { useState, useRef } from 'react';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box,
  Container,
  Text,
  VStack,
  useColorModeValue,
  Heading,
  Flex,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Stack,
  Badge,
  useToast,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  CircularProgress,
  Spinner,
} from '@chakra-ui/react';
import { FaHome, FaPlus, FaFolder, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion, AnimatePresence } from 'framer-motion';

// ... (Sidebar 组件保持不变)
const Sidebar = ({ isOpen, onToggle }) => {
  const { t } = useTranslation('common');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ width: isOpen ? '240px' : '60px' }}
        animate={{ width: isOpen ? '240px' : '60px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          left: 0,
          top: '64px',
          bottom: 0,
          background: bgColor,
          borderRight: '1px solid',
          borderColor: borderColor,
          zIndex: 1,
        }}
      >
        <VStack spacing={2} align="stretch" p={2}>
          <Button
            variant="ghost"
            onClick={onToggle}
            w="100%"
            justifyContent={isOpen ? 'start' : 'center'}
            leftIcon={isOpen ? <FaChevronLeft /> : <FaChevronRight />}
            mb={2}
          >
            {isOpen && t('sidebar.collapse')}
          </Button>
          
          <Link href="/create" style={{ textDecoration: 'none' }}>
            <Button
              as="span"
              leftIcon={<FaPlus />}
              variant="ghost"
              justifyContent={isOpen ? 'start' : 'center'}
              w="100%"
              colorScheme="blue"
            >
              {isOpen && t('sidebar.create')}
            </Button>
          </Link>
          
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button
              as="span"
              leftIcon={<FaHome />}
              variant="ghost"
              justifyContent={isOpen ? 'start' : 'center'}
              w="100%"
            >
              {isOpen && t('sidebar.home')}
            </Button>
          </Link>
          
          <Link href="/projects" style={{ textDecoration: 'none' }}>
            <Button
              as="span"
              leftIcon={<FaFolder />}
              variant="ghost"
              justifyContent={isOpen ? 'start' : 'center'}
              w="100%"
            >
              {isOpen && t('sidebar.projects')}
            </Button>
          </Link>
        </VStack>
      </motion.div>
    </AnimatePresence>
  );
};

// 应用卡片组件
const AppCard = ({ title, image, type, date, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        transition: 'all 0.3s ease-in-out'
      }}
      onClick={onClick}
    >
      <Image
        src={image}
        alt={title}
        height="200px"
        objectFit="cover"
        transition="transform 0.3s ease-in-out"
        _hover={{ transform: 'scale(1.05)' }}
      />
      <CardBody>
        <Stack spacing={3}>
          <Heading size="md" noOfLines={1}>{title}</Heading>
          <Flex justify="space-between" align="center">
            <Badge colorScheme="blue" px={3} py={1} borderRadius="full">{type}</Badge>
            <Text fontSize="sm" color="gray.500">{date}</Text>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default function Create() {
  const { t } = useTranslation('common');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const inputBgColor = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const apps = [
    {
      title: '动漫风格转换',
      type: 'Style Transfer',
      date: '2025-06-23',
      image: '/ai-style-1.jpg', // 示例图片
      webappId: '1911985272408502273',
      nodeId: '226',
    },
  ];

  const handleAppClick = (app) => {
    setSelectedApp(app);
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedApp) return;

    setIsLoading(true);
    toast({ title: "图片上传中...", status: 'info' });

    try {
      // 1. 上传文件
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/runninghub/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || '上传失败');
      
      toast.closeAll();
      toast({ title: "任务处理中...", status: 'info' });

      // 2. 运行任务
      const runRes = await fetch('/api/runninghub/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          webappId: selectedApp.webappId,
          nodeId: selectedApp.nodeId,
        }),
      });
      const runData = await runRes.json();
      if (!runRes.ok) throw new Error(runData.error || '任务启动失败');
      
      const { taskId } = runData;

      // 3. 轮询状态
      const pollStatus = async () => {
        const statusRes = await fetch('/api/runninghub/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        });
        const statusData = await statusRes.json();
        if (!statusRes.ok) throw new Error(statusData.error || '状态查询失败');
        
        if (statusData.status === 'COMPLETED') {
          // 4. 获取结果
          toast.closeAll();
          toast({ title: "任务完成，正在获取结果...", status: 'success' });
          const resultRes = await fetch('/api/runninghub/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId }),
          });
          const resultData = await resultRes.json();
          if (!resultRes.ok) throw new Error(resultData.error || '结果获取失败');

          if (resultData.images && resultData.images.length > 0) {
            setResultImage(resultData.images[0]);
            onOpen();
          } else {
             toast({ title: "未能获取到图片结果", status: 'warning' });
          }
          setIsLoading(false);
        } else if (statusData.status === 'ERROR' || statusData.status === 'FAILED') {
          throw new Error('任务处理失败');
        } else {
          setTimeout(pollStatus, 3000); // 3秒后再次查询
        }
      };

      pollStatus();

    } catch (error) {
      setIsLoading(false);
      toast.closeAll();
      toast({ title: "发生错误", description: error.message, status: 'error', isClosable: true });
    } finally {
        // 清空文件输入框以便下次选择
        event.target.value = null;
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg"
      />
      <Flex>
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setSidebarOpen(!isSidebarOpen)} />
        <Box
          as="main"
          flex="1"
          ml={isSidebarOpen ? '240px' : '60px'}
          transition="margin-left 0.3s"
          pt="84px"
          pb="10"
          px="6"
        >
          <Container maxW="container.xl" py={6}>
            <VStack spacing={8} align="stretch">
              <Heading as="h1" size="xl" bgGradient="linear(to-r, blue.400, blue.600)" bgClip="text">
                {t('create.title')}
              </Heading>
              
              {/* This is the new input area, kept for potential future use or other features, but not the main interaction point for apps */}
              <Box
                w="100%"
                p={6}
                bg={inputBgColor}
                borderRadius="xl"
                boxShadow="md"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <VStack spacing={4}>
                  <Textarea
                    placeholder={t('create.promptPlaceholder')}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    color={useColorModeValue('gray.800', 'white')}
                    borderColor={useColorModeValue('gray.300', 'gray.600')}
                    focusBorderColor="blue.500"
                    rows={4}
                    resize="none"
                  />
                  <Flex w="100%" justifyContent="space-between" alignItems="center">
                    <Button variant="ghost" colorScheme="blue">
                      + {t('create.aiTwins')}
                    </Button>
                    <Button colorScheme="blue">
                      {t('create.generateVideo')}
                    </Button>
                  </Flex>
                </VStack>
              </Box>

              <VStack spacing={8} align="stretch">
                <Heading as="h2" size="lg">{t('create.allApps')}</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                  {apps.map((app, index) => (
                    <AppCard key={index} {...app} onClick={() => handleAppClick(app)} />
                  ))}
                </SimpleGrid>
              </VStack>

            </VStack>
          </Container>
        </Box>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>生成结果</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {resultImage && <Image src={resultImage} alt="生成结果" borderRadius="md" />}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>关闭</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isLoading && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.5)"
          justify="center"
          align="center"
          zIndex="overlay"
        >
          <Spinner size="xl" color="white" />
        </Flex>
      )}
    </Box>
  );
}

// ... getServerSideProps 保持不变
export async function getServerSideProps({ req, locale }) {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: `/login?returnUrl=/create`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      session,
    },
  };
} 