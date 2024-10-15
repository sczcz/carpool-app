import React from 'react';
import { Box, Grid, GridItem, Text, Heading, Flex, Button, VStack } from '@chakra-ui/react';

const Dashboard = () => {
    return (
        <Flex direction="column" align="center" justify="center" p={8}>

            {/* Rubrik */}
            <Heading as="h1" size="xl" mb={8} color="brand.500">
                Dashboard för ledare
            </Heading>

            {/* Huvudsektion med översikt */}
            <Grid 
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
                gap={6}
                width="100%"
                maxW="1200px"
            >

                {/* Statistik kort */}
                <GridItem w="100%">
                    <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
                        <Heading as="h3" size="lg" mb={4} color="brand.600">Användare</Heading>
                        <Text fontSize="xl" color="brand.500">Totalt: 123</Text>
                        <Text fontSize="md" color="brand.400">Aktiva användare: 89</Text>
                    </Box>
                </GridItem>

                <GridItem w="100%">
                    <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
                        <Heading as="h3" size="lg" mb={4} color="brand.600">Notifikationer</Heading>
                        <Text fontSize="xl" color="brand.500">Nya notifikationer: 5</Text>
                        <Text fontSize="md" color="brand.400">Olästa: 3</Text>
                    </Box>
                </GridItem>

                <GridItem w="100%">
                    <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
                        <Heading as="h3" size="lg" mb={4} color="brand.600">Transporter</Heading>
                        <Text fontSize="xl" color="brand.500">Samåkningar: 12</Text>
                        <Text fontSize="md" color="brand.400">Kommande transporter: 4</Text>
                    </Box>
                </GridItem>

            </Grid>

            {/* Sektion för länkar till andra funktioner */}
            <VStack spacing={4} mt={8} width="100%" maxW="600px">
                <Button width="100%" colorScheme="brand" onClick={() => alert('Navigera till användarhantering')}>
                    Hantera användare
                </Button>
                <Button width="100%" colorScheme="brand" onClick={() => alert('Navigera till samåkning')}>
                    Hantera transporter
                </Button>
                <Button width="100%" colorScheme="brand" onClick={() => alert('Navigera till notifikationer')}>
                    Visa notifikationer
                </Button>
            </VStack>

        </Flex>
    );
};

export default Dashboard;
