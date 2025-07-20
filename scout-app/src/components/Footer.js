import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  Image,
  Link,
} from '@chakra-ui/react';
import LilyBlueIcon from '../assets/lily-blue.svg';
export default function Footer() {
  return (
    <Box
      as="footer" 
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      textAlign="center"
      mt="auto"
      py={4}
    >
      <Container as={Stack} maxW="6xl" spacing={4}>
        <Stack 
          direction={{ base: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="center"
        >
          <Image 
            src={LilyBlueIcon} 
            alt="Company Logo"
            boxSize="1.5em"
          />
          <Text 
            fontSize={{ base: 'md', md: 'lg' }}
            fontWeight="bold" 
            ml={{ base: 0, md: 2 }}
            display={{ base: 'block', md: 'block' }}
          >
            Jonstorps Kustscoutkår
          </Text>
        </Stack>
        
        <Stack 
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justifyContent="center"
        >
          <Link href="/" fontSize={{ base: 'sm', md: 'md' }}>Hem</Link>
          <Link href="https://jonstorp.scout.se/" isExternal fontSize={{ base: 'sm', md: 'md' }}>
            Jonstorps Kustscoutkår
          </Link>
          <Link href="https://www.scouterna.se/" isExternal fontSize={{ base: 'sm', md: 'md' }}>
            Scouterna
          </Link>
          <Link href="/information" fontSize={{ base: 'sm', md: 'md' }}>Integritetspolicy</Link>
        </Stack>
      </Container>
    </Box>
  );
}