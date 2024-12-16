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
    Grid,
    GridItem,
    Box,
    useBreakpointValue,
    useToast,
} from '@chakra-ui/react';

const Register = ({ isOpen, onClose }) => {
    const modalSize = useBreakpointValue({ base: "full", lg: "3xl" }); // Wide modal for large screens
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Vårdnadshavare');
    const [error, setError] = useState('');
    const [address, setAddress] = useState('');
    const [postcode, setPostcode] = useState('');
    const [city, setCity] = useState('');
    const toast = useToast(); // Initialize useToast

    const handleRegister = (e) => {
        e.preventDefault();

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name, last_name, email, password, phone, role, address, city, postcode }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    // Användare skapad - toast
                    toast({
                        title: data.message,
                        description: 'Den nya användaren har registrerats och väntar på godkännande.', 
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom', // Toast längst ner
                    });

                    // Reset form och stäng modal
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPassword('');
                    setPhone('');
                    setRole('Vårdnadshavare');
                    setAddress('');
                    setCity('');
                    setPostcode('');
                    setError('');
                    onClose();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setError('Ett oväntat fel inträffade. Försök igen.');
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size={modalSize}>
            <ModalOverlay />
            <ModalContent
                mt={{ base: 32, md: 28, lg: 10 }}
            >
                <ModalHeader
                    mt={{ base: 32, md: 28, lg: 0 }}
                >
                    Registrera användare
                </ModalHeader>
                <ModalCloseButton
                    mt={{ base: 32, md: 28, lg: 0 }}
                />
                <ModalBody>
                    <Box width="full" p={4}>
                        <form onSubmit={handleRegister}>
                            <Grid
                                templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} // Single column on small screens, two columns on large
                                gap={4}
                            >
                                {/* Left Column */}
                                <GridItem>
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
                                </GridItem>

                                {/* Right Column */}
                                <GridItem>
                                    <FormControl isRequired>
                                        <FormLabel>Telefonnummer:</FormLabel>
                                        <Input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            bg="white"
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Address:</FormLabel>
                                        <Input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            bg="white"
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Postnummer:</FormLabel>
                                        <Input
                                            type="text"
                                            value={postcode}
                                            onChange={(e) => setPostcode(e.target.value)}
                                            required
                                            bg="white"
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Stad:</FormLabel>
                                        <Input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                            bg="white"
                                        />
                                    </FormControl>
                                </GridItem>
                            </Grid>

                            <FormControl mt={4} isRequired>
                                <FormLabel>Roll:</FormLabel>
                                <RadioGroup onChange={setRole} value={role} colorScheme="brand">
                                    <Stack direction="row">
                                        <Radio value="Vårdnadshavare">Vårdnadshavare</Radio>
                                        <Radio value="Ledare">Ledare</Radio>
                                    </Stack>
                                </RadioGroup>
                            </FormControl>

                            <Button mt={4} type="submit" colorScheme="brand" width="full">
                                Registrera
                            </Button>
                            {error && <Alert status="error" mt={4}>{error}</Alert>}
                        </form>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Register;
