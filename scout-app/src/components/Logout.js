import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        alert('Du har loggats ut!');
    };

    return (
        <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" bg="brand.300" boxShadow="md">
            <Text fontSize="2xl" mb={4} color="brand.500">Logga ut</Text>
            <Button onClick={handleLogout} colorScheme="brand">Logga ut</Button>
        </Box>
    );
};

export default Logout;
