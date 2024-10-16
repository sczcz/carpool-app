import React, { useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Flex,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Collapse,
  Select,
  HStack,
} from '@chakra-ui/react';

const Dashboard = () => {
  // Hanterar visning av aktivitetsskaparen
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);

  // Statisk lista över sparade aktiviteter
  const [activities, setActivities] = useState([]);

  // Formulärfält för ny aktivitet
  const [activityName, setActivityName] = useState('');
  const [activityLocation, setActivityLocation] = useState('');
  const [activityAddress, setActivityAddress] = useState('');
  const [activityPostcode, setActivityPostcode] = useState('');
  const [activityCity, setActivityCity] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [svenskaLagLink, setSvenskaLagLink] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [activityTime, setActivityTime] = useState('');
  const [activityRole, setActivityRole] = useState('Spårare'); // Nytt rollval

  // Hanterar redigering av aktivitet
  const [editingActivity, setEditingActivity] = useState(null);

  // Lägger till eller uppdaterar en aktivitet
  const handleSaveActivity = () => {
    const newActivity = {
      id: editingActivity ? editingActivity.id : Date.now(), // Använd unikt id
      name: activityName,
      location: activityLocation,
      address: activityAddress,
      postcode: activityPostcode,
      city: activityCity,
      description: activityDescription,
      svenskaLagLink,
      date: activityDate,
      time: activityTime,
      role: activityRole, // Lägger till roll
    };

    if (editingActivity) {
      setActivities(
        activities.map((activity) =>
          activity.id === editingActivity.id ? newActivity : activity
        )
      );
    } else {
      setActivities([...activities, newActivity]);
    }

    // Återställ formulär och redigeringsläge
    resetForm();
  };

  // Hanterar redigering
  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityName(activity.name);
    setActivityLocation(activity.location);
    setActivityAddress(activity.address);
    setActivityPostcode(activity.postcode);
    setActivityCity(activity.city);
    setActivityDescription(activity.description);
    setSvenskaLagLink(activity.svenskaLagLink);
    setActivityDate(activity.date);
    setActivityTime(activity.time);
    setActivityRole(activity.role);
    setIsActivityFormOpen(true); // Öppna formuläret för redigering
  };

  // Återställer formuläret efter sparning eller avbrytande
  const resetForm = () => {
    setActivityName('');
    setActivityLocation('');
    setActivityAddress('');
    setActivityPostcode('');
    setActivityCity('');
    setActivityDescription('');
    setSvenskaLagLink('');
    setActivityDate('');
    setActivityTime('');
    setActivityRole('Spårare');
    setEditingActivity(null);
    setIsActivityFormOpen(false);
  };

  return (
    <Flex direction="column" align="center" justify="center" p={8}>
      {/* Rubrik */}
      <Heading as="h1" size="xl" mb={8} color="brand.500">
        Dashboard för ledare
      </Heading>

      {/* Huvudsektion med översikt */}
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={6}
        width="100%"
        maxW="1200px"
      >
        {/* Statistik kort */}
        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Användare
            </Heading>
            <Text fontSize="xl" color="brand.500">
              Totalt: 123
            </Text>
            <Text fontSize="md" color="brand.400">
              Aktiva användare: 89
            </Text>
          </Box>
        </GridItem>

        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Notifikationer
            </Heading>
            <Text fontSize="xl" color="brand.500">
              Nya notifikationer: 5
            </Text>
            <Text fontSize="md" color="brand.400">
              Olästa: 3
            </Text>
          </Box>
        </GridItem>

        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Transporter
            </Heading>
            <Text fontSize="xl" color="brand.500">
              Samåkningar: 12
            </Text>
            <Text fontSize="md" color="brand.400">
              Kommande transporter: 4
            </Text>
          </Box>
        </GridItem>

        {/* Aktivitetssektionen */}
        <GridItem w="100%">
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Aktiviteter
            </Heading>
            {activities.length === 0 ? (
              <Text fontSize="md" color="brand.400">
                Inga aktiviteter skapade än.
              </Text>
            ) : (
              activities.map((activity) => (
                <Box key={activity.id} bg="white" p={4} mt={4} borderRadius="md" boxShadow="sm">
                  <Text fontSize="lg" fontWeight="bold" color="brand.600">
                    {activity.name}
                  </Text>
                  <Text fontSize="md" color="brand.500">
                    Plats: {activity.location}, {activity.address}, {activity.postcode}, {activity.city}
                  </Text>
                  <Text fontSize="md" color="brand.500">
                    Datum: {activity.date}, Tid: {activity.time}
                  </Text>
                  <Text fontSize="md" color="brand.500"> {/* Här behöver kopplas till databasen för att visa rätt roll, eller? */}
                    Roll: {activity.role}
                  </Text>
                  <Text fontSize="md" color="brand.500">
                    Beskrivning: {activity.description}
                  </Text>
                  <Text fontSize="md" color="brand.500">
                    Svenska Lag URL: <a href={activity.svenskaLagLink} target="_blank" rel="noopener noreferrer">{activity.svenskaLagLink}</a>
                  </Text>
                  <Button mt={2} size="sm" colorScheme="blue" onClick={() => handleEditActivity(activity)}>
                    Redigera
                  </Button>
                </Box>
              ))
            )}
          </Box>
        </GridItem>
      </Grid>

      {/* Sektion för att skapa ny aktivitet */}
      <VStack spacing={4} mt={8} width="100%" maxW="600px">
        <Button width="100%" colorScheme="brand" onClick={() => setIsActivityFormOpen(!isActivityFormOpen)}>
          {isActivityFormOpen ? 'Stäng formulär' : 'Skapa ny aktivitet'}
        </Button>

        <Collapse in={isActivityFormOpen} animateOpacity>
          <Box bg="white" p={6} rounded="md" shadow="md" width="100%">
            <VStack spacing={4} align="start">
              <FormControl>
                <FormLabel>Namn på aktivitet</FormLabel>
                <Input
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Namn på aktivitet"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Plats</FormLabel>
                <Input
                  value={activityLocation}
                  onChange={(e) => setActivityLocation(e.target.value)}
                  placeholder="Plats"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Adress</FormLabel>
                <Input
                  value={activityAddress}
                  onChange={(e) => setActivityAddress(e.target.value)}
                  placeholder="Adress"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Postnummer</FormLabel>
                  <Input
                    value={activityPostcode}
                    onChange={(e) => setActivityPostcode(e.target.value)}
                    placeholder="Postnummer"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Ort</FormLabel>
                  <Input
                    value={activityCity}
                    onChange={(e) => setActivityCity(e.target.value)}
                    placeholder="Ort"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Datum för aktivitet</FormLabel>
                <Input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tid för aktivitet</FormLabel>
                <Input
                  type="time"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Beskrivning av aktivitet</FormLabel>
                <Textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Beskrivning av aktivitet"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Välj roll</FormLabel>
                <Select
                  value={activityRole}
                  onChange={(e) => setActivityRole(e.target.value)}
                >
                  <option value="3">Spårare</option>
                  <option value="4">Upptäckare</option>
                  <option value="5">Äventyrare</option>
                  <option value="6">Utmanare</option>
                  <option value="7">Rövare</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Länk till Svenska Lag</FormLabel>
                <Input
                  value={svenskaLagLink}
                  onChange={(e) => setSvenskaLagLink(e.target.value)}
                  placeholder="Länk till Svenska Lag"
                />
              </FormControl>

              <Button colorScheme="brand" onClick={handleSaveActivity}>
                {editingActivity ? 'Uppdatera aktivitet' : 'Spara aktivitet'}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Avbryt
              </Button>
            </VStack>
          </Box>
        </Collapse>
      </VStack>
    </Flex>
  );
};

export default Dashboard;
