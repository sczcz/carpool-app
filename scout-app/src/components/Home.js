import React from 'react';
import { Stack, Flex, Button, Text, VStack, Box, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import Login from './Login'; // Import the Login modal component
import Register from './Register'; // Import the Register modal component

const Home = () => {
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure(); // Hook to control the login modal
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure(); // Hook to control the register modal

  return (
    <Flex
      w={'full'}
      h={'100vh'}
      backgroundImage={
        'url(https://web.cdn.scouterna.net/uploads/sites/507/2018/02/scouter_gar_pa_skogsstig_pa_jamboree17.jpg)'
      }
      backgroundSize={'cover'}
      backgroundPosition={'center center'}>
      
      <VStack
        w={'full'}
        justify={'center'}
        px={useBreakpointValue({ base: 4, md: 8 })}
        bgGradient={'linear(to-r, blackAlpha.600, transparent)'}
      >
        {/* White Box with Transparency */}
        <Box 
          bg="rgba(255, 255, 255, 0.8)"  // White with 80% opacity
          p={8}                           // Padding inside the box
          borderRadius="md"               // Rounded corners
          boxShadow="lg"                  // Optional shadow for better effect
        >
          <Stack maxW={'2xl'} align={'flex-start'} spacing={6}>
            <Text
              color={'brand.500'} // Darker text for readability on white background
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
              {/* Updated Login Button to open the modal */}
              <Button
                colorScheme="brand"  // Use the brand color to match the navbar
                size="md"
                bg={'brand.500'} // Match navbar button color
                rounded={'full'}
                color={'white'}
                _hover={{ bg: 'brand.600' }} // Darker shade on hover
                onClick={onLoginOpen} // Opens the login modal
              >
                Login
              </Button>
              {/* Updated Register Button to open the modal instead of linking */}
              <Button
                colorScheme="gray" // Match to a neutral color
                bg={'rgba(255, 255, 255, 0.9)'} // More visible white background
                rounded={'full'}
                color={'gray.800'} // Darker text for contrast
                _hover={{ bg: 'rgba(255, 255, 255, 1)', color: 'gray.900' }} // Bolder on hover
                onClick={onRegisterOpen} // Opens the register modal
              >
                Registrera
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Render the Login and Register modal components */}
        <Login isOpen={isLoginOpen} onClose={onLoginClose} />
        <Register isOpen={isRegisterOpen} onClose={onRegisterClose} />

      </VStack>
    </Flex>
  );
};

export default Home;
