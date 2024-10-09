import React from 'react';
import { Box, Button, Text, Alert } from '@chakra-ui/react';

const TestSession = () => {
    const handleTestSession = () => {
        const token = localStorage.getItem('jwt_token');

        if (!token) {
            alert('Ingen token hittades! Logga in först.');
            return;
        }

        fetch('http://127.0.0.1:5000/api/protected', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Åtkomst nekad! Felaktig token eller utgången.');
            }
            return response.json();
        })
        .then(data => {
            alert('Skyddade data: ' + JSON.stringify(data));
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fel vid begäran: ' + error.message);
        });
    };

    return (
        <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg">
            <Text fontSize="2xl" mb={4}>Testa din session</Text>
            <Button onClick={handleTestSession} colorScheme="teal">Testa session</Button>
        </Box>
    );
};

export default TestSession;
