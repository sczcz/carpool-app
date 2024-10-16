import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, FormControl, FormLabel, Input, Box, Text, useBreakpointValue, VStack } from '@chakra-ui/react';

const apiURL = "/api/login";

const Login = ({ isOpen, onClose }) => {
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
            credentials: 'include', // Ensures cookies are sent with the request
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
                onClose();  // Close the modal upon successful login
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setError('Något gick fel, försök igen.');
        });
    };

    const modalSize = useBreakpointValue({ base: "full", sm: "md" });  // Modal adapts based on screen size
    const paddingX = useBreakpointValue({ base: "4", md: "8" });  // Adjust padding

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Logga in</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box width="full" px={paddingX}>
                        <form onSubmit={handleLogin}>
                            <VStack spacing={4} align="stretch">
                                <FormControl id="email" isRequired>
                                    <FormLabel>E-post:</FormLabel>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        bg="white"
                                    />
                                </FormControl>
                                <FormControl id="password" isRequired>
                                    <FormLabel>Lösenord:</FormLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        bg="white"
                                    />
                                </FormControl>
                                {error && <Text color="red.500">{error}</Text>}
                            </VStack>
                        </form>
                    </Box>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="brand" width="full" onClick={handleLogin}>
                        Logga in
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default Login;
