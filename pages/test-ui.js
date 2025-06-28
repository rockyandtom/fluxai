import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { IoLanguage } from 'react-icons/io5';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function TestUI() {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bg} minH="100vh" p={8}>
      <VStack spacing={8} align="center" maxW="800px" mx="auto">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          弹出框渲染测试页面
        </Text>
        
        <Text color={textColor} textAlign="center">
          这个页面用于测试弹出框的渲染效果，检查边缘是否平滑无锯齿
        </Text>

        <HStack spacing={6} wrap="wrap" justify="center">
          {/* 语言切换菜单测试 */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              leftIcon={<IoLanguage />}
              rightIcon={<ChevronDownIcon />}
              color={textColor}
              fontSize="sm"
              _hover={{ bg: 'gray.50', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              rounded="lg"
            >
              语言切换测试
            </MenuButton>
            <MenuList 
              bg="white" 
              border="none"
              shadow="none"
              rounded="lg"
              minW="150px"
              py={2}
              sx={{
                WebkitBackfaceVisibility: 'hidden',
                WebkitTransform: 'translate3d(0, 0, 0)',
                transform: 'translate3d(0, 0, 0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                outline: '1px solid rgba(0, 0, 0, 0.05)',
                outlineOffset: '-1px',
              }}
            >
              <MenuItem 
                _hover={{ bg: 'gray.50' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                English
              </MenuItem>
              <MenuItem 
                _hover={{ bg: 'gray.50' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                中文
              </MenuItem>
            </MenuList>
          </Menu>

          {/* 用户菜单测试 */}
          <Menu>
            <MenuButton
              as={Button}
              variant="outline"
              rightIcon={<ChevronDownIcon />}
              color={textColor}
              fontSize="sm"
              _hover={{ bg: 'gray.50', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              rounded="lg"
            >
              用户菜单测试
            </MenuButton>
            <MenuList 
              bg="white" 
              border="none"
              shadow="none"
              rounded="lg"
              minW="180px"
              py={2}
              sx={{
                WebkitBackfaceVisibility: 'hidden',
                WebkitTransform: 'translate3d(0, 0, 0)',
                transform: 'translate3d(0, 0, 0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                outline: '1px solid rgba(0, 0, 0, 0.05)',
                outlineOffset: '-1px',
              }}
            >
              <MenuItem 
                _hover={{ bg: 'gray.50' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                我的作品
              </MenuItem>
              <MenuItem 
                _hover={{ bg: 'gray.50' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                创作中心
              </MenuItem>
              <MenuItem 
                _hover={{ bg: 'red.50', color: 'red.600' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                退出登录
              </MenuItem>
            </MenuList>
          </Menu>

          {/* 额外测试菜单 */}
          <Menu>
            <MenuButton
              as={Button}
              colorScheme="blue"
              rightIcon={<ChevronDownIcon />}
              fontSize="sm"
              _hover={{ transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              rounded="lg"
            >
              样式测试
            </MenuButton>
            <MenuList 
              bg="white" 
              border="none"
              shadow="none"
              rounded="lg"
              minW="160px"
              py={2}
              sx={{
                WebkitBackfaceVisibility: 'hidden',
                WebkitTransform: 'translate3d(0, 0, 0)',
                transform: 'translate3d(0, 0, 0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                outline: '1px solid rgba(0, 0, 0, 0.05)',
                outlineOffset: '-1px',
              }}
            >
              <MenuItem 
                _hover={{ bg: 'blue.50', color: 'blue.600' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                选项一
              </MenuItem>
              <MenuItem 
                _hover={{ bg: 'green.50', color: 'green.600' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                选项二
              </MenuItem>
              <MenuItem 
                _hover={{ bg: 'purple.50', color: 'purple.600' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                选项三
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        <Box 
          bg="white" 
          rounded="lg" 
          p={6} 
          shadow="sm" 
          border="1px" 
          borderColor={borderColor}
          maxW="600px"
        >
          <VStack spacing={4} align="start">
            <Text fontWeight="bold" color={textColor}>
              测试说明：
            </Text>
            <VStack spacing={2} align="start" fontSize="sm" color={textColor}>
              <Text>• 点击上方的按钮打开弹出框</Text>
              <Text>• 仔细观察弹出框的边缘是否平滑</Text>
              <Text>• 特别注意右侧边缘是否还有锯齿状效果</Text>
              <Text>• 测试不同浏览器（Chrome、Firefox、Safari、Edge）</Text>
              <Text>• 在不同缩放级别下测试（100%、125%、150%）</Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
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