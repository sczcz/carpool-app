import React from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        alert('Du har loggats ut!');
    };

    return (
        <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg">
            <Text fontSize="2xl" mb={4}>Logga ut</Text>
            <Button onClick={handleLogout} colorScheme="teal">Logga ut</Button>
        </Box>
    );
};

export default Logout;
