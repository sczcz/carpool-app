import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

const Home = () => {
    return (
        <Box p={5}>
            <Heading as="h2" size="lg" mb={4}>
                Välkommen till Jonstorps Kustscoutkår!
            </Heading>
            <Text fontSize="md" mb={6}>
                Här kan du logga in, registrera dig och få information om våra aktiviteter.
            </Text>
            <Button colorScheme="teal" size="md">
                Kom igång - leder ingenstans än
            </Button>
        </Box>
    );
};

export default Home;
