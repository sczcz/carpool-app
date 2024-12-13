import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Flex, Button, Text, VStack, Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import Login from './Login';
import Register from './Register';
import { useUser } from '../utils/UserContext';

const Home = () => {
  const { userId, roles, isInitialized } = useUser();
  const navigate = useNavigate();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
 
  useEffect(() => {
    if (isInitialized && userId && roles?.length) {
      if (roles.includes('vårdnadshavare')) {
        navigate('/dashboard-parent');
      } else if (roles.includes('ledare')) {
        navigate('/dashboard-leader');
      } else if (roles.includes('admin')) {
        navigate('/dashboard-admin');
      }
    }
  }, [userId, roles, isInitialized, navigate]);
  
  return (
    <Flex
      w="full"
      h="100vh"
      direction="column"
      backgroundImage="url(https://web.cdn.scouterna.net/uploads/sites/507/2018/02/scouter_gar_pa_skogsstig_pa_jamboree17.jpg)"
      backgroundSize="cover"
      backgroundPosition="center center"
      overflow="hidden"
    >
      <VStack
        w="full"
        justify="center"
        px={useBreakpointValue({ base: 4, md: 8 })}
        bgGradient="linear(to-r, blackAlpha.600, transparent)"
        align="center"
        flex="1"
        overflow="auto"
        pb={{ base: 4, md: 6 }}
      >
        <Box
          bg="rgba(255, 255, 255, 0.8)"
          p={{ base: 4, md: 8 }}
          borderRadius="md"
          boxShadow="lg"
          maxW="lg"
          w="full"
          mb={{ base: 4, md: 6 }}
          overflow="hidden"
        >
          <Stack maxW="2xl" align="flex-start" spacing={{ base: 4, md: 6 }}>
            <Text
              color="brand.500"
              fontWeight={700}
              lineHeight={1.2}
              fontSize={{ base: '3xl', md: '4xl' }}
              textAlign={{ base: 'center', md: 'left' }}
            >
              Välkommen till Jonstorps Kustscoutkår!
            </Text>
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="gray.700"
              maxW="100%"
              textAlign="center"
              px={{ base: 4, sm: 6 }}
            >
              {/* Display shorter message for mobile */}
              {useBreakpointValue({
                base: 'Vi underlättar samordning och samåkning för föräldrar och scouter.',
                md: 'Vi erbjuder en innovativ plattform som förenklar samordningen av transporter genom att främja samåkning mellan föräldrar och scouter. Tjänsten gör det enkelt att hitta och erbjuda platser i bilar, vilket minskar onödig körning och klimatpåverkan.',
                lg: 'Vi erbjuder en innovativ plattform som förenklar samordningen av transporter genom att främja samåkning mellan föräldrar och scouter. Tjänsten gör det enkelt att hitta och erbjuda platser i bilar, vilket minskar onödig körning och klimatpåverkan. Genom att använda vår tjänst kan föräldrar planera resor, scoutledare organisera aktiviteter och scouter få relevant information. Tillsammans kan vi skapa en hållbar och trygg miljö för alla våra medlemmar och göra ett positivt avtryck i scoutäventyret!'
              })}
            </Text>
            <Stack direction={{ sm: 'row' }} spacing={{ base: 4, sm: 6 }}>
              <Button
                colorScheme="brand"
                size={{ base: 'sm', md: 'md' }}
                bg="brand.500"
                rounded="full"
                color="white"
                _hover={{ bg: 'brand.600' }}
                onClick={onLoginOpen}
                w="full"
              >
                Logga in
              </Button>
              <Button
                colorScheme="gray"
                size={{ base: 'sm', md: 'md' }}
                bg="rgba(255, 255, 255, 0.9)"
                rounded="full"
                color="gray.800"
                _hover={{ bg: 'rgba(255, 255, 255, 1)', color: 'gray.900' }}
                onClick={onRegisterOpen}
                w="full"
              >
                Registrera
              </Button>
            </Stack>
          </Stack>
        </Box>
  
        <Login isOpen={isLoginOpen} onClose={onLoginClose} />
        <Register isOpen={isRegisterOpen} onClose={onRegisterClose} />
      </VStack>
  
      {/* Optionally, add a small footer with some spacing */}
      <Box h="20px" />
    </Flex>
  );
  
};

export default Home;
