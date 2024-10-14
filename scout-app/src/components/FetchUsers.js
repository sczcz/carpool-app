import React, { useState } from 'react';
import { Box, Button, Text, List, ListItem } from '@chakra-ui/react';

const apiURL = "/api/users"

const FetchUsers = () => {
    const [users, setUsers] = useState([]);

    const handleFetchUsers = () => {
        fetch(apiURL)
        .then(response => response.json())
        .then(data => setUsers(data))
        .catch(error => console.error('Error:', error));
    };

    return (
        <Box width="400px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="lg">
            <Text fontSize="2xl" mb={4}>Hämta alla användare</Text>
            <Button onClick={handleFetchUsers} colorScheme="teal" mb={4}>Hämta användare</Button>
            <List spacing={3}>
                {users.map(user => (
                    <ListItem key={user.id}>
                        ID: {user.id}, E-post: {user.email}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default FetchUsers;
