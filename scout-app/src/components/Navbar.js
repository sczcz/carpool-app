import React, { useEffect, useState, navigate } from 'react';
import { Link } from 'react-router-dom';
import {
  Image,
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
  Spacer,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Login from './Login';  // Import the Login component
import Register from './Register'; // Import the Register component
import LilyWhiteIcon from '../assets/lily-white.svg'; 
import LilyBlueIcon from '../assets/lily-blue.svg';
import ClockNotifications from './ClockNotifications'; // Importera ClockNotifications
import { useUser } from '../utils/UserContext';

const Navbar = () => {
  const { userId, loading } = useUser();
  const { clearUserData } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();  // Hook to control the drawer
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure(); // Hook for login modal
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure(); // Hook for register modal
  const [isScrolled, setIsScrolled] = useState(false);  // State to manage scroll status
  const links = [
    { to: '/dashboard-leader', label: 'Ledare' },
    { to: '/dashboard-parent', label: 'Vårdnadshavare' },
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
        clearUserData(); 
        navigate('/');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Box 
      as="nav" 
      bg={isScrolled ? 'brand.500' : 'white'}
      color={isScrolled ? 'white' : 'brand.500'}
      p={4} 
      position="sticky"
      top={0} 
      zIndex={1000} 
      boxShadow={isScrolled ? 'sm' : 'none'}
      transition="background 0.3s, color 0.3s"
    >
    <Flex
      alignItems="center"
      justifyContent={{ base: 'center', md: 'center', lg: 'space-between' }}
      maxW="980px"
      mx="auto"
      width="100%"
    >
      {/* Hamburger Icon for Mobile and Tablet */}
      <IconButton
        aria-label="Open Menu"
        icon={<HamburgerIcon />}
        variant="ghost"
        color={isScrolled ? 'white' : 'brand.500'}
        onClick={onOpen}
        boxSize="40px"
        fontSize="28px"
        display={{ base: 'flex', md: 'flex', lg: 'none' }}
        _hover={{
          backgroundColor: isScrolled ? 'whiteAlpha.300' : 'blackAlpha.200',
          color: isScrolled ? 'white' : 'brand.700',
        }}
        _active={{
          backgroundColor: isScrolled ? 'whiteAlpha.400' : 'blackAlpha.300',
          transform: 'scale(0.95)',
        }}
        borderRadius="md"
      />

    <Flex alignItems="center" flexGrow={1} justifyContent={{ base: 'center', md: 'center', lg: 'flex-start' }}>
      {/* Scouterna Link */}
      <Flex
        gap={4} // Consistent spacing between Scouterna and other elements
        display={{  base: 'none', lg: 'flex' }} // Hidden on mobile and tablet
      >
      <a
        href="https://www.scouterna.se"
        target="_blank"
        rel="noopener noreferrer"
        color={isScrolled ? 'white' : 'brand.500'}
        style={{
          fontWeight: 'bold',
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          textDecoration: 'none', // Add to ensure no default underline unless desired
        }}
      >
        Scouterna
      </a>

      </Flex>

      {/* Dynamic Logo */}
      <Image
        src={isScrolled ? LilyWhiteIcon : LilyBlueIcon}
        alt="Jonstorps Kustscoutkår Logo"
        boxSize="1.5em"
        ml={2} // Minimal margin after the logo
      />

      {/* Title */}
      <Text
        fontSize={{ base: 'xl', sm: '2xl', md: '3xl', lg: '3xl', }}
        fontWeight="extrabold"
        color={isScrolled ? 'white' : 'brand.500'}
        fontFamily="playfairFont" 
        as={Link}
        to="/"
        ml="2"
      >
        Jonstorps Kustscoutkår
      </Text>
    </Flex>

      {/* Buttons and Profile Menu */}
      <Flex alignItems="center" justifyContent="space-between">
        {/* Navigation Links */}
        <Flex gap={4} display={{ base: 'none', lg: 'flex' }}>
        {links.map(({ to, label }) => (
          <Button
            key={to}
            as={Link}
            to={to}
            variant="ghost"
            color={isScrolled ? 'white' : 'brand.500'}
            fontWeight="medium"
            
            _hover={{
              textDecoration: 'underline',
              color: isScrolled ? 'whiteAlpha.700' : 'brand.700',
            }}
            _active={{
              color: 'brand.700',
            }}
          >
            {label}
          </Button>
        ))}
      </Flex>

        {/* Klocka och notiser*/}
      
      <ClockNotifications isScrolled={isScrolled} />
          

        {/* Profilmeny */}
        <Menu>
          <MenuButton as={Button} variant="link" colorScheme="brand">
            <Avatar size="sm" src="https://your-avatar-url.com/avatar.png" />
          </MenuButton>
          <MenuList>
            <MenuItem as={Link} to="/profile" color="brand.500">Profil</MenuItem>
            <MenuItem as={Link} to="/TestSession" color="brand.500">Test Session</MenuItem> 
            <MenuItem as={Link} to="/FetchUsers" color="brand.500">Fetch Users</MenuItem> 
            <MenuItem color="brand.500" onClick={onLoginOpen}>
              Logga in
            </MenuItem>
            <MenuItem color="brand.500" onClick={onRegisterOpen}>
              Registrera
            </MenuItem>
            <MenuItem color="brand.500" onClick={handleLogout}>
              Logga ut
            </MenuItem>          
          </MenuList>
        </Menu>
      </Flex>
    </Flex>



      {/* Drawer for Mobile and Tablet */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Flex justifyContent="space-between">
              <CloseButton onClick={onClose} />
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap={4}>
              {/* Add Scouterna Link to Mobile Drawer */}
              <Button
                as="a"
                href="https://www.scouterna.se"
                target="_blank"
                variant="ghost"
                colorScheme="brand"
                onClick={onClose}
              >
                <Image
                  src= {LilyBlueIcon}
                  alt="Scouterna Logo"
                  boxSize="1.5em"
                  mr="2"
                />
                Scouterna
              </Button>

              {links.map(({ to, label }) => (
                <Button
                  key={to}
                  as={Link}
                  to={to}
                  variant="ghost"
                  colorScheme="brand"
                  onClick={onClose}
                >
                  {label}
                </Button>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Login isOpen={isLoginOpen} onClose={onLoginClose} />
      <Register isOpen={isRegisterOpen} onClose={onRegisterClose} />
    </Box>
  );
};

export default Navbar;

