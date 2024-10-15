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
import { ReactComponent as LilyWhiteIcon } from '../assets/lily-white.svg'; // Adjust the path according to where your SVG is located

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false); // State to manage scroll status
  const links = [
    { to: '/dashboard-leader', label: 'Dashboard Ledare' },
    { to: '/dashboard-parent', label: 'Dashboard Vårdnadshavare' },
  ];

  // Effect to handle scroll events
  useEffect(() => {
    let timer; // To manage the timer

    const handleScroll = () => {
      if (window.scrollY > 0) {
        // Set a delay before changing the isScrolled state
        if (!isScrolled) {
          timer = setTimeout(() => {
            setIsScrolled(true);
          }, 200); // Delay of 200ms (you can adjust this value)
        }
      } else {
        // Reset the state immediately when scrolling back to top
        setIsScrolled(false);
        clearTimeout(timer); // Clear the timer if user scrolls back up
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer); // Clean up the timer on unmount
    };
  }, [isScrolled]);

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
      <Flex alignItems="center" justifyContent="space-between">
        <LilyWhiteIcon style={{ width: '30px', height: '30px', marginRight: '8px' }} />
        
        {/* Conditional Rendering of Title */}
        {isScrolled && (
          <Text fontSize="xl" fontWeight="bold" mr="auto">
            Jonstorps Kustscoutkår
          </Text>
        )}

        {/* Hamburger Icon Button for Mobile */}
        <IconButton
          aria-label="Open Menu"
          icon={<HamburgerIcon />}
          variant="outline"
          colorScheme={isScrolled ? "white" : "brand"} // Change color based on scroll
          onClick={onOpen}
          display={{ base: 'flex', md: 'none' }} 
        />

        {/* Desktop Buttons - Centered */}
        <Flex 
          gap={4} 
          display={{ base: 'none', md: 'flex' }} 
          justifyContent="center" // Center the buttons
          flexGrow={1} // Allow the button container to grow and center the links
        >
          {links.map(({ to, label }) => (
            <Button 
              key={to} 
              as={Link} 
              to={to} 
              variant="outline" 
              colorScheme={isScrolled ? "white" : "brand"}
            >
              {label}
            </Button>
          ))}
        </Flex>

        {/* Profile Icon with Dropdown */}
        <Menu>
          <MenuButton as={Button} variant="link" colorScheme={isScrolled ? "white" : "brand"}>
            <Avatar size="sm" src="https://your-avatar-url.com/avatar.png" /> {/* Change to your avatar URL */}
          </MenuButton>
          <MenuList>
            <MenuItem as={Link} to="/profile">Profile</MenuItem>
            <MenuItem as={Link} to="/logout">Logout</MenuItem>
            <MenuItem as={Link} to="/TestSession">Test Session</MenuItem>
            <MenuItem as={Link} to="/FetchUsers">Fetch Users</MenuItem>
            <MenuItem as={Link} to="/login">Login</MenuItem>
            <MenuItem as={Link} to="/register">Register</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Drawer for mobile menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
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
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;

