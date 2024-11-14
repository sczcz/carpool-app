import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  Box,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { io } from 'socket.io-client';

const apiURL = '/api/login';
const socket = io();

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Skicka loginförfrågan
      const loginResponse = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Skickar cookies
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        setError(errorData.error || 'Fel vid inloggning.');
        return;
      }

      // Hämta användardata efter lyckad inloggning
      const userResponse = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        setError('Misslyckades med att hämta användarinformation.');
        return;
      }

      const userData = await userResponse.json();
      const userRole = userData.user.role;
      const userId = userData.user.id;

      // Kör onLoginSuccess om den finns
      if (onLoginSuccess) {
        onLoginSuccess(userRole);
      }

      socket.emit('join_user_carpool_rooms', { user_id: userId });

      // Rensa formulär och felmeddelanden
      setEmail('');
      setPassword('');
      setError('');
      onClose(); // Stäng modal
    } catch (err) {
      console.error('Fel vid inloggning:', err);
      setError('Ett oväntat fel inträffade, försök igen.');
    }
  };

  const modalSize = useBreakpointValue({ base: 'full', sm: 'md' }); // Anpassa modalens storlek
  const paddingX = useBreakpointValue({ base: '4', md: '8' }); // Justera padding

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Logga in</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box width="full" px={paddingX}>
            <form onSubmit={handleLogin}>
              <VStack spacing={4} align="stretch">
                <FormControl id="email" isRequired>
                  <FormLabel>E-post:</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="white"
                  />
                </FormControl>
                <FormControl id="password" isRequired>
                  <FormLabel>Lösenord:</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="white"
                  />
                </FormControl>
                <Button type="submit" colorScheme="brand" width="full">
                  Logga in
                </Button>
                {error && <Text color="red.500">{error}</Text>} {/* Visa felmeddelanden */}
              </VStack>
            </form>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Login;
