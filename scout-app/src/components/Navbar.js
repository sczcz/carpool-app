import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Spacer,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  CloseButton,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box as="nav" bg="brand.500" color="white" p={4}>
      <Flex alignItems="center">
        <Text fontSize="xl" fontWeight="bold" color="white">
          <Link to="/">Start</Link>
        </Text>
        <Spacer />
        
        {/* Hamburger Icon Button for Mobile */}
        <IconButton
          aria-label="Open Menu"
          icon={<HamburgerIcon />}
          variant="outline"
          colorScheme="whiteAlpha"
          onClick={onOpen}
          display={{ base: 'flex', md: 'none' }} // Show on mobile only
        />

        {/* Desktop Buttons */}
        <Flex gap={4} display={{ base: 'none', md: 'flex' }}>
          <Button as={Link} to="/login" variant="outline" colorScheme="whiteAlpha">Logga in</Button>
          <Button as={Link} to="/register" variant="outline" colorScheme="whiteAlpha">Registrera</Button>
          <Button as={Link} to="/FetchUsers" variant="outline" colorScheme="whiteAlpha">Fetch Users</Button>
          <Button as={Link} to="/TestSession" variant="outline" colorScheme="whiteAlpha">Test Session</Button>
          <Button as={Link} to="/logout" variant="outline" colorScheme="whiteAlpha">Logga ut</Button>
        </Flex>
      </Flex>

      {/* Drawer for mobile menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Flex justifyContent="space-between">
              <Text fontSize="xl" fontWeight="bold">Meny</Text>
              <CloseButton onClick={onClose} />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              <Button as={Link} to="/login" variant="outline" colorScheme="brand" onClick={onClose}>Logga in</Button>
              <Button as={Link} to="/register" variant="outline" colorScheme="brand" onClick={onClose}>Registrera</Button>
              <Button as={Link} to="/FetchUsers" variant="outline" colorScheme="brand" onClick={onClose}>Fetch Users</Button>
              <Button as={Link} to="/TestSession" variant="outline" colorScheme="brand" onClick={onClose}>Test Session</Button>
              <Button as={Link} to="/logout" variant="outline" colorScheme="brand" onClick={onClose}>Logga ut</Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
