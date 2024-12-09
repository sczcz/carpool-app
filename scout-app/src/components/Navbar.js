import React, { useEffect, useState, navigate } from 'react';
import { FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import { useMediaQuery } from '@chakra-ui/react';
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
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import Login from './Login';  // Import the Login component
import Register from './Register'; // Import the Register component
import LilyWhiteIcon from '../assets/lily-white.svg'; 
import LilyBlueIcon from '../assets/lily-blue.svg';
import ClockNotifications from './ClockNotifications'; // Importera ClockNotifications
import { useUser } from '../utils/UserContext';

const Navbar = () => {
  const { roles, isInitialized, clearUserData, userId } = useUser(); // Hämta roll och inloggningsstatus
  const { isOpen, onOpen, onClose } = useDisclosure();  // Hook to control the drawer
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure(); // Hook for login modal
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure(); // Hook for register modal
  const [isScrolled, setIsScrolled] = useState(false);  // State to manage scroll status
  const links = [];
  const isMobile = useMediaQuery("(max-width: 767px)");



  const addLink = (to, label) => {
    if (!links.some(link => link.to === to)) {
      links.push({ to, label });
    }
  };
  
  if (isInitialized) {
    if (roles.includes('admin')) {
      addLink('/dashboard-admin', 'Admin');
      addLink('/dashboard-leader', 'Ledare');
      addLink('/dashboard-parent', 'Vårdnadshavare');
      addLink('/profile', 'Profil')

    }
    if (roles.includes('ledare')) {
      addLink('/dashboard-leader', 'Ledare');
      addLink('/dashboard-parent', 'Vårdnadshavare');
      addLink('/profile', 'Profil')

    }
    if (roles.includes('vårdnadshavare')) {
      addLink('/dashboard-parent', 'Aktiviteter');
      addLink('/profile', 'Profil')
    }
  }

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
      maxW="1200px"
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
        display={roles.includes('vårdnadshavare') ? 'flex' : { base: 'flex', md: 'flex', lg: 'none' }}
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

    <Flex
        alignItems="center"
        justifyContent={roles.includes('vårdnadshavare') ? 'center' : { base: 'center', md: 'center', lg: 'flex-start' }}
        width="100%" // Gör så att Flex fyller hela navbarens bredd
      >

        {/* Dynamic Logo */}
        <Image
          display={{ base: 'none', sm: 'flex' }} // Dölj på mobiler
          src={isScrolled ? LilyWhiteIcon : LilyBlueIcon}
          alt="Jonstorps Kustscoutkår Logo"
          boxSize="1.5em"
          ml={2} // Minimal marginal efter loggan
        />

        {/* Title */}
        <Text
          fontSize={{ base: 'xl', sm: '2xl', md: '3xl', lg: '3xl' }}
          fontWeight="extrabold"
          color={isScrolled ? 'white' : 'brand.500'}
          fontFamily="playfairFont"
          as={Link}
          to="/"
          ml={{ base: '7', sm: '2', md: '2' }}
        >
          Jonstorps Kustscoutkår
        </Text>
      </Flex>


    {/* Buttons and Profile Menu */}
    <Flex alignItems="center" justifyContent="space-between">
        {/* Navigation Links */}
      <Flex gap={4} display={roles.includes('vårdnadshavare') ? 'none' : { base: 'none', lg: 'flex' }}>
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

        {/* Klocka och notiser */}
        {userId ? <ClockNotifications isScrolled={isScrolled} /> : null}
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
                cursor="pointer"
                colorScheme="brand"
                onClick={onClose}
                position="relative"
                width="full"
                justifyContent="flex-start" // Ensures left alignment for text and icon
              >
                {/* Logo and Text */}
                <Flex align="center" justify="flex-start" width="100%">
                  <Image
                    src={LilyBlueIcon}
                    alt="Scouterna Logo"
                    boxSize="1.5em"
                    mr="2" // Space between logo and text
                  />
                  Scouterna
                </Flex>
                {/* Right Icon */}
                <Box
                  position="absolute"
                  right="1rem"
                  top="50%"
                  transform="translateY(-50%)"
                >
                  <FaArrowRight />
                </Box>
              </Button>

              {links.map(({ to, label }) => (
                <Button
                  key={to}
                  as={Link}
                  to={to}
                  variant="ghost"
                  colorScheme="brand"
                  onClick={onClose}
                  justifyContent="flex-start" // Ensures left alignment for text
                  width="full"
                  position="relative"
                >
                  {label}
                  {/* Right Icon */}
                  <Box
                    position="absolute"
                    right="1rem"
                    top="50%"
                    transform="translateY(-50%)"
                  >
                    <FaArrowRight />
                  </Box>
                </Button>
              ))}

              {/* Profile Links moved to the Hamburger Menu */}
              {userId ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    justifyContent="flex-start" // Ensures left alignment for text
                    width="full"
                  >
                    <Flex align="center" gap={2}>
                      <FaSignOutAlt />
                      Logga ut
                    </Flex>
                  </Button>
                </>
              ) : null}
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
