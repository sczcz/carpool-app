import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Button,
    FormControl,
    FormLabel,
    Input,
    Alert,
    RadioGroup,
    Radio,
    Stack,
    useBreakpointValue,
    VStack,
    Box,
} from '@chakra-ui/react';

const Register = ({ isOpen, onClose }) => {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');  // Nytt state för telefonnummer
    const [role, setRole] = useState('Vårdnadshavare');
    const [error, setError] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name, last_name, email, password, phone, role })  // Inkludera phone i request body
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                alert(data.message);
                // Clear fields after successful registration
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setPhone('');  
                setRole('Vårdnadshavare');
                setError('');
                onClose(); // Close the modal upon successful registration
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const modalSize = useBreakpointValue({ base: "full", sm: "md" });
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Registrera användare</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box width="full" p={4}>
                        <form onSubmit={handleRegister}>
                            <VStack spacing={4} align="stretch">
                                {/* Förnamn */}
                                <FormControl isRequired>
                                    <FormLabel>Förnamn:</FormLabel>
                                    <Input 
                                        type="text" 
                                        value={first_name} 
                                        onChange={(e) => setFirstName(e.target.value)} 
                                        required 
                                        bg="white"
                                    />
                                </FormControl>
                                
                                {/* Efternamn */}
                                <FormControl isRequired>
                                    <FormLabel>Efternamn:</FormLabel>
                                    <Input 
                                        type="text" 
                                        value={last_name} 
                                        onChange={(e) => setLastName(e.target.value)} 
                                        required 
                                        bg="white"
                                    />
                                </FormControl>

                                {/* E-post */}
                                <FormControl isRequired>
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
                                <FormControl isRequired>
                                    <FormLabel>Lösenord:</FormLabel>
                                    <Input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required 
                                        bg="white"
                                    />
                                </FormControl>

                                {/* Telefon */}
                                <FormControl isRequired>  {/* Telefonnummer */}
                                    <FormLabel>Telefonnummer:</FormLabel>
                                    <Input 
                                        type="tel" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        required 
                                        bg="white"
                                    />
                                </FormControl>

                                {/* Roll (Vårdnadshavare/Ledare) */}
                                <FormControl isRequired>
                                    <FormLabel>Roll:</FormLabel>
                                    <RadioGroup onChange={setRole} value={role} colorScheme="brand">
                                        <Stack direction="row">
                                            <Radio value="Vårdnadshavare">Vårdnadshavare</Radio>
                                            <Radio value="Ledare">Ledare</Radio>
                                        </Stack>
                                    </RadioGroup>
                                </FormControl>
                                
                                <Button type="submit" colorScheme="brand" width="full" onClick={handleRegister}>
                                    Registrera
                                </Button>
                                {error && <Alert status="error" mt={4}>{error}</Alert>} {/* Error message below the button */}
                            </VStack>
                        </form>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Register;
