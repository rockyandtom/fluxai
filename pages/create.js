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
      leftIcon={<Spinner size="xs" color="white" />}
      color="white"
      fontWeight="medium"
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
        return <Badge colorScheme={scheme} fontWeight="medium">{text} {status === 'running' && <Spinner size="xs" ml={1} color="white" />}</Badge>;
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
                                    <Box 
                                        key={task.id} 
                                        p={4} 
                                        borderWidth={2} 
                                        borderRadius="xl" 
                                        bg={task.status === 'running' ? "transparent" : "rgba(255, 255, 255, 0.08)"} 
                                        border={task.status === 'running' ? "none" : "1px solid rgba(255, 255, 255, 0.2)"} 
                                        className={task.status === 'running' ? "task-running" : "modern-card"} 
                                        backdropFilter="blur(15px)"
                                    >
                                        <Flex justify="space-between" align="center" mb={2}>
                                            <Text fontWeight="bold" noOfLines={1} color="white">{t(`apps.${task.appKey}`)}</Text>
                                            {getStatusBadge(task.status)}
                                        </Flex>
                                        <Text fontSize="xs" color={task.status === 'running' ? "gray.200" : "gray.300"} mb={2}>
                                            {new Date(task.createdAt).toLocaleString()}
                                        </Text>

                                        {task.status === 'completed' && task.resultImage ? (
                                            <>
                                                {task.resultImage.toLowerCase().endsWith('.mp4') || task.resultImage.toLowerCase().endsWith('.webm') ? (
                                                    <Box as="video" src={task.resultImage} autoPlay loop muted playsInline borderRadius="md" cursor="pointer" onClick={() => onResultClick(task)} _hover={{ opacity: 0.8 }} objectFit="cover" w="100%" h="120px" />
                                                ) : (
                                                    <Image src={task.resultImage} alt="Generated Result" borderRadius="md" cursor="pointer" onClick={() => onResultClick(task)} _hover={{ opacity: 0.8 }} />
                                                )}
                                                <Flex justify="space-between" align="center" mt={2} fontSize="xs">
                                                    <Text color="gray.200" fontWeight="medium">{t('task.runtime', '运行时长')}: {formatDuration(task.taskCostTime)}</Text>
                                                    <Text color="gray.200" fontWeight="medium">{getExpiryInfo(task.createdAt)}</Text>
                                                </Flex>
                                            </>
                                        ) : (
                                            task.status !== 'completed' && (
                                                <Box 
                                                    p={3}
                                                    bg={task.status === 'running' ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)"}
                                                    borderRadius="md"
                                                    border={task.status === 'running' ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.2)"}
                                                    position="relative"
                                                    overflow="hidden"
                                                >
                                                    {task.status === 'running' && (
                                                        <Box
                                                            position="absolute"
                                                            top="0"
                                                            left="0"
                                                            height="100%"
                                                            bg="linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)"
                                                            width="50%"
                                                            style={{ animation: 'slide 2s infinite linear' }}
                                                        />
                                                    )}
                                                    <Flex align="center" justify="space-between" position="relative" zIndex="1">
                                                        <Text fontSize="sm" color="white" fontWeight="medium">
                                                            {t('task.estimate')}
                                                        </Text>
                                                        {task.status === 'running' && (
                                                            <Box 
                                                                w="6px" 
                                                                h="6px" 
                                                                bg="blue.400" 
                                                                borderRadius="full"
                                                                style={{ animation: 'pulse 1.5s infinite' }}
                                                            />
                                                        )}
                                                    </Flex>
                                                </Box>
                                            )
                                        )}
                                        <HStack mt={3} justify="flex-end" spacing={2}>
                                            {task.status === 'running' && <TaskTimer startTime={task.startTime} />}
                                            {(task.status === 'completed' || task.status === 'failed') && (
                                                <Button 
                                                    size="xs" 
                                                    onClick={() => onRetryTask(task)}
                                                    className="task-button"
                                                    bg="blue.500"
                                                    color="white"
                                                    _hover={{ bg: "blue.600" }}
                                                    fontWeight="medium"
                                                >
                                                    {t('task.retry', '重新生成')}
                                                </Button>
                                            )}
                                            {task.status === 'queued' && (
                                                <Button 
                                                    size="xs" 
                                                    onClick={() => onCancelTask(task.id)}
                                                    className="task-cancel-button task-button"
                                                    color="white"
                                                    fontWeight="medium"
                                                >
                                                    {t('task.cancel', '取消')}
                                                </Button>
                                            )}
                                            <IconButton
                                                size="xs"
                                                icon={<FaTimes />}
                                                aria-label="Delete task"
                                                className="task-button"
                                                bg="gray.600"
                                                color="white"
                                                _hover={{ bg: "gray.700" }}
                                                onClick={() => onDeleteTask(task.id)}
                                                borderRadius="md"
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

  // 遵循网站开发规范指南 - 统一的错误提示函数
  const showErrorToast = (message) => {
    let title = '任务失败';
    let description = message;
    let status = 'error';
    let duration = 9000;

    // 区分不同类型的错误，提供合适的用户提示
    if (message?.includes('后端执行失败:')) {
      title = 'AI处理失败';
      description = message.replace('后端执行失败:', '').trim();
      if (description.includes('显存不足') || description.includes('memory')) {
        description = 'AI模型处理失败：显存不足。建议您降低输入文件的分辨率或缩短视频时长，然后重试。';
      } else if (description.includes('timeout') || description.includes('超时')) {
        description = 'AI处理超时，可能是由于任务复杂度较高。建议您简化输入内容后重试。';
      } else if (description.includes('格式') || description.includes('format')) {
        description = '输入文件格式不支持或文件损坏，请检查文件格式后重试。';
      }
    } else if (message?.includes('后端错误:')) {
      title = '服务错误';
      description = message.replace('后端错误:', '').trim();
      if (description.includes('任务不存在')) {
        description = '任务已过期或不存在，请重新开始创作。';
      }
    } else if (message?.includes('上传失败')) {
      title = '文件上传失败';
      description = '文件上传遇到问题，请检查网络连接或文件大小后重试。';
      status = 'warning';
    } else if (message?.includes('任务启动失败')) {
      title = '任务启动失败';
      description = '任务启动遇到问题，请稍后重试。如果问题持续存在，请联系客服。';
      status = 'warning';
    }

    toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      position: 'top',
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

  const handleGenerate = async () => {
    // 遵循网站开发规范指南 - 详细的错误检查和用户提示
    if (!session) {
      toast({ 
        title: t('toast.loginRequired', '需要登录'), 
        description: t('toast.loginToSave', '登录后您的作品将自动保存'), 
        status: 'warning', 
        duration: 5000, 
        isClosable: true 
      });
      return;
    }
    
    if (!selectedApp) {
      toast({ 
        title: t('toast.selectApp', '请先选择一个应用'), 
        description: '请在下方选择一个AI应用开始创作', 
        status: 'warning', 
        duration: 5000, 
        isClosable: true 
      });
      return;
    }

    // 检查是否需要文件上传 - 某些应用可能不需要文件输入
    const requiresFile = selectedApp?.nodeInfoList?.some(n => n.fieldName === 'image' || n.fieldValue === 'user_upload');
    if (requiresFile && !file) {
      toast({ 
        title: '请上传文件', 
        description: '该应用需要您上传图片或视频文件', 
        status: 'warning', 
        duration: 5000, 
        isClosable: true 
      });
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
    
    // 成功提示
    toast({ 
      title: '任务已创建', 
      description: '您的创作任务已加入队列，请稍等...', 
      status: 'success', 
      duration: 3000, 
      isClosable: true 
    });
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

  const pollStatus = async (taskId, appKey, retries = 0, consecutiveNetworkErrors = 0) => {
    // 遵循网站开发规范指南 - 错误处理机制
    const MAX_RETRIES = 720; // 增加到60分钟（720次 * 5秒）
    const POLLING_INTERVAL = 5000;
    const MAX_CONSECUTIVE_NETWORK_ERRORS = 10; // 连续网络错误最多10次
    const BACKOFF_MULTIPLIER = 1.5; // 退避策略乘数

    // 超时处理：只有在达到最大轮询次数时才视为超时
    if (retries > MAX_RETRIES) {
      setTasks(prev => prev.map(t => t.id === taskId ? { 
        ...t, 
        status: 'failed', 
        error: '任务执行超时，但可能仍在后台处理中，请稍后在"我的项目"页面查看结果' 
      } : t));
      toast({ 
        title: '任务超时', 
        description: '长时间未获取到任务结果，但任务可能仍在后台处理，请稍后在"我的项目"中查看。', 
        status: 'warning', 
        duration: 10000, 
        isClosable: true 
      });
      setActiveTaskCount(prev => prev - 1);
      return;
    }

    try {
      const statusRes = await fetch('/api/runninghub/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      // 检查HTTP响应状态
      if (!statusRes.ok) {
        const errorData = await statusRes.json().catch(() => ({}));
        
        // 区分后端业务错误和网络错误
        if (statusRes.status >= 500) {
          // 5xx错误：服务器错误，可能是临时的，继续重试
          throw new Error('NETWORK_ERROR');
        } else if (statusRes.status >= 400) {
          // 4xx错误：客户端错误，检查是否是后端业务错误
          if (errorData.error && errorData.error.includes('任务不存在') || errorData.error && errorData.error.includes('invalid')) {
            // 这是真正的后端业务错误，不再重试
            throw new Error(`后端错误: ${errorData.error || '请求失败'}`);
          } else {
            // 其他4xx错误，当作网络错误处理
            throw new Error('NETWORK_ERROR');
          }
        }
      }

      const statusData = await statusRes.json();
      
      // 检查响应数据结构
      if (!statusData || typeof statusData !== 'object') {
        throw new Error('NETWORK_ERROR');
      }
        
      if (statusData.status?.toLowerCase() === 'completed' || statusData.status?.toLowerCase() === 'success') {
        // 任务完成，获取结果
        const resultRes = await fetch('/api/runninghub/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId }),
        });
        
        if (resultRes.ok) {
          const resultData = await resultRes.json();
          if (resultData.success && resultData.imageUrl) {
            setTasks(prev => prev.map(task => 
              task.id === taskId 
                ? { ...task, status: 'completed', resultImage: resultData.imageUrl, taskCostTime: resultData.taskCostTime } 
                : task
            ));
            setActiveTaskCount(prev => prev - 1);
            
            // 自动保存作品到数据库 - 增强错误处理和用户反馈
            try {
              const saveRes = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  appName: appKey,
                  imageUrl: resultData.imageUrl,
                }),
              });
              
              const saveData = await saveRes.json();
              
              if (saveRes.ok && saveData.success) {
                // 保存成功
                toast({ 
                  title: '🎉 作品已保存', 
                  description: '您的作品已自动保存到"我的项目"中！', 
                  status: 'success', 
                  duration: 4000, 
                  isClosable: true 
                });
                console.log('项目保存成功:', saveData.project.id);
                
              } else if (saveRes.status === 401) {
                // 登录过期
                toast({ 
                  title: '登录已过期', 
                  description: '请重新登录以保存作品', 
                  status: 'warning', 
                  duration: 6000, 
                  isClosable: true 
                });
                
              } else {
                // 其他错误
                console.error('保存项目失败:', saveData);
                toast({ 
                  title: '⚠️ 保存失败', 
                  description: saveData.message || '作品生成成功但保存失败，请手动截图保存', 
                  status: 'warning', 
                  duration: 8000, 
                  isClosable: true 
                });
              }
              
            } catch (saveError) {
              console.error('保存项目网络错误:', saveError);
              toast({ 
                title: '⚠️ 网络错误', 
                description: '作品生成成功但因网络问题无法保存，请手动截图保存', 
                status: 'warning', 
                duration: 8000, 
                isClosable: true 
              });
            }
            return; // 成功获取结果，停止轮询
          }
        }
        // 获取结果失败，继续重试而不是立即失败
        throw new Error('NETWORK_ERROR');

      } else if (statusData.status?.toLowerCase() === 'failed' || statusData.status?.toLowerCase() === 'error') {
        // 这是后端明确返回的失败状态，是真正的业务错误
        const errorMessage = statusData.error || statusData.message || t('task.error.executionFailed');
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'failed', error: errorMessage } : task));
        setActiveTaskCount(prev => prev - 1);
        showErrorToast(`后端执行失败: ${errorMessage}`);
        return; // 真正的失败，停止轮询
        
      } else if (statusData.status?.toLowerCase() === 'running' || statusData.status?.toLowerCase() === 'queued' || statusData.status?.toLowerCase() === 'pending') {
        // 任务仍在进行中，继续轮询
        setTimeout(() => pollStatus(taskId, appKey, retries + 1, 0), POLLING_INTERVAL);
        return;
        
      } else {
        // 未知状态，继续重试
        throw new Error('NETWORK_ERROR');
      }
      
    } catch (error) {
      // 错误处理：区分网络错误和真正的后端错误
      if (error.message === 'NETWORK_ERROR') {
        // 网络错误或临时性错误，继续重试
        if (consecutiveNetworkErrors >= MAX_CONSECUTIVE_NETWORK_ERRORS) {
          // 连续网络错误次数过多，提示用户但继续轮询
          toast({
            title: '网络不稳定',
            description: '检测到网络连接不稳定，任务仍在后台执行，请稍等...',
            status: 'warning',
            duration: 5000,
            isClosable: true
          });
          // 重置连续错误计数，继续轮询
          setTimeout(() => pollStatus(taskId, appKey, retries + 1, 0), POLLING_INTERVAL * BACKOFF_MULTIPLIER);
        } else {
          // 继续重试
          setTimeout(() => pollStatus(taskId, appKey, retries + 1, consecutiveNetworkErrors + 1), POLLING_INTERVAL);
        }
        return;
      } 
      
      if (error.message.includes('后端错误:')) {
        // 这是真正的后端业务错误，不再重试
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: 'failed', error: error.message } : task));
        setActiveTaskCount(prev => prev - 1);
        showErrorToast(error.message);
        return;
      }
      
      // 其他类型的错误（如fetch失败、网络中断等），继续重试
      if (consecutiveNetworkErrors >= MAX_CONSECUTIVE_NETWORK_ERRORS) {
        toast({
          title: '服务繁忙',
          description: '服务器当前负载较高，任务仍在后台执行，请稍等...',
          status: 'warning',
          duration: 5000,
          isClosable: true
        });
        setTimeout(() => pollStatus(taskId, appKey, retries + 1, 0), POLLING_INTERVAL * 2);
      } else {
        setTimeout(() => pollStatus(taskId, appKey, retries + 1, consecutiveNetworkErrors + 1), POLLING_INTERVAL);
      }
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
              {/* 文件上传拖拽区域 - 保持原有尺寸 */}
              <Box
                minHeight="150px"
                border="2px dashed"
                borderColor={file ? "blue.400" : "rgba(255, 255, 255, 0.2)"}
                borderRadius="lg"
                bg={file ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.1)"}
                p={6}
                cursor="pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!selectedApp) {
                    toast({
                      title: '请先选择应用',
                      description: '请在下方选择一个AI应用，然后上传文件',
                      status: 'warning',
                      duration: 3000,
                      isClosable: true,
                    });
                    return;
                  }
                  handleUploadClick();
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                transition="all 0.3s ease"
                _hover={{ 
                  borderColor: "blue.400", 
                  bg: "rgba(59, 130, 246, 0.15)",
                  transform: "translateY(-2px)"
                }}
                position="relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!selectedApp) {
                      toast({
                        title: '请先选择应用',
                        description: '请在下方选择一个AI应用，然后上传文件',
                        status: 'warning',
                        duration: 3000,
                        isClosable: true,
                      });
                      return;
                    }
                    handleUploadClick();
                  }
                }}
              >
                {file ? (
                  // 文件已选择状态
                  <VStack spacing={4}>
                    {file.type.startsWith('image/') ? (
                      <Image 
                        src={previewUrl} 
                        alt="Preview" 
                        maxH="100px" 
                        borderRadius="md"
                        objectFit="cover"
                      />
                    ) : file.type.startsWith('video/') ? (
                      <Box 
                        as="video" 
                        src={previewUrl} 
                        maxH="100px" 
                        borderRadius="md"
                        controls
                        muted
                      />
                    ) : (
                      <Icon as={FaUpload} fontSize="3xl" color="blue.400" />
                    )}
                    <VStack spacing={2}>
                      <Text color="white" fontWeight="medium" textAlign="center">
                        {file.name}
                      </Text>
                      <Text fontSize="sm" color="gray.300" textAlign="center">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        color="red.300"
                        _hover={{ color: "red.200", bg: "rgba(255, 0, 0, 0.1)" }}
                        leftIcon={<FaTimes />}
                      >
                        移除文件
                      </Button>
                    </VStack>
                  </VStack>
                ) : (
                  // 未选择文件状态
                  <VStack spacing={4} justify="center" align="center" h="full">
                    <Icon as={FaUpload} fontSize="4xl" color="gray.400" />
                    <VStack spacing={2}>
                      <Text color="white" fontWeight="medium" textAlign="center">
                        {selectedApp ? "点击或拖拽文件到此处上传" : "请先选择下方应用"}
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        支持图片和视频格式
                      </Text>
                    </VStack>
                  </VStack>
                )}
              </Box>

              {/* 生成按钮区域 */}
              <Flex justify="flex-end">
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleGenerate}
                  isLoading={tasks.some(t => t.status === 'running' || t.status === 'queued')}
                  leftIcon={<FaPlus />}
                  isDisabled={!session || !selectedApp || (selectedApp?.nodeInfoList?.some(n => n.fieldName === 'image' || n.fieldValue === 'user_upload') && !file)}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s ease"
                  title={
                    !session ? '请先登录' :
                    !selectedApp ? '请先选择应用' :
                    (selectedApp?.nodeInfoList?.some(n => n.fieldName === 'image' || n.fieldValue === 'user_upload') && !file) ? '请先上传文件' :
                    ''
                  }
                >
                  {!session ? '请先登录' :
                   !selectedApp ? '请先选择应用' :
                   (selectedApp?.nodeInfoList?.some(n => n.fieldName === 'image' || n.fieldValue === 'user_upload') && !file) ? '请先上传文件' :
                   t('creationCenter.generateButton', '生成我的作品')}
                </Button>
              </Flex>
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