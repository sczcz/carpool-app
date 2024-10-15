import React from 'react';
import { Stack, Flex, Button, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Home = () => {
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
        <Stack maxW={'2xl'} align={'flex-start'} spacing={6}>
          <Text
            color={'white'}
            fontWeight={700}
            lineHeight={1.2}
            fontSize={useBreakpointValue({ base: '3xl', md: '4xl' })}
          >
            Välkommen till Jonstorps Kustscoutkår!
          </Text>
          <Text
            fontSize={useBreakpointValue({ base: 'md', md: 'lg' })}
            color="white"
            maxW="600px"
            mx="auto"
          >
            Vi erbjuder en innovativ plattform som förenklar samordningen av transporter genom att främja samåkning mellan föräldrar och scouter. Tjänsten gör det enkelt att hitta och erbjuda platser i bilar, vilket minskar onödig körning och klimatpåverkan. Genom att använda vår tjänst kan föräldrar planera resor, scoutledare organisera aktiviteter och scouter få relevant information. Tillsammans kan vi skapa en hållbar och trygg miljö för alla våra medlemmar och göra ett positivt avtryck i scoutäventyret!
          </Text>
          <Stack direction={'row'}>
            <Button
              as={Link} // Change this to use Link for navigation
              to="/login" // Link to the login page
              colorScheme="brand"
              size="md"
              bg={'blue.400'}
              rounded={'full'}
              color={'white'}
              _hover={{ bg: 'blue.500' }}
            >
              Login
            </Button>
            <Button
              as={Link} // Change this to use Link for navigation
              to="/register" // Link to the register page
              bg={'whiteAlpha.300'}
              rounded={'full'}
              color={'white'}
              _hover={{ bg: 'whiteAlpha.500' }}
            >
              Register
            </Button>
          </Stack>
        </Stack>
      </VStack>
    </Flex>
  );
};

export default Home;
