import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // Importera Link från React Router

const Home = () => {
    return (
        <Box p={5} bg="brand.100" textAlign="center"> {/* Centrera texten */}
            <Heading as="h2" size="lg" mb={4} color="brand.500">
                Välkommen till Jonstorps Kustscoutkår!
            </Heading>
            <Text fontSize="md" mb={6} color="brand.500" maxW="600px" mx="auto">
                Vi erbjuder en innovativ plattform som förenklar samordningen av transporter genom att främja samåkning mellan föräldrar och scouter. Tjänsten gör det enkelt att hitta och erbjuda platser i bilar, vilket minskar onödig körning och klimatpåverkan. Genom att använda vår tjänst kan föräldrar planera resor, scoutledare organisera aktiviteter och scouter få relevant information. Tillsammans kan vi skapa en hållbar och trygg miljö för alla våra medlemmar och göra ett positivt avtryck i scoutäventyret!
            </Text>
            <Button as={Link} to="/register" colorScheme="brand" size="md">
                Klicka här för att registrera dig här
            </Button>
        </Box>
    );
};

export default Home;
