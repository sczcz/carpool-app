import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

const Logout = () => {

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'  // Include cookies in the request
      });
      
      if (response.ok) {
        // Clear any client-side state related to the logged-in user
        alert('Logout successful!');
        // Optionally, redirect to login page
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg">
      <Text fontSize="2xl" mb={4}>Logga ut</Text>
      <Button onClick={handleLogout} colorScheme="teal">Logga ut</Button>
    </Box>
  );
};

export default Logout;
