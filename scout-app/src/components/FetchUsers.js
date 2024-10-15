import React, { useState } from 'react';
import { Button, Text, List, ListItem, Flex, VStack, Alert } from '@chakra-ui/react';

const apiURL = "/api/users";

const FetchUsers = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    const handleFetchUsers = () => {
        fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fel vid hämtning av användare');
                }
                return response.json();
            })
            .then(data => {
                setUsers(data);
                setError('');
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Kunde inte hämta användare.');
            });
    };

    return (
        <Flex direction="column" align="center" mt={8}>
            <Text fontSize="2xl" mb={4} color="brand.500">Hämta alla användare</Text>
            <Button onClick={handleFetchUsers} colorScheme="brand" mb={4}>
                Hämta användare
            </Button>

            {error && (
                <Alert status="error" mt={4} mb={4}>
                    {error}
                </Alert>
            )}

            <List spacing={3}>
                <VStack spacing={3}>
                    {users.map(user => (
                        <ListItem key={user.id} color="brand.400">
                            ID: {user.id}, E-post: {user.email}
                        </ListItem>
                    ))}
                </VStack>
            </List>
        </Flex>
    );
};

export default FetchUsers;
