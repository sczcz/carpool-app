import React, { useEffect, useState, navigate } from 'react';
import { FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import { Menu, MenuButton, MenuList, MenuItem, Avatar, useMediaQuery } from '@chakra-ui/react';
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
import Login from './Login';
import Register from './Register';
import LilyWhiteIcon from '../assets/lily-white.svg'; 
import LilyBlueIcon from '../assets/lily-blue.svg';
import ClockNotifications from './ClockNotifications';
import { useUser } from '../utils/UserContext';

const Navbar = () => {
  const { roles, isInitialized, clearUserData, userId } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
  const [isScrolled, setIsScrolled] = useState(false);
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

    }
    if (roles.includes('ledare')) {
      addLink('/dashboard-leader', 'Ledare');
      addLink('/dashboard-parent', 'Vårdnadshavare');

    }
    if (roles.includes('vårdnadshavare')) {
      addLink('/dashboard-parent', 'Aktiviteter');
    }
  }

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
        credentials: 'include'
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
      {/* This is the hamburger icon */}
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
        justifyContent={
          !userId
            ? 'center'
            : roles.includes('vårdnadshavare')
            ? 'center'
            : { base: 'center', md: 'center', lg: 'flex-start' }
        }
        width="100%"
      >

        <Image
          display={{ base: 'none', sm: 'flex' }}
          src={isScrolled ? LilyWhiteIcon : LilyBlueIcon}
          alt="Jonstorps Kustscoutkår Logo"
          boxSize="1.5em"
          ml={2}
        />

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


    {/* These are the buttons and profile menu */}
    <Flex alignItems="center" justifyContent="space-between">
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

        {userId ? <ClockNotifications isScrolled={isScrolled} /> : null}

         {userId ? (
          <Menu>
            <MenuButton as={Button} variant="link" colorScheme="brand">
              <Avatar size="sm" src="https://your-avatar-url.com/avatar.png" />
            </MenuButton>
            <MenuList>
              <MenuItem as={Link} to="/profile" color="brand.500">Profil</MenuItem>
              <MenuItem color="brand.500" onClick={handleLogout}>
                Logga ut
              </MenuItem>          
            </MenuList>
          </Menu>
        ) : null}
      </Flex>
    </Flex>

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
                justifyContent="flex-start"
              >
                <Flex align="center" justify="flex-start" width="100%">
                  <Image
                    src={LilyBlueIcon}
                    alt="Scouterna Logo"
                    boxSize="1.5em"
                    mr="2"
                  />
                  Scouterna
                </Flex>
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
                  justifyContent="flex-start"
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

              {userId ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    justifyContent="flex-start"
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
