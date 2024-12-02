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
import LilyBlueIcon from '../assets/lily-blue.svg'; // Import your new SVG

export default function Footer() {
  return (
    <Box
      as="footer" // Semantically mark it as a footer
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      textAlign="center"
      mt="auto" // Ensure it respects flex-grow layout
      py={4}
    >
      <Container as={Stack} maxW="6xl" spacing={4}>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Image 
            src={LilyBlueIcon} 
            alt="Company Logo"
            boxSize="1.5em"
          />
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            ml={2} 
            display={{ base: 'none', md: 'block' }}
          >
            Jonstorp kustscoutkår
          </Text>
        </Stack>
        
        <Stack direction="row" spacing={8} justifyContent="center">
          <Link href="/">Hem</Link>
          <Link href="https://jonstorp.scout.se/" isExternal>Jonstorps Kustscoutkår</Link> {/* Updated link */}
          <Link href="https://www.scouterna.se/" isExternal>Scouterna</Link> {/* Updated link */}
          <Link href="/information">Integritetspolicy</Link> {/* Link to GDPR page */}
        </Stack>
      </Container>
    </Box>
  );
}
