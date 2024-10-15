import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Text, Alert, RadioGroup, Radio, Stack } from '@chakra-ui/react';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Vårdnadshavare');
    const [error, setError] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();

        
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email, password, role }) // Skicka alla fält
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                alert(data.message);
                // Töm fälten efter lyckad registrering
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setRole('Vårdnadshavare');
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
                {/* Förnamn */}
                <FormControl mb={4}>
                    <FormLabel>Förnamn:</FormLabel>
                    <Input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        required 
                        bg="white"
                    />
                </FormControl>
                
                {/* Efternamn */}
                <FormControl mb={4}>
                    <FormLabel>Efternamn:</FormLabel>
                    <Input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        required 
                        bg="white"
                    />
                </FormControl>

                {/* E-post */}
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

                {/* Lösenord */}
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

                {/* Roll (Vårdnadshavare/Ledare) */}
                <FormControl mb={4}>
                    <FormLabel>Roll:</FormLabel>
                    <RadioGroup onChange={setRole} value={role} colorScheme="brand">
                        <Stack direction="row">
                            <Radio value="Vårdnadshavare">Vårdnadshavare</Radio>
                            <Radio value="Ledare">Ledare</Radio>
                        </Stack>
                    </RadioGroup>
                </FormControl>

                <Button type="submit" colorScheme="brand" width="full">Registrera</Button>
            </form>
            {error && <Alert status="error" mt={4}>{error}</Alert>}
        </Box>
    );
};

export default Register;
