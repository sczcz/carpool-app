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
  useToast,
} from '@chakra-ui/react';

const apiURL = '/api/login';

const Login = ({ isOpen, onClose }) => {
  const { fetchUserData } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false); 
  const [resetEmail, setResetEmail] = useState(''); 
  const toast = useToast();

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

  const handlePasswordReset = async () => {
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const resetResponse = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: resetEmail }),
          });
  
          if (!resetResponse.ok) {
            const errorData = await resetResponse.json();
            reject(errorData.error || 'Fel vid återställning av lösenord.');
            return;
          }
  
          resolve('Ett mail med återställningsinstruktioner har skickats!');
          setForgotPassword(false); // Återställ till login-läge
        } catch (err) {
          reject('Ett oväntat fel inträffade, försök igen.');
        }
      }),
      {
        success: {
          title: "Lyckades",
          description: "Ett mail med återställningsinstruktioner har skickats!",
        },
        error: {
          title: "Återställning misslyckades",
          description: "Något gick fel",
        },
        loading: { title: "Bearbetar begäran...", description: "Var god vänta" },
      }
    );
  };
  

  const modalSize = useBreakpointValue({ base: 'full', sm: 'md' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{forgotPassword ? 'Glömt Lösenord' : 'Logga in'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box width="full">
            {!forgotPassword ? (
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
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                    mt={4}
                  >
                    <Text
                      as="span"
                      color="blue.500"
                      cursor="pointer"
                      onClick={() => setForgotPassword(true)}
                    >
                      Glömt lösenord? Klicka här
                    </Text>
                  </Box>
                </VStack>
              </form>
            ) : (
              <VStack spacing={4} align="stretch">
                <FormControl id="resetEmail" isRequired>
                  <FormLabel>E-post för återställning:</FormLabel>
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    bg="white"
                  />
                </FormControl>
                <Button colorScheme="brand" width="full" onClick={handlePasswordReset}>
                  Skicka återställningslänk
                </Button>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                  mt={4}
                >
                  <Text
                    as="span"
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => setForgotPassword(false)}
                  >
                    Tillbaka till inloggning
                  </Text>
                </Box>
              </VStack>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Login;