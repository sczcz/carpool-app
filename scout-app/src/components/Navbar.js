import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  CloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Login from './Login';  // Import the Login component
import Register from './Register'; // Import the Register component
import { ReactComponent as LilyWhiteIcon } from '../assets/lily-white.svg'; // Adjust the path according to your SVG location

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();  // Hook to control the drawer
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure(); // Hook for login modal
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure(); // Hook for register modal
  const [isScrolled, setIsScrolled] = useState(false);  // State to manage scroll status
  const links = [
    { to: '/dashboard-leader', label: 'Dashboard Ledare' },
    { to: '/dashboard-parent', label: 'Dashboard Vårdnadshavare' },
    { to: '/carpool/', label: 'Carpool' }, // New Carpool link added
  ];

  // Effect to handle scroll events
  useEffect(() => {
    let timer;

    const handleScroll = () => {
      if (window.scrollY > 0) {
        if (!isScrolled) {
          timer = setTimeout(() => {
            setIsScrolled(true);
          }, 200); 
        }
      } else {
        setIsScrolled(false);
        clearTimeout(timer); 
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [isScrolled]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'  // Include cookies in the request
      });
      
      if (response.ok) {
        alert('Logout successful!');
        window.location.reload(); // Reload the page to reflect logout
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box 
      as="nav" 
      bg={isScrolled ? "brand.500" : "white"} // Change bg color based on scroll
      color={isScrolled ? "white" : "brand.500"} // Change text color based on scroll
      p={4} 
      position="sticky"
      top={0} 
      zIndex={1000} 
      transition="background 0.3s, color 0.3s" // Smooth transition
    >
      <Flex alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto" width="100%">
        {/* Hamburger Icon Button for Mobile on the left side */}
        <IconButton
          aria-label="Open Menu"
          icon={<HamburgerIcon />}
          variant="outline"
          colorScheme={isScrolled ? "white" : "brand"} // Change color based on scroll
          onClick={onOpen}
          display={{ base: 'flex', md: 'none' }} 
          boxSize="40px" 
          mr="4"
        />

        <Flex alignItems="center" justifyContent="center" flexGrow={1}> {/* Centering title and buttons */}
          {isScrolled && (
            <>
              <LilyWhiteIcon style={{ width: '30px', height: '30px', marginRight: '8px' }} />
              <Text fontSize="xl" fontWeight="bold" as={Link} to="/" ml="2" marginRight="4">
                Jonstorps Kustscoutkår
              </Text>
            </>
          )}

          {/* Desktop buttons */}
          <Flex gap={4} display={{ base: 'none', md: 'flex' }} justifyContent="center">
            {links.map(({ to, label }) => (
              <Button 
                key={to} 
                as={Link} 
                to={to} 
                variant="solid" // Change variant to solid for a filled button style
                colorScheme={isScrolled ? "white" : "brand"} 
                size="md" // Size of the button
                borderRadius="full" // Full rounded corners
                ml={5}
                _hover={{ bg: isScrolled ? "whiteAlpha.300" : "brand.600", color: "white" }} // Hover effect
                _active={{ bg: "brand.600", transform: 'scale(0.95)' }} // Active effect
              >
                {label}
              </Button>
            ))}
          </Flex>
        </Flex>

        {/* Profile Icon with Dropdown */}
        <Menu>
          <MenuButton as={Button} variant="link" colorScheme="brand">
            <Avatar size="sm" src="https://your-avatar-url.com/avatar.png" />
          </MenuButton>
          <MenuList>
            <MenuItem as={Link} to="/profile" color="brand.500">Profile</MenuItem>
            <MenuItem as={Link} to="/TestSession" color="brand.500">Test Session</MenuItem> 
            <MenuItem as={Link} to="/FetchUsers" color="brand.500">Fetch Users</MenuItem> 
            <MenuItem color="brand.500" onClick={onLoginOpen}>
              Login
            </MenuItem>
            <MenuItem color="brand.500" onClick={onRegisterOpen}>
              Register
            </MenuItem>
            <MenuItem color="brand.500" onClick={handleLogout}>
              Logout
            </MenuItem>          
          </MenuList>
        </Menu>
      </Flex>

      {/* Drawer for mobile menu */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Flex justifyContent="space-between">
              <Text fontSize="xl" fontWeight="bold" color="brand.500">Menu</Text>
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
              <Button 
                as="a" 
                href="https://www.scouterna.se" 
                target="_blank" 
                variant="solid" 
                colorScheme="brand" 
                onClick={onClose}
              >
                Scouterna.se
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Render the Login and Register modal components */}
      <Login isOpen={isLoginOpen} onClose={onLoginClose} />
      <Register isOpen={isRegisterOpen} onClose={onRegisterClose} />
    </Box>
  );
};

export default Navbar;
