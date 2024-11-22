import React, { useState } from 'react';
import { useUser } from '../utils/UserContext'; // Importera UserContext
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

const apiURL = '/api/login';

const Login = ({ isOpen, onClose }) => {
  const { fetchUserData } = useUser(); // Hämta fetchUserData från UserContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginResponse = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        setError(errorData.error || 'Fel vid inloggning.');
        return;
      }

      await fetchUserData(); // Uppdatera användardata via UserContext
      setEmail('');
      setPassword('');
      setError('');
      onClose(); // Stäng modal vid framgång
      window.location.reload();
    } catch (err) {
      console.error('Fel vid inloggning:', err);
      setError('Ett oväntat fel inträffade, försök igen.');
    }
  };

  const modalSize = useBreakpointValue({ base: 'full', sm: 'md' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Logga in</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box width="full">
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
                {error && <Text color="red.500">{error}</Text>}
              </VStack>
            </form>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Login;