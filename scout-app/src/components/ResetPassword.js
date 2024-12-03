import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Lösenorden matchar inte.');
      return;
    }

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Ett fel uppstod.');
        return;
      }

      setMessage('Lösenordet har återställts! Omdirigerar till startsidan...');
      setTimeout(() => navigate('/'), 3000); // Omdirigera till startsidan efter 3 sekunder
    } catch (err) {
      setMessage('Ett oväntat fel inträffade, försök igen.');
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt="10">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg">Återställ lösenord</Text>
        <FormControl id="new-password" isRequired>
          <FormLabel>Nytt lösenord:</FormLabel>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            bg="white"
          />
        </FormControl>
        <FormControl id="confirm-password" isRequired>
          <FormLabel>Bekräfta lösenord:</FormLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            bg="white"
          />
        </FormControl>
        <Button colorScheme="brand" onClick={handleSubmit}>
          Återställ lösenord
        </Button>
        {message && <Text color="red.500">{message}</Text>}
      </VStack>
    </Box>
  );
};

export default ResetPassword;
