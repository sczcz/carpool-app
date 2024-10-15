import React, { useState } from 'react';
import { Button, Text, Flex, Alert } from '@chakra-ui/react';

const apiURL = "/api/protected";

const TestSession = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);  // State för att hålla reda på om användaren är inloggad
    const [error, setError] = useState('');

    const handleTestSession = () => {
        fetch(apiURL, {
            method: 'GET',
            credentials: 'include',  // Detta skickar med cookies i begäran
            headers: {
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
            setIsLoggedIn(true);  // Om tokenen är giltig, är användaren inloggad
            setError('');
            alert('Skyddade data: ' + JSON.stringify(data));
        })
        .catch(error => {
            setIsLoggedIn(false);  // Om det är ett fel, betyder det att användaren inte är inloggad eller att tokenen har gått ut
            setError('Fel vid begäran: ' + error.message);
        });
    };

    return (
        <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            mt={8} 
            textAlign="center"
        >
            <Text fontSize="2xl" mb={4} color="brand.500">
                Testa din session
            </Text>
            <Button onClick={handleTestSession} colorScheme="brand">
                Testa session
            </Button>

            {isLoggedIn === true && (
                <Alert status="success" mt={4}>
                    Du är inloggad!
                </Alert>
            )}
            {isLoggedIn === false && (
                <Alert status="error" mt={4}>
                    {error || 'Du är inte inloggad!'}
                </Alert>
            )}
        </Flex>
    );
};

export default TestSession;
