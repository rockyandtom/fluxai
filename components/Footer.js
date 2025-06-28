import { Box, Container, Stack, Text, Link } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';

export default function Footer() {
  const { t } = useTranslation('common');
  
  return (
    <Box bg="#1a1a2e" color="white" mt={16} py={6} borderTop="1px solid rgba(255, 255, 255, 0.1)">
      <Container as={Stack} maxW={'6xl'} spacing={4} justify={'center'} align={'center'}>
        <Text color="gray.300">{t('footer.copyright', '© 2024 Flux AI. All rights reserved.')}</Text>
        <Stack direction={'row'} spacing={6}>
          <Link href={'#'} color="gray.300" _hover={{ color: 'white' }} transition="color 0.2s">{t('footer.about', '关于我们')}</Link>
          <Link href={'#'} color="gray.300" _hover={{ color: 'white' }} transition="color 0.2s">{t('footer.contact', '联系我们')}</Link>
          <Link href={'#'} color="gray.300" _hover={{ color: 'white' }} transition="color 0.2s">{t('footer.privacy', '隐私政策')}</Link>
        </Stack>
      </Container>
    </Box>
  );
} 