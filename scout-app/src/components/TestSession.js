import React from 'react';
import { Button, Text, Flex } from '@chakra-ui/react';

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
        <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            mt={8} 
            textAlign="center" // Centrera texten
        >
            <Text fontSize="2xl" mb={4} color="brand.500">
                Testa din session
            </Text>
            <Button onClick={handleTestSession} colorScheme="brand">
                Testa session
            </Button>
        </Flex>
    );
};

export default TestSession;
