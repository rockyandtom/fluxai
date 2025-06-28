import { useState, useRef, useEffect } from 'react';
import { getSession, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  Spinner,
  Icon,
  HStack,
  IconButton,
  UnorderedList,
  ListItem,
  Divider,
} from '@chakra-ui/react';
import { FaHome, FaPlus, FaFolder, FaChevronLeft, FaChevronRight, FaUpload, FaTimes, FaTasks } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { motion, AnimatePresence } from 'framer-motion';
import { appsConfig as apps } from '../utils/appConfig';
import Navbar from '../components/Navbar';

// 新增：任务计时器组件
const TaskTimer = ({ startTime }) => {
  const { t } = useTranslation('common');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return (
    <Button
      size="xs"
      variant="ghost"
      isDisabled
      cursor="default"
      _hover={{ bg: 'transparent' }}
      leftIcon={<Spinner size="xs" />}
    >
      {t('task.generating', '生成中')} {minutes}:{seconds}
    </Button>
  );
};

// 左侧栏组件
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
        position: 'fixed',
        left: 0,
        top: '70px', // Assuming Navbar height is 70px
        bottom: 0,
        background: bgColor,
        borderRight: '1px solid',
        borderColor: borderColor,
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      <VStack spacing={2} align="stretch" p={2} mt={2}>
        <Button
          variant="ghost"
          onClick={onToggle}
          w="100%"
          justifyContent={isOpen ? 'start' : 'center'}
          leftIcon={isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          color="white"
          _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
        >
          {isOpen && t('sidebar.collapse')}
        </Button>
        <Link href="/create" passHref><Button leftIcon={<FaPlus />} variant="solid" colorScheme="blue" justifyContent={isOpen ? 'start' : 'center'} w="100%">{isOpen && t('sidebar.create')}</Button></Link>
        <Link href="/" passHref><Button leftIcon={<FaHome />} variant="ghost" justifyContent={isOpen ? 'start' : 'center'} w="100%" color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>{isOpen && t('sidebar.home')}</Button></Link>
        <Link href="/projects" passHref><Button leftIcon={<FaFolder />} variant="ghost" justifyContent={isOpen ? 'start' : 'center'} w="100%" color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>{isOpen && t('sidebar.projects')}</Button></Link>
      </VStack>
    </motion.div>
  );
};

// 任务队列组件
const TaskQueue = ({ tasks, isOpen, onToggle, onCancelTask, onRetryTask, onDeleteTask, onResultClick }) => {
    const { t } = useTranslation('common');
    const bgColor = '#0a0a0a';
    const borderColor = 'rgba(255, 255, 255, 0.1)';

    const getStatusBadge = (status) => {
        const statusMap = {
            queued: { text: t('task.status.queued', '排队中'), scheme: 'yellow' },
            running: { text: t('task.status.running', '执行中'), scheme: 'blue' },
            completed: { text: t('task.status.completed', '已完成'), scheme: 'green' },
            failed: { text: t('task.status.failed', '已失败'), scheme: 'red' },
        };
        const { text, scheme } = statusMap[status] || { text: status, scheme: 'gray'};
        return <Badge colorScheme={scheme}>{text} {status === 'running' && <Spinner size="xs" ml={1} />}</Badge>;
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds < 1) return `00:01`;
        const s = parseInt(seconds, 10);
        const m = Math.floor(s / 60);
        const remainingSeconds = s % 60;
        return `${String(m).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const getExpiryInfo = (createdAt) => {
        const createdDate = new Date(createdAt);
        const expiryDate = new Date(createdDate.getTime() + 14 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) {
            return t('task.expired', '已过期');
        }
        return t('task.expiresIn', '{{days}}天后过期', { days: daysRemaining });
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isOpen ? '300px' : '60px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
                position: 'fixed', right: 0, top: '70px', bottom: 0, background: bgColor,
                borderLeft: '1px solid', borderColor: borderColor, zIndex: 10, overflow: 'hidden'
            }}
        >
            <VStack align="stretch" h="100%">
                <Button variant="ghost" onClick={onToggle} w="100%" justifyContent={isOpen ? 'end' : 'center'} p={4} mt={1} color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}>
                    {isOpen ? <FaChevronRight /> : <FaTasks />}
                </Button>
                <Box flex="1" overflowY="auto" px={isOpen ? 4 : 0}>
                    {isOpen && (
                        <VStack spacing={3} align="stretch">
                            <Heading size="md" color="white">{t('task.list', '任务列表')}</Heading>
                            {tasks.length === 0 ? (
                                <Text color="gray.300">{t('task.empty', '暂无任务')}</Text>
                            ) : (
                                tasks.map((task) => (
                                    <Box key={task.id} p={4} borderWidth={1} borderRadius="lg" bg="rgba(255, 255, 255, 0.05)" border="1px solid rgba(255, 255, 255, 0.1)" className="modern-card">
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <Text fontWeight="bold" noOfLines={1} color="white">{t(`apps.${task.appKey}`)}</Text>
                                            {getStatusBadge(task.status)}
                                        </Flex>
                                        <Text fontSize="xs" color="gray.400" mb={2}>
                                            {new Date(task.createdAt).toLocaleString()}
                                        </Text>

                                        {task.status === 'completed' && task.resultImage ? (
                                            <>
                                                {task.resultImage.toLowerCase().endsWith('.mp4') || task.resultImage.toLowerCase().endsWith('.webm') ? (
                                                    <Box as="video" src={task.resultImage} autoPlay loop muted playsInline borderRadius="md" cursor="pointer" onClick={() => onResultClick(task)} _hover={{ opacity: 0.8 }} objectFit="cover" w="100%" h="120px" />
                                                ) : (
                                                    <Image src={task.resultImage} alt="Generated Result" borderRadius="md" cursor="pointer" onClick={() => onResultClick(task)} _hover={{ opacity: 0.8 }} />
                                                )}
                                                <Flex justify="space-between" align="center" mt={2} fontSize="xs" color="gray.400">
                                                    <Text>{t('task.runtime', '运行时长')}: {formatDuration(task.taskCostTime)}</Text>
                                                    <Text>{getExpiryInfo(task.createdAt)}</Text>
                                                </Flex>
                                            </>
                                        ) : (
                                            task.status !== 'completed' && <Text fontSize="sm" color="gray.400">{t('task.estimate')}</Text>
                                        )}
                                        <HStack mt={3} justify="flex-end" spacing={2}>
                                            {task.status === 'running' && <TaskTimer startTime={task.startTime} />}
                                            {(task.status === 'completed' || task.status === 'failed') && (
                                                <Button size="xs" colorScheme="blue" onClick={() => onRetryTask(task)}>{t('task.retry', '重新生成')}</Button>
                                            )}
                                            {task.status === 'queued' && (
                                                <Button size="xs" colorScheme="red" variant="outline" onClick={() => onCancelTask(task.id)}>
                                                    {t('task.cancel')}
                                                </Button>
                                            )}
                                            <IconButton
                                                size="xs"
                                                icon={<FaTimes />}
                                                aria-label="Delete task"
                                                variant="ghost"
                                                onClick={() => onDeleteTask(task.id)}
                                            />
                                        </HStack>
                                    </Box>
                                ))
                            )}
                        </VStack>
                    )}
                </Box>
            </VStack>
        </motion.div>
    );
};

// 应用卡片组件
const AppCard = ({ title, image, type, isSelected, onClick }) => {
  const isVideo = image && (image.endsWith('.mp4') || image.endsWith('.webm'));
  const textColor = 'white';

  return (
    <Card
      minH="320px"
      borderRadius="2xl" 
      overflow="hidden"
      cursor="pointer"
      transition="all 0.3s ease-in-out"
      _hover={{ transform: 'scale(1.05)', shadow: '2xl' }}
      onClick={onClick}
      position="relative"
      border="2px solid"
      borderColor={isSelected ? "blue.400" : "rgba(255, 255, 255, 0.1)"}
      bg="rgba(255, 255, 255, 0.05)"
      className="modern-card"
    >
      {/* Media Background */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex="0">
        {isVideo ? (
          <Box as="video" src={image} autoPlay loop muted playsInline width="100%" height="100%" objectFit="cover" />
        ) : (
          <Image src={image} alt={title} width="100%" height="100%" objectFit="cover"/>
        )}
      </Box>

      {/* Content Overlay */}
      <VStack
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bgGradient="linear(to-t, rgba(10, 10, 10, 0.9), transparent)"
        p={4}
        spacing={2}
        align="center"
        justify="flex-end"
        h="40%"
      >
        <Heading size="md" noOfLines={1} color={textColor} textAlign="center" fontWeight="bold">
          {`~${title}~`}
        </Heading>
        
        <HStack w="60%" spacing={3}>
            <Divider borderColor="whiteAlpha.300" />
            <Badge 
              colorScheme="blue"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              textTransform="uppercase"
              variant="subtle"
            >
              {type}
            </Badge>
            <Divider borderColor="whiteAlpha.300" />
        </HStack>
      </VStack>
    </Card>
  );
};

export default function Create() {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const fileInputRef = useRef(null);
  const toast = useToast();
  const router = useRouter();

  // 新增：统一的错误提示函数
  const showErrorToast = (message) => {
    let description = message;
    if (message?.includes('显存不足')) {
      description = '模型处理失败：显存不足。建议您降低输入文件的分辨率或缩短视频时长，然后重试。';
    } else if (message?.includes('服务器繁忙')) {
      description = '服务器当前负载较高，请您稍后重试。';
    }
    // 更多自定义错误可以在此添加

    toast({
      title: '任务失败',
      description,
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  };

  // 统一的状态声明
  const [selectedApp, setSelectedApp] = useState(null);
  const [tasks, setTasks] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const { isOpen: isResultModalOpen, onOpen: onResultModalOpen, onClose: onResultModalClose } = useDisclosure();
  const [resultImage, setResultImage] = useState(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [taskQueueOpen, setTaskQueueOpen] = useState(() => {
    // 默认情况下，如果没有正在运行或排队的任务，则折叠任务列表
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const currentTasks = JSON.parse(savedTasks);
        // 如果有活动任务，则展开
        return currentTasks.some(t => t.status === 'running' || t.status === 'queued');
      }
    }
    return false; // 否则默认为折叠
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // UI颜色
  const bg = '#0a0a0a';
  const dropzoneBg = 'rgba(255, 255, 255, 0.05)';
  const dropzoneBorder = 'rgba(255, 255, 255, 0.2)';
  const fileInfoBgColor = 'rgba(255, 255, 255, 0.1)';

  const creationAreaRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const queuedTask = tasks.find(t => t.status === 'queued');
    if (queuedTask && activeTaskCount < 1) {
      runTask(queuedTask);
    }
  }, [tasks, activeTaskCount]);

  // 新增: 选择应用后自动滚动到创作区域
  useEffect(() => {
    if (selectedApp) {
      setTimeout(() => {
        creationAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedApp]);

  // hooks声明结束，不能再有hook
  if (status === 'loading') return null;

  const handleAppClick = (app) => {
    if (selectedApp && selectedApp.key === app.key) {
      setSelectedApp(null);
    } else {
      setSelectedApp(app);
    }
    setFile(null);
    setPreviewUrl(null);
  };
  
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      event.target.value = '';
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
  };

  const handleTextChange = (e) => {
    setTextInputValue(e.target.value);
  };

  const handleGenerate = async () => {
    if (!selectedApp || !file || !session) {
      toast({ title: '准备工作未就绪', description: '请先选择应用、上传文件并确保您已登录。', status: 'warning', duration: 5000, isClosable: true });
      return;
    }

    const newTask = {
      id: `task_${Date.now()}`,
      appKey: selectedApp.key,
      file: file,
      status: 'queued',
      resultImage: null,
      createdAt: Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);
    setTaskQueueOpen(true);
  };
  
  const runTask = async (task) => {
    setActiveTaskCount(prev => prev + 1);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'running', startTime: Date.now() } : t));

    let taskId = task.id;

    try {
      const formData = new FormData();
      formData.append('file', task.file);
      const uploadRes = await fetch('/api/runninghub/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || '上传失败');

      const appConfig = apps.find(a => a.key === task.appKey);
      
      // 使用新的、结构正确的 nodeInfoList
      const nodeInfoList = appConfig.nodeInfoList.map(node => ({
        ...node,
        // 如果节点的 fieldValue 是 'user_upload'，则替换为上传后的文件 ID
        fieldValue: node.fieldValue === 'user_upload' ? uploadData.fileId : node.fieldValue,
      }));

      const runRes = await fetch('/api/runninghub/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webappId: appConfig.webappId,
          nodeInfoList
        }),
      });
      const runData = await runRes.json();
      if (!runRes.ok) throw new Error(runData.error || '任务启动失败');
      taskId = runData.taskId;
      setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, id: taskId } : t)));
      pollStatus(taskId, task.appKey, 0);
    } catch (error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed', error: error.message } : t));
      showErrorToast(error.message);
      setActiveTaskCount(prev => prev - 1);
    }
  };

  const pollStatus = async (taskId, appKey, retries = 0, networkErrorRetries = 0) => {
    // 每次轮询间隔5秒，最多轮询360次（30分钟）
    const MAX_RETRIES = 360; 
    const POLLING_INTERVAL = 5000;
    const MAX_NETWORK_ERROR_RETRIES = 5; // 新增：网络错误最多重试5次

    if (retries > MAX_RETRIES) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'failed' } : t));
      toast({ title: '任务超时', description: '长时间未获取到任务结果，请稍后在"我的项目"中查看。', status: 'error', duration: 8000, isClosable: true });
      setActiveTaskCount(prev => prev - 1);
      return;
    }

    try {
      const statusRes = await fetch('/api/runninghub/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      // 首先检查HTTP响应本身是否成功
      if (!statusRes.ok) {
        // 如果是5xx服务器错误，直接标记为失败
        if (statusRes.status >= 500) {
           throw new Error(`服务器繁忙，请稍后再试`);
        }
        // 对于其他客户端错误（如4xx），也视为失败
        const errorData = await statusRes.json();
        throw new Error(errorData.error || `请求失败 (状态码: ${statusRes.status})`);
      }

      const statusData = await statusRes.json();
        
      if (statusData.status?.toLowerCase() === 'completed' || statusData.status?.toLowerCase() === 'success') {
        const resultRes = await fetch('/api/runninghub/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        });
        if (resultRes.ok) {
          const resultData = await resultRes.json();
          if (resultData.success) {
            setTasks(prev => prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', resultImage: resultData.imageUrl, taskCostTime: resultData.taskCostTime } 
                : task
            ));
            setActiveTaskCount(prev => prev - 1); // 任务结束，计数减一
            
            // 自动保存作品到数据库
            try {
              const saveRes = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  appName: appKey, // 保存未经翻译的key
                  imageUrl: resultData.imageUrl,
                }),
              });
              if (saveRes.status === 401) {
                toast({ title: t('toast.loginRequired'), description: t('toast.loginToSave'), status: 'info', duration: 5000, isClosable: true });
              }
            } catch (saveError) {
              console.error('Save project error:', saveError);
              // 保存失败不影响主流程，只在控制台提示
            }
            return; // 成功获取结果，停止轮询
          }
        }
        // 如果获取结果失败，也标记为失败
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'failed', error: t('task.error.fetchResultFailed') } : task));
        setActiveTaskCount(prev => prev - 1); // 任务结束，计数减一

      } else if (statusData.status?.toLowerCase() === 'failed' || statusData.status?.toLowerCase() === 'error') {
        const errorMessage = statusData.error || t('task.error.executionFailed');
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'failed', error: errorMessage } : task));
        setActiveTaskCount(prev => prev - 1); // 任务结束，计数减一
        showErrorToast(errorMessage);
      } else { // 任务仍在进行中
        setTimeout(() => pollStatus(taskId, appKey, retries + 1, 0), POLLING_INTERVAL); // 网络正常，重置网络错误计数器
      }
    } catch (error) {
      // 对"服务器繁忙"等瞬时网络错误进行重试
      if (error.message.includes('服务器繁忙') && networkErrorRetries < MAX_NETWORK_ERROR_RETRIES) {
        setTimeout(() => pollStatus(taskId, appKey, retries + 1, networkErrorRetries + 1), POLLING_INTERVAL);
        return;
      }

      // 最终的错误处理
      setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'failed', error: error.message } : task));
      showErrorToast(error.message);
      setActiveTaskCount(prev => prev - 1);
    }
  };

  // 任务取消
  const handleCancelTask = (taskId) => {
    const taskToCancel = tasks.find(t => t.id === taskId);
    // 仅当任务在排队中时，取消才有意义
    if (taskToCancel && taskToCancel.status === 'queued') {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };
  // 任务重试
  const handleRetryTask = (task) => {
    // 直接将原任务重新入队，保留原id和file，重置状态
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'queued' } : t));
  };
  // 新增：任务删除
  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // 如果任务正在运行，删除时需要将会话数减一，以允许新任务启动
    if (taskToDelete.status === 'running') {
      setActiveTaskCount(prev => (prev > 0 ? prev - 1 : 0));
    }
    
    // 从前端列表中移除任务
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    toast({
        title: "任务已移除",
        description: "该任务已从您的列表中移除。",
        status: 'info',
        duration: 3000,
        isClosable: true,
    });
  };

  const handleResultClick = (task) => {
    setResultImage(task.resultImage);
    onResultModalOpen();
  };

  const statusOrder = {
    running: 1,
    queued: 2,
    completed: 3,
    failed: 4,
  };

  const sortedTasks = [...tasks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return (
    <Box bg={bg} minH="100vh">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <TaskQueue tasks={sortedTasks} isOpen={taskQueueOpen} onToggle={() => setTaskQueueOpen(!taskQueueOpen)} onCancelTask={handleCancelTask} onRetryTask={handleRetryTask} onDeleteTask={handleDeleteTask} onResultClick={handleResultClick} />

      <Box ml={sidebarOpen ? '240px' : '60px'} mr={taskQueueOpen ? '300px' : '60px'} transition="margin 0.3s ease-in-out" p={{ base: 4, md: 8 }} pt={{ base: '80px', md: '100px' }}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="stretch" mb={10}>
              <Heading as="h1" size="xl" color="white" className="hero-title">
                {selectedApp ? t(`apps.${selectedApp.key}`) : t('creationCenter.title')}
              </Heading>
              {!selectedApp && (
                <Text fontSize="lg" color="gray.300">
                  {t('creationCenter.subtitle')}
                </Text>
              )}
          </VStack>

          <Box
            ref={creationAreaRef}
            p={{ base: 4, md: 8 }}
            bg="rgba(255, 255, 255, 0.05)"
            backdropFilter="blur(10px)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="xl"
            shadow="xl"
            className="modern-card"
          >
            <VStack spacing={6} align="stretch">
              <Textarea
                value={textInputValue}
                onChange={handleTextChange}
                placeholder={t('creationCenter.promptPlaceholder')}
                size="lg"
                minHeight="150px"
                isDisabled={!selectedApp}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.2)"
                color="white"
                _placeholder={{ color: 'gray.400' }}
                _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
              />
                              <HStack justify="space-between">
                <HStack>
                  <Button 
                    onClick={handleUploadClick} 
                    leftIcon={<FaUpload />} 
                    isDisabled={!selectedApp}
                    variant="outline"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    color="white"
                    _hover={{ 
                      bg: 'rgba(255, 255, 255, 0.1)', 
                      borderColor: 'rgba(255, 255, 255, 0.3)' 
                    }}
                  >
                    {t('creationCenter.uploadButton')}
                  </Button>
                  {file && (
                    <HStack spacing={2} bg={fileInfoBgColor} p={2} borderRadius="md" maxW="200px">
                      <Text fontSize="sm" noOfLines={1} color="white">{file.name}</Text>
                      <Icon as={FaTimes} cursor="pointer" onClick={handleRemoveFile} color="gray.300" _hover={{ color: 'white' }} />
                    </HStack>
                  )}
                </HStack>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleGenerate}
                  isLoading={tasks.some(t => t.status === 'running' || t.status === 'queued')}
                  leftIcon={<FaPlus />}
                  isDisabled={!selectedApp || (!file && !selectedApp.nodeInfoList.every(n => n.fieldName !== 'image'))}
                >
                  {t('creationCenter.generateButton')}
                </Button>
              </HStack>
            </VStack>
          </Box>

          <VStack spacing={4} align="stretch" mt={12}>
            <Heading as="h2" size="lg">{t('create.allApps')}</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
              {apps.map((app) => (
                <AppCard
                  key={app.key}
                  {...app}
                  title={t(`apps.${app.key}`)}
                  onClick={() => handleAppClick(app)}
                  isSelected={selectedApp?.key === app.key}
                />
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      <Modal isOpen={isResultModalOpen} onClose={onResultModalClose} isCentered size="xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="rgba(26, 26, 46, 0.95)" color="white" border="1px solid rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)">
          <ModalHeader color="white">生成结果</ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }} />
          <ModalBody>
            {resultImage ? (
               resultImage.toLowerCase().endsWith('.mp4') || resultImage.toLowerCase().endsWith('.webm') ? (
                <Box as="video" src={resultImage} controls autoPlay borderRadius="md" w="100%" />
              ) : (
                <Image src={resultImage} alt="生成结果" borderRadius="md" w="100%" />
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
              onClick={onResultModalClose}
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              关闭
            </Button>
            <Button 
              as="a" 
              href={resultImage} 
              download={`result-${Date.now()}`} 
              colorScheme="blue"
              _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
            >
              下载
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*,video/*" />
    </Box>
  );
}

export async function getServerSideProps({ req, locale }) {
  const session = await getSession({ req });

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 