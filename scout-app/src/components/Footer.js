'use client'

import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  Image,
  Link,
} from '@chakra-ui/react'
import LilyBlueIcon from '../assets/lily-blue.svg'; // Import your new SVG

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      textAlign="center" // Center text alignment
    >
      <Container as={Stack} maxW="6xl" py={4} spacing={4}>
        <Stack direction="row" alignItems="center" justifyContent="center">
          {/* Use the new SVG icon */}
          <Image 
            src={LilyBlueIcon} // Use your imported SVG
            alt="Company Logo" // Update alt text as necessary
            ml={2} // Adds left margin between text and icon
            boxSize="1.5em" // Adjust the size of the icon as needed
          />
          {/* Jonstorp kustscoutkår text with responsive display */}
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            ml={2} 
            display={{ base: 'none', md: 'block' }} // Hide on mobile
          >
            Jonstorp kustscoutkår
          </Text>
        </Stack>
        
        {/* Navigation Links */}
        <Stack direction="row" spacing={8} justifyContent="center">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </Stack>

        <Text>© {new Date().getFullYear()} Your Company. All rights reserved.</Text>
      </Container>
    </Box>
  )
}
