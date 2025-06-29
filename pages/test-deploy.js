import { Box, Heading, Text } from '@chakra-ui/react';

export default function TestDeploy() {
  const deployTime = new Date().toISOString();
  
  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <Box 
        bg="white" 
        p={8} 
        borderRadius="xl" 
        boxShadow="2xl"
        textAlign="center"
        maxW="md"
      >
        <Heading color="purple.600" mb={4}>
          🚀 部署测试页面
        </Heading>
        <Text fontSize="lg" mb={2}>
          如果您能看到这个页面，说明最新代码已成功部署！
        </Text>
        <Text fontSize="sm" color="gray.600">
          最后更新: {deployTime}
        </Text>
        <Text fontSize="sm" color="green.600" mt={4} fontWeight="bold">
          ✅ 新版本登录页面应该已经生效
        </Text>
      </Box>
    </Box>
  );
} 