import { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Box, Container, Text, VStack, useColorModeValue, Heading, Flex, Button,
  SimpleGrid, Card, CardBody, Image, Stack, Icon, HStack, Spacer,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Spinner, useToast
} from '@chakra-ui/react';
import { FaHome, FaPlus, FaFolder, FaChevronLeft, FaChevronRight, FaDownload, FaImage, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion } from 'framer-motion';
import { findUserByEmail, findUserProjects } from '../prisma/client';
import Navbar from '../components/Navbar';

// --- Components ---

const Sidebar = ({ isOpen, onToggle }) => {
  const { t } = useTranslation('common');
  const bgColor = '#0a0a0a';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  
  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? '240px' : '60px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        position: 'fixed', left: 0, top: '70px', bottom: 0,
        background: bgColor, borderRight: '1px solid', borderColor,
        zIndex: 10, overflow: 'hidden'
      }}
    >
      <VStack spacing={2} align="stretch" p={2} mt={2}>
        <Button variant="ghost" onClick={onToggle} w="100%" justifyContent={isOpen ? 'start' : 'center'} leftIcon={isOpen ? <FaChevronLeft /> : <FaChevronRight />} color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>
            {isOpen && t('sidebar.collapse')}
        </Button>
        <Link href="/create" passHref><Button leftIcon={<FaPlus />} variant="ghost" justifyContent={isOpen ? 'start' : 'center'} w="100%" color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>{isOpen && t('sidebar.create')}</Button></Link>
        <Link href="/" passHref><Button leftIcon={<FaHome />} variant="ghost" justifyContent={isOpen ? 'start' : 'center'} w="100%" color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>{isOpen && t('sidebar.home')}</Button></Link>
        <Link href="/projects" passHref><Button leftIcon={<FaFolder />} variant="solid" colorScheme="blue" justifyContent={isOpen ? 'start' : 'center'} w="100%">{isOpen && t('sidebar.projects')}</Button></Link>
      </VStack>
    </motion.div>
  );
};

const ProjectCard = ({ project, onClick, onDelete }) => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const cardBg = 'rgba(255, 255, 255, 0.05)';
  const borderColor = 'rgba(255, 255, 255, 0.1)';

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const response = await fetch(project.imageUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExtension = project.imageUrl.split('.').pop();
      const safeAppName = t(`apps.${project.appName}`, project.appName).replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${safeAppName}_${project.id}.${fileExtension}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: t('projects.download_failed_title', '下载失败'),
        description: t('projects.download_failed_description', '无法获取文件，请稍后重试。'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

      return (
    <Card 
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl" 
      overflow="hidden" 
      shadow="md" 
      transition="all 0.2s" 
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)', bg: 'rgba(255, 255, 255, 0.08)' }}
      onClick={() => onClick(project)}
      cursor="pointer"
      className="modern-card"
    >
              <Box h="200px" bg="rgba(255, 255, 255, 0.02)" display="flex" alignItems="center" justifyContent="center" position="relative">
        {project.imageUrl.toLowerCase().endsWith('.mp4') || project.imageUrl.toLowerCase().endsWith('.webm') ? (
            <Box
                as="video"
                src={project.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                objectFit="cover"
                w="100%"
                h="100%"
            />
        ) : (
            <Image
                src={project.imageUrl}
                alt={project.appName}
                objectFit="cover"
                w="100%"
                h="100%"
                fallback={<Icon as={FaImage} w={12} h={12} color="gray.400" />}
            />
        )}
        <Button
            position="absolute"
            top="2"
            right="2"
            size="sm"
            variant="solid"
            colorScheme="red"
            aria-label="Delete project"
            onClick={(e) => {
                e.stopPropagation(); // 防止点击删除时触发卡片点击事件
                onDelete(project.id);
            }}
        >
            <Icon as={FaTrash} />
        </Button>
      </Box>
      <CardBody>
        <Stack spacing={3}>
          <Heading size="md" noOfLines={1} color="white">{t(`apps.${project.appName}`, project.appName)}</Heading>
          <HStack>
            <Text fontSize="sm" color="gray.400">
              {new Date(project.createdAt).toLocaleDateString()}
            </Text>
            <Spacer />
            <Button
              leftIcon={<FaDownload />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={handleDownload}
              isLoading={isDownloading}
              loadingText={t('projects.downloading', '下载中')}
              color="blue.400"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              {t('projects.download', '下载')}
            </Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}

// --- Main Page Component ---

export default function Projects({ initialProjects }) {
  const { t } = useTranslation('common');
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const { isOpen: isSidebarOpen, onToggle: onSidebarToggle } = useDisclosure({ defaultIsOpen: true });
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const [selectedProject, setSelectedProject] = useState(null);
  const bgColor = '#0a0a0a';
    
  const fetchProjects = async () => {
    // 客户端获取最新数据
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  };

  const handleDelete = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t('projects.delete_failed', '删除失败'));
      }
      toast({
        title: t('projects.delete_success', '删除成功'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchProjects(); // 重新获取项目列表
    } catch (error) {
      toast({
        title: t('projects.delete_failed', '删除失败'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCardClick = (project) => {
    setSelectedProject(project);
    onModalOpen();
  };

  return (
    <Box>
      <Navbar />
      <Flex h="100vh" bg={bgColor}>
        <Sidebar isOpen={isSidebarOpen} onToggle={onSidebarToggle} />
      
      <motion.div
        style={{ flex: 1, overflowY: 'auto', paddingTop: '64px' }}
        initial={false}
        animate={{ 
          marginLeft: isSidebarOpen ? '240px' : '60px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Container maxW="container.xl" py={12}>
           <VStack spacing={8} align="stretch">
              <Heading as="h1" size="xl" color="white" className="hero-title">{t('projects.title')}</Heading>
              
              {projects.length === 0 ? (
                <Text color="gray.300">{t('projects.empty')}</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} onClick={handleCardClick} onDelete={handleDelete} />
                  ))}
                </SimpleGrid>
              )}
           </VStack>
        </Container>
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered size="2xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="rgba(26, 26, 46, 0.95)" color="white" border="1px solid rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)">
          <ModalHeader color="white">{t(`apps.${selectedProject?.appName}`, selectedProject?.appName)}</ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }} />
          <ModalBody>
            {selectedProject?.imageUrl ? (
              selectedProject.imageUrl.toLowerCase().endsWith('.mp4') || selectedProject.imageUrl.toLowerCase().endsWith('.webm') ? (
                <Box as="video" src={selectedProject.imageUrl} controls autoPlay borderRadius="md" w="100%" />
              ) : (
                <Image src={selectedProject.imageUrl} alt={selectedProject.appName} borderRadius="md" w="100%" />
              )
            ) : (
              <Flex justify="center" align="center" h="300px">
                <Spinner size="xl" color="blue.400" />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onModalClose}
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              {t('task.close')}
            </Button>
            <Button 
              as="a" 
              href={selectedProject?.imageUrl} 
              download={`flux-ai-${selectedProject?.appName}-${Date.now()}`} 
              colorScheme="blue"
              _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
            >
              {t('projects.download', '下载')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Flex>
    </Box>
  );
}

export async function getServerSideProps({ req, locale }) {
  try {
    const session = await getSession({ req });

    if (!session) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // 使用安全的数据库查询函数

    try {
      console.log('SSR: 查找用户和项目，邮箱:', session.user.email);
      
      // 使用安全重试函数查询用户
      const user = await findUserByEmail(session.user.email);
      
      if (!user) {
        console.log('SSR: 用户不存在');
        return {
          props: {
            ...(await serverSideTranslations(locale, ['common'])),
            initialProjects: [],
          },
        };
      }

      // 使用安全重试函数查询项目
      const projects = await findUserProjects(user.id);
      
      const serializedProjects = projects.map(p => ({
        ...p,
        // Convert Date objects to strings for JSON serialization
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));

      console.log(`SSR: 找到 ${serializedProjects.length} 个项目`);

      return {
        props: {
          ...(await serverSideTranslations(locale, ['common'])),
          initialProjects: serializedProjects,
        },
      };
    } catch (dbError) {
      console.error('Database query error in getServerSideProps:', dbError);
      
      // 如果数据库查询失败，返回空的项目列表，让客户端通过API获取
      return {
        props: {
          ...(await serverSideTranslations(locale, ['common'])),
          initialProjects: [],
        },
      };
    }
  } catch (error) {
    console.error('getServerSideProps error:', error);
    
    // 如果出现任何错误，重定向到登录页面
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
} 