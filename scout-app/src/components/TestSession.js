import React, { useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';

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
        <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg">
            <Text fontSize="2xl" mb={4}>Testa din session</Text>
            <Button onClick={handleTestSession} colorScheme="teal">Testa session</Button>

            {isLoggedIn === true && <Text color="green.500" mt={4}>Du är inloggad!</Text>}
            {isLoggedIn === false && <Text color="red.500" mt={4}>{error || 'Du är inte inloggad!'}</Text>}
        </Box>
    );
};

export default TestSession;
