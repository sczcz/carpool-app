import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stack, Flex, Button, Text, VStack, Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import Login from './Login';
import Register from './Register';
import { fetchNotifications } from '../utils/notifications';
import { io } from 'socket.io-client';

// Initiera Socket.IO-klienten
const socket = io();

const Home = () => {
  const navigate = useNavigate();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();

  

  const handleLoginSuccess = async () => {
    try {
      // Hämta användarrollen och användar-ID
      const userResponse = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userId = userData.user.user_id; // Hämta användarens ID
        const userRole = userData.user.role;
  
        // Hämta notifikationer
        const { notifications, unreadCount } = await fetchNotifications();
  
        // Kontrollera notifikationer i konsolen
        console.log('Fetched Notifications:', notifications);
        console.log('Unread Notifications Count:', unreadCount);
  
        // Navigera baserat på användarroll
        if (userRole === 'vårdnadshavare') {
          navigate('/dashboard-parent');
        } else if (userRole === 'ledare') {
          navigate('/dashboard-leader');
        }
      } else {
        console.error('Misslyckades med att hämta användarroll efter inloggning');
      }
    } catch (error) {
      console.error('Fel vid hämtning av användarroll och notiser efter inloggning:', error);
    }
  };
  

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/protected/user', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const userRole = data.user.role;

          if (userRole === 'vårdnadshavare') {
            navigate('/dashboard-parent');
          } else if (userRole === 'ledare') {
            navigate('/dashboard-leader');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    checkUserRole();
  }, [navigate]);

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
