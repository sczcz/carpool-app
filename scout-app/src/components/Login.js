import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Box, Text } from '@chakra-ui/react'; // Importera Chakra UI komponenter

const apiURL = "/api/login";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Detta säkerställer att cookies skickas med i begäran
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                alert('Inloggad! Cookie är satt.');
                setEmail('');
                setPassword('');
                setError('');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setError('Något gick fel, försök igen.');
        });
    };

    return (
        <Box width="300px" margin="auto" marginTop="100px">
            <form onSubmit={handleLogin}>
                <Text fontSize="2xl" marginBottom="4">Logga in</Text>
                <FormControl id="email" isRequired>
                    <FormLabel>E-post:</FormLabel>
                    <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </FormControl>
                <FormControl id="password" isRequired marginTop="4">
                    <FormLabel>Lösenord:</FormLabel>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </FormControl>
                <Button colorScheme="teal" width="full" marginTop="4" type="submit">Logga in</Button>
                {error && <Text color="red.500" marginTop="4">{error}</Text>}
            </form>
        </Box>
    );
};

export default Login;
