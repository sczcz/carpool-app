import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Text, Alert } from '@chakra-ui/react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();

        fetch('http://127.0.0.1:5000/api/register', {
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
                alert(data.message);
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
        <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg" bg="brand.300" boxShadow="md">
            <Text fontSize="2xl" mb={4} color="brand.500">Registrera användare</Text>
            <form onSubmit={handleRegister}>
                <FormControl mb={4}>
                    <FormLabel>E-post:</FormLabel>
                    <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        bg="white"
                    />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Lösenord:</FormLabel>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        bg="white"
                    />
                </FormControl>
                <Button type="submit" colorScheme="brand" width="full">Registrera</Button>
            </form>
            {error && <Alert status="error" mt={4}>{error}</Alert>}
        </Box>
    );
};

export default Register;
