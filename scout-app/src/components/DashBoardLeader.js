import React, { useState } from 'react';
import { Box, Grid, GridItem, Text, Heading, Flex, Button, VStack, Collapse, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';

const Dashboard = () => {
    // State för aktiviteter
    const [activities, setActivities] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activityName, setActivityName] = useState('');
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [postcode, setPostcode] = useState('');
    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');
    const [svenskaLagLink, setSvenskaLagLink] = useState(''); // Ändrat till svenska benämningen
    const [editingIndex, setEditingIndex] = useState(null); // Index för att hålla reda på vilken aktivitet som redigeras

    const handleAddActivity = () => {
        const newActivity = {
            name: activityName,
            location,
            address,
            postcode,
            city,
            description,
            svenskaLagLink,
        };

        // Om vi redigerar en aktivitet, uppdatera den istället
        if (editingIndex !== null) {
            const updatedActivities = activities.map((activity, index) =>
                index === editingIndex ? newActivity : activity
            );
            setActivities(updatedActivities);
            setEditingIndex(null); // Nollställ index
        } else {
            // Lägg till den nya aktiviteten i state
            setActivities([...activities, newActivity]);
        }

        // Rensa fälten efter att aktiviteten har lagts till eller uppdaterats
        clearFields();
    };

    const clearFields = () => {
        setActivityName('');
        setLocation('');
        setAddress('');
        setPostcode('');
        setCity('');
        setDescription('');
        setSvenskaLagLink(''); // Ändrat till svenska benämningen
        setIsOpen(false); // Stäng fliken efter att aktiviteten har lagts till eller uppdaterats
    };

    const handleEditActivity = (index) => {
        const activityToEdit = activities[index];
        setActivityName(activityToEdit.name);
        setLocation(activityToEdit.location);
        setAddress(activityToEdit.address);
        setPostcode(activityToEdit.postcode);
        setCity(activityToEdit.city);
        setDescription(activityToEdit.description);
        setSvenskaLagLink(activityToEdit.svenskaLagLink); // Ändrat till svenska benämningen
        setEditingIndex(index); // Sätt index för redigering
        setIsOpen(true); // Öppna formuläret för redigering
    };

    return (
        <Flex direction="column" align="center" justify="center" p={8}>
            {/* Rubrik */}
            <Heading as="h1" size="xl" mb={8} color="brand.500">
                Dashboard för ledare
            </Heading>

            {/* Sektion för att skapa aktivitet */}
            <Button 
                onClick={() => setIsOpen(!isOpen)} 
                colorScheme="brand" 
                mb={4}
            >
                Skapa aktivitet
            </Button>

            <Collapse in={isOpen}>
                <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md" bg="white">
                    <FormControl mb={4}>
                        <FormLabel>Namn på aktivitet</FormLabel>
                        <Input 
                            value={activityName} 
                            onChange={(e) => setActivityName(e.target.value)} 
                            placeholder="Namn på aktivitet" 
                        />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Plats</FormLabel>
                        <Input 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            placeholder="Plats" 
                        />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Adress</FormLabel>
                        <Input 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            placeholder="Adress" 
                        />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Postnummer</FormLabel>
                        <Input 
                            value={postcode} 
                            onChange={(e) => setPostcode(e.target.value)} 
                            placeholder="Postnummer" 
                        />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Ort</FormLabel>
                        <Input 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            placeholder="Ort" 
                        />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Beskrivning av aktivitet</FormLabel>
                        <Textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="Beskrivning av aktiviteten" 
                        />
                    </FormControl>
                    <FormControl mb={4}>
                        <FormLabel>Länk till Svenska lag</FormLabel>
                        <Input 
                            value={svenskaLagLink} 
                            onChange={(e) => setSvenskaLagLink(e.target.value)} // Ändrat till svenska benämningen
                            placeholder="URL till Svenska lag" 
                        />
                    </FormControl>
                    <Button 
                        colorScheme="brand" 
                        onClick={handleAddActivity}
                    >
                        {editingIndex !== null ? 'Uppdatera aktivitet' : 'Spara aktivitet'}
                    </Button>
                </Box>
            </Collapse>

            {/* Lista med skapade aktiviteter */}
            <Grid 
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
                gap={6}
                width="100%"
                maxW="1200px"
                mt={8}
            >
                {activities.map((activity, index) => (
                    <GridItem key={index} w="100%">
                        <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
                            <Heading as="h3" size="lg" mb={4} color="brand.600">{activity.name}</Heading>
                            <Text fontSize="md" color="brand.500"><strong>Plats:</strong> {activity.location}</Text>
                            <Text fontSize="md" color="brand.500"><strong>Adress:</strong> {activity.address}, {activity.postcode}, {activity.city}</Text>
                            <Text fontSize="md" color="brand.500"><strong>Beskrivning:</strong> {activity.description}</Text>
                            <Text fontSize="md" color="brand.500"><strong>Länk till Svenska lag:</strong> <a href={activity.svenskaLagLink} target="_blank" rel="noopener noreferrer">{activity.svenskaLagLink}</a></Text>
                            <Button colorScheme="blue" mt={4} onClick={() => handleEditActivity(index)}>
                                Redigera
                            </Button>
                        </Box>
                    </GridItem>
                ))}
            </Grid>

            {/* Huvudsektion med översikt */}
            <Grid 
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
                gap={6}
                width="100%"
                maxW="1200px"
                mt={8}
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
        </Flex>
    );
};

export default Dashboard;
