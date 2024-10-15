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
  const links = [
    { to: '/dashboard-leader', label: 'Dashboard Ledare' },
    { to: '/dashboard-parent', label: 'Dashboard Vårdnadshavare' },
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/FetchUsers', label: 'Fetch Users' },
    { to: '/TestSession', label: 'Test Session' },
    { to: '/logout', label: 'Logout' },
  ];

  return (
    <Box as="nav" bg="brand.500" color="white" p={4}>
      <Flex alignItems="center">
        <Text fontSize="xl" fontWeight="bold" color="white">
          <Link to="/">Hem</Link>
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
          {links.map(({ to, label }) => (
            <Button key={to} as={Link} to={to} variant="outline" colorScheme="whiteAlpha">
              {label}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Drawer for mobile menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Flex justifyContent="space-between">
              <Text fontSize="xl" fontWeight="bold">Menu</Text>
              <CloseButton onClick={onClose} />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              {links.map(({ to, label }) => (
                <Button key={to} as={Link} to={to} variant="outline" colorScheme="brand" onClick={onClose}>
                  {label}
                </Button>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
