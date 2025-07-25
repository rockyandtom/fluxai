import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Flex,
  Button,
  Stack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Avatar,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  VStack,
  Text,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { ChevronDownIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { IoLanguage } from 'react-icons/io5';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { data: session } = useSession();
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const bg = '#0a0a0a';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const textColor = 'white';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleLanguageChange = (newLocale) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
    onClose();
  };

  const handleNavClick = (href, e) => {
    if (href === '/learn' || href === '/tutorial' || href === '/contact') {
      e.preventDefault();
      toast({
        title: t('toast.featureInDevelopment'),
        description: t('toast.featureInDevelopmentDesc'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } else if (href === '/#why-choose-us' || href === '/#faq' || href === '/#showcase') {
      e.preventDefault();
      const targetId = href.substring(2); // 移除 '/#'
      if (router.pathname !== '/') {
        // 如果不在首页，先跳转到首页再滚动到目标位置
        router.push('/').then(() => {
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        });
      } else {
        // 如果在首页，直接滚动到目标位置
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      onClose();
    }
  };

  const NavLink = ({ href, children }) => (
    <Link 
      as={NextLink} 
      href={href} 
      style={{ textDecoration: 'none' }} 
      onClick={(e) => handleNavClick(href, e)}
    >
      <Button 
        variant="ghost" 
        w="100%" 
        color={textColor}
        _hover={{ bg: 'rgba(255, 255, 255, 0.1)', transform: 'translateY(-1px)' }}
        transition="all 0.2s"
        rounded="lg"
      >
        {children}
      </Button>
    </Link>
  );

  const navLinks = [
    { href: '/create', label: t('nav.start') },
    { href: '/tutorial', label: t('nav.tutorial') },
    { href: '/#showcase', label: t('nav.showcase') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/#why-choose-us', label: t('nav.whyChooseUs') },
    { href: '/#faq', label: t('nav.faq') },
    { href: '/learn', label: t('nav.learn') },
  ];

  const DesktopNav = ({ navItems }) => {
    return (
      <HStack spacing={1} justify="center">
        {navItems.map((navItem) => (
          <Link
            key={navItem.label}
            as={NextLink}
            href={navItem.href ?? '#'}
            style={{ textDecoration: 'none' }}
            onClick={(e) => handleNavClick(navItem.href, e)}
          >
            <Button
              variant="ghost"
              color={textColor}
              fontSize="sm"
              fontWeight="500"
              px={4}
              py={2}
              rounded="lg"
              _hover={{
                bg: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                transform: 'translateY(-1px)',
                shadow: 'md'
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              {navItem.label}
            </Button>
          </Link>
        ))}
      </HStack>
    );
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex="sticky"
      h="70px"
      shadow="sm"
    >
      <Flex
        color={textColor}
        minH="70px"
        py={{ base: 3 }}
        px={{ base: 6, md: 8 }}
        align="center"
        maxW="1400px"
        mx="auto"
        position="relative"
      >
        {/* Left Side - Mobile Menu + Logo */}
        <Flex align="center" position="absolute" left={{ base: 6, md: 8 }} zIndex={2}>
          {/* Mobile Hamburger Menu */}
          <IconButton
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            color={textColor}
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            size="lg"
            mr={3}
          />

          {/* Logo */}
          <Link as={NextLink} href="/" style={{ textDecoration: 'none' }}>
            <HStack spacing={2} _hover={{ transform: 'scale(1.05)' }} transition="all 0.2s">
              <Text 
                fontWeight="bold" 
                fontSize="2xl" 
                color="white"
                whiteSpace="nowrap"
              >
                Flux AI
              </Text>
            </HStack>
          </Link>
        </Flex>

        {/* Center - Desktop Navigation - 完全居中 */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          justify="center"
          align="center"
          position="absolute"
          left="50%"
          transform="translateX(-50%)"
          zIndex={1}
        >
          <DesktopNav navItems={navLinks} />
        </Flex>

        {/* Right Side - Language + Auth */}
        <HStack spacing={3} position="absolute" right={{ base: 6, md: 8 }} zIndex={2} justify="flex-end">
          {/* Language Switcher */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              leftIcon={<IoLanguage />}
              rightIcon={<ChevronDownIcon />}
              color={textColor}
              fontSize="sm"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
              rounded="lg"
            >
              {i18n.language === 'en' ? 'EN' : '中文'}
            </MenuButton>
            <MenuList 
              bg="rgba(26, 26, 46, 0.98)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              shadow="lg"
              rounded="lg"
              minW="120px"
              py={2}
              color="white"
              sx={{
                WebkitBackfaceVisibility: 'hidden',
                WebkitTransform: 'translate3d(0, 0, 0)',
                transform: 'translate3d(0, 0, 0)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))',
                background: 'rgba(26, 26, 46, 0.98) !important',
                backdropFilter: 'blur(10px) saturate(180%)',
                WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1) !important',
                outline: '1px solid rgba(255, 255, 255, 0.05)',
                outlineOffset: '-1px',
                color: '#ffffff !important',
                '& .chakra-menu__menuitem': {
                  color: '#ffffff !important',
                  background: 'transparent !important',
                  _hover: {
                    background: 'rgba(255, 255, 255, 0.1) !important',
                    color: '#ffffff !important'
                  }
                }
              }}
            >
              <MenuItem 
                onClick={() => handleLanguageChange('en')}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                rounded="md"
                mx={1}
                my={0.5}
                py={2}
                fontSize="sm"
              >
                English
              </MenuItem>
              <MenuItem 
                onClick={() => handleLanguageChange('zh')}
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
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

          {/* User Menu or Auth Buttons */}
          {session ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="ghost"
                cursor="pointer"
                minW={0}
                p={1}
                _hover={{ transform: 'scale(1.1)' }}
                transition="all 0.2s"
              >
                <Avatar
                  size="sm"
                  src={session.user.image || `https://avatars.dicebear.com/api/male/${session.user.email}.svg`}
                  border="2px solid"
                  borderColor="rgba(255, 255, 255, 0.2)"
                />
              </MenuButton>
              <MenuList 
                bg="rgba(26, 26, 46, 0.98)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                shadow="lg"
                rounded="lg"
                minW="160px"
                py={2}
                color="white"
                sx={{
                  WebkitBackfaceVisibility: 'hidden',
                  WebkitTransform: 'translate3d(0, 0, 0)',
                  transform: 'translate3d(0, 0, 0)',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))',
                  background: 'rgba(26, 26, 46, 0.98) !important',
                  backdropFilter: 'blur(10px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(10px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1) !important',
                  outline: '1px solid rgba(255, 255, 255, 0.05)',
                  outlineOffset: '-1px',
                  color: '#ffffff !important',
                  '& .chakra-menu__menuitem': {
                    color: '#ffffff !important',
                    background: 'transparent !important',
                    _hover: {
                      background: 'rgba(255, 255, 255, 0.1) !important',
                      color: '#ffffff !important'
                    }
                  }
                }}
              >
                <MenuItem 
                  as={NextLink} 
                  href="/projects" 
                  onClick={onClose}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  rounded="md"
                  mx={1}
                  my={0.5}
                  py={2}
                  fontSize="sm"
                >
                  {t('nav.projects')}
                </MenuItem>
                <MenuItem 
                  as={NextLink} 
                  href="/create" 
                  onClick={onClose}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  rounded="md"
                  mx={1}
                  my={0.5}
                  py={2}
                  fontSize="sm"
                >
                  {t('nav.workspace')}
                </MenuItem>
                <MenuItem 
                  onClick={() => { signOut(); onClose(); }}
                  _hover={{ bg: 'rgba(239, 68, 68, 0.1)', color: 'red.400' }}
                  rounded="md"
                  mx={1}
                  my={0.5}
                  py={2}
                  fontSize="sm"
                >
                  {t('nav.logout')}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
              <Link as={NextLink} href="/login" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="ghost" 
                  color={textColor}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)', transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                  rounded="lg"
                >
                  {t('nav.login')}
                </Button>
              </Link>
              <Link as={NextLink} href="/register" style={{ textDecoration: 'none' }}>
                <Button 
                  colorScheme="blue"
                  _hover={{ 
                    transform: 'translateY(-2px)',
                    shadow: 'lg'
                  }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                  fontWeight="600"
                  rounded="lg"
                  px={6}
                >
                  {t('nav.register')}
                </Button>
              </Link>
            </HStack>
          )}
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay bg="blackAlpha.800" />
        <DrawerContent 
          bg={bg}
          border="none"
          color={textColor}
          sx={{
            background: '#0a0a0a !important',
            color: '#ffffff !important',
            '& .chakra-drawer__header': {
              background: '#0a0a0a !important',
              color: '#ffffff !important',
              borderColor: 'rgba(255, 255, 255, 0.1) !important'
            },
            '& .chakra-drawer__body': {
              background: '#0a0a0a !important',
              color: '#ffffff !important'
            },
            '& .chakra-text': {
              color: '#ffffff !important'
            },
            '& .chakra-button': {
              color: '#ffffff !important',
              _hover: {
                background: 'rgba(255, 255, 255, 0.1) !important'
              }
            }
          }}
        >
          <DrawerHeader 
            borderBottomWidth="1px" 
            borderColor={borderColor}
            fontSize="xl"
            fontWeight="bold"
            color={textColor}
            bg="#0a0a0a"
            sx={{
              background: '#0a0a0a !important',
              color: '#ffffff !important'
            }}
          >
            <HStack>
              <Text>Flux AI</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody 
            py={6}
            bg="#0a0a0a"
            color="white"
            sx={{
              background: '#0a0a0a !important',
              color: '#ffffff !important'
            }}
          >
            <VStack as="nav" spacing={3} align="stretch">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
              ))}
              {!session && (
                <>
                  <Box h={4} />
                  <NavLink href="/login">{t('nav.login')}</NavLink>
                  <Link as={NextLink} href="/register" style={{ textDecoration: 'none' }}>
                    <Button 
                      colorScheme="blue"
                      w="full"
                      rounded="lg"
                      fontWeight="600"
                      _hover={{ transform: 'translateY(-1px)', shadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      {t('nav.register')}
                    </Button>
                  </Link>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}