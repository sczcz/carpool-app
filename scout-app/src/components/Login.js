import React, { useState } from 'react';
import { Button, FormControl, FormLabel, Input, Box, Text } from '@chakra-ui/react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                alert(`Inloggad! Token: ${data.access_token}`);
                localStorage.setItem('jwt_token', data.access_token);
                setEmail('');
                setPassword('');
                setError('');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <Box width="300px" margin="auto" marginTop="100px" bg="brand.300" p={4} borderRadius="lg" boxShadow="md">
            <form onSubmit={handleLogin}>
                <Text fontSize="2xl" marginBottom="4" color="brand.500">Logga in</Text>
                <FormControl id="email" isRequired>
                    <FormLabel>E-post:</FormLabel>
                    <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        bg="white"
                    />
                </FormControl>
                <FormControl id="password" isRequired marginTop="4">
                    <FormLabel>Lösenord:</FormLabel>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        bg="white"
                    />
                </FormControl>
                <Button colorScheme="brand" width="full" marginTop="4" type="submit">Logga in</Button>
                {error && <Text color="red.500" marginTop="4">{error}</Text>}
            </form>
        </Box>
    );
};

export default Login;
