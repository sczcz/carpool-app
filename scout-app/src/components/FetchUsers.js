import React, { useState } from 'react';
import { Button, Text, List, ListItem, Flex, VStack } from '@chakra-ui/react';

const FetchUsers = () => {
    const [users, setUsers] = useState([]);

    const handleFetchUsers = () => {
        fetch('http://127.0.0.1:5000/api/users')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error:', error));
    };

    return (
        <Flex direction="column" align="center" mt={8}>
            <Text fontSize="2xl" mb={4} color="brand.500">Hämta alla användare</Text>
            <Button onClick={handleFetchUsers} colorScheme="brand" mb={4}>
                Hämta användare
            </Button>
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
