import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Flex, Button, Text, VStack, Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import Login from './Login';
import Register from './Register';
import { useUser } from '../utils/UserContext';

const Home = () => {
  const { userId, role, fetchUserData } = useUser();
  const navigate = useNavigate();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();

  useEffect(() => {
    if (userId && role) {
      if (role === 'vårdnadshavare') {
        navigate('/dashboard-parent');
      } else if (role === 'ledare') {
        navigate('/dashboard-leader');
      }
    }
  }, [userId, role, navigate]);
  
  return (
    <Flex
      w={'full'}
      h={'100vh'}
      backgroundImage={
        'url(https://web.cdn.scouterna.net/uploads/sites/507/2018/02/scouter_gar_pa_skogsstig_pa_jamboree17.jpg)'
      }
      backgroundSize={'cover'}
      backgroundPosition={'center center'}
    >
      <VStack
        w={'full'}
        justify={'center'}
        px={useBreakpointValue({ base: 4, md: 8 })}
        bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
      >
        <Box
          bg="rgba(255, 255, 255, 0.8)"
          p={8}
          borderRadius="md"
          boxShadow="lg"
        >
          <Stack maxW={'2xl'} align={'flex-start'} spacing={6}>
            <Text
              color={'brand.500'}
              fontWeight={700}
              lineHeight={1.2}
              fontSize={useBreakpointValue({ base: '3xl', md: '4xl' })}
            >
              Välkommen till Jonstorps Kustscoutkår!
            </Text>
            <Text
              fontSize={useBreakpointValue({ base: 'md', md: 'lg' })}
              color="gray.700"
              maxW="600px"
            >
              Vi erbjuder en innovativ plattform som förenklar samordningen av transporter genom att främja samåkning mellan föräldrar och scouter. Tjänsten gör det enkelt att hitta och erbjuda platser i bilar, vilket minskar onödig körning och klimatpåverkan. Genom att använda vår tjänst kan föräldrar planera resor, scoutledare organisera aktiviteter och scouter få relevant information. Tillsammans kan vi skapa en hållbar och trygg miljö för alla våra medlemmar och göra ett positivt avtryck i scoutäventyret!
            </Text>
            <Stack direction={'row'}>
              <Button
                colorScheme="brand"
                size="md"
                bg={'brand.500'}
                rounded={'full'}
                color={'white'}
                _hover={{ bg: 'brand.600' }}
                onClick={onLoginOpen}
              >
                Login
              </Button>
              <Button
                colorScheme="gray"
                bg={'rgba(255, 255, 255, 0.9)'}
                rounded={'full'}
                color={'gray.800'}
                _hover={{ bg: 'rgba(255, 255, 255, 1)', color: 'gray.900' }}
                onClick={onRegisterOpen}
              >
                Registrera
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Login isOpen={isLoginOpen} onClose={onLoginClose} onLoginSuccess={handleLoginSuccess} />
        <Register isOpen={isRegisterOpen} onClose={onRegisterClose} />
      </VStack>
    </Flex>
  );
};

export default Home;
