import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  VStack,
  HStack,
  Icon,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Collapse,
} from '@chakra-ui/react';
import { FaCar, FaUserCircle } from 'react-icons/fa';



const DashBoardParent = ({ token }) => {
  const [userName, setUserName] = useState(''); // State för användarnamn
  const [activities, setActivities] = useState([]); // State för aktiviteter
  const [loading, setLoading] = useState(true); // State för att hantera laddningsstatus
  const [error, setError] = useState(null); // State för att hantera fel
  const [openDescriptionIndex, setOpenDescriptionIndex] = useState(null); // För att hålla koll på vilken beskrivning som är öppen
  const [carpoolingOptions, setCarpoolingOptions] = useState([
    { id: 1, date: '2024-10-20', from: 'Jonstorp', to: 'Skogsdungen', spots: 2, joined: false },
    { id: 2, date: '2024-11-05', from: 'Jonstorp', to: 'Scoutstugan', spots: 3, joined: false },
  ]);
  const [showCarForm, setShowCarForm] = useState(false); // Visa eller dölj formuläret
  const [newCar, setNewCar] = useState({ date: '', from: '', to: '', spots: '' });

  // Hämta användarnamn från en säker källa när komponenten laddas
  useEffect(() => {
    const name = "Användare"; // Placeholder, använd en säker källa här
    setUserName(name);
  }, []);

  // Hämta aktiviteter från API när komponenten laddas
  useEffect(() => {

    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/protected/activity/all', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Använd token från prop
          },
        });

        if (!response.ok) {
          throw new Error('Något gick fel vid hämtning av aktiviteter');
        }

        const data = await response.json();
        
        const currentDate = new Date(); // Dagens datum
        
        // Filtrera ut aktiviteter där startdatumet är i det förflutna
        const upcomingActivities = data.events
          .filter(activity => new Date(activity.dtstart) > currentDate) // Bara kommande aktiviteter
          .sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart)) // Sortera efter startdatum
          .slice(0, 10); // Visa de 10 närmsta

        setActivities(upcomingActivities); // Sätt de 10 närmsta aktiviteterna i state
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchActivities(); // Kör hämtning av aktiviteter
  }, [token]); // Lägg till token som en beroende så att det uppdateras när token ändras

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/protected/user', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
          const data = await response.json();
          const user = data.user;

          setUserName(user.first_name + ' ' + user.last_name)

        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []); // Tom array ser till att det bara körs när komponenten mountas

  const toggleDescription = (index) => {
    setOpenDescriptionIndex(openDescriptionIndex === index ? null : index);
  };

  // Hantera bilregistrering
  const handleCarRegistration = () => {
    const newCarOption = {
      id: Date.now(), // Generera unikt id
      ...newCar,
      spots: parseInt(newCar.spots), // Konvertera antalet platser till ett nummer
      joined: false, // Initialt har ingen anmält sig
    };
    setCarpoolingOptions([...carpoolingOptions, newCarOption]);
    setNewCar({ date: '', from: '', to: '', spots: '' }); // Nollställ formuläret efter registrering
    setShowCarForm(false); // Dölj formuläret efter registrering
  };

  // Hantera anmälning eller avanmäling till samåkning
  const handleJoinCarpool = (id) => {
    setCarpoolingOptions(
      carpoolingOptions.map((option) =>
        option.id === id
          ? option.joined
            ? { ...option, spots: option.spots + 1, joined: false } // Avanmäl
            : { ...option, spots: option.spots - 1, joined: true }  // Anmäl
          : option
      )
    );
  };

  if (loading) {
    return <Text>Laddar aktiviteter...</Text>;
  }

  if (error) {
    return <Text>Fel vid hämtning av aktiviteter: {error}</Text>;
  }

  return (
    <Box p={5}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5}>
        <HStack>
          <Icon as={FaUserCircle} w={8} h={8} color="brand.500" />
          <Heading as="h1" size="lg" color="brand.500">Välkommen, {userName}</Heading>
        </HStack>
      </Flex>

      {/* Välkomstmeddelande */}
      <Box mb={6}>
        <Text fontSize="lg" color="brand.600">
          Hej {userName}, här är din översikt för kommande aktiviteter och samåkningsmöjligheter.
        </Text>
      </Box>

      <Divider mb={6} />

      {/* Kommande aktiviteter */}
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Kommande Aktiviteter (Nästa 10)
        </Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Datum & Tid</Th>
              <Th>Plats</Th>
              <Th>Beskrivning</Th>
              <Th>Samåkning</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities.map((activity, index) => (
              <React.Fragment key={index}>
                <Tr>
                  <Td>{new Date(activity.dtstart).toLocaleDateString()} {new Date(activity.dtstart).toLocaleTimeString()}</Td>
                  <Td>{activity.location}</Td>
                  <Td>
                    <Button size="sm" onClick={() => toggleDescription(index)}>
                      {openDescriptionIndex === index ? 'Dölj Beskrivning' : 'Visa Beskrivning'}
                    </Button>
                  </Td>
                  <Td>
                    <Button colorScheme="brand" size="sm">
                      Samåkning
                    </Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={4}>
                    <Collapse in={openDescriptionIndex === index} animateOpacity>
                      <Box p={4} color="gray.600" borderWidth="1px" borderRadius="lg">
                        {activity.description}
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Divider mb={6} />

      {/* Samåkning */}
      <Box mb={8}>
        <Heading as="h2" size="md" mb={4} color="brand.500">
          Samåkningsmöjligheter
        </Heading>
        <VStack spacing={4}>
          {carpoolingOptions.map((option, index) => (
            <Box
              key={index}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              w="100%"
              bg="gray.50"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="md" color="brand.600">
                    {option.date}: Från {option.from} till {option.to}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Lediga platser: {option.spots}
                  </Text>
                </Box>
                <Button
                  leftIcon={<FaCar />}
                  colorScheme="brand"
                  size="sm"
                  disabled={option.spots === 0 && !option.joined} // Avanmäl endast om man redan har anmält sig
                  onClick={() => handleJoinCarpool(option.id)}
                >
                  {option.joined ? 'Avanmäl' : 'Anmäl'}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Divider mb={6} />

      {/* Knapp för att visa formuläret för att registrera ny bil */}
      <Box mb={8}>
        <Button colorScheme="brand" onClick={() => setShowCarForm(!showCarForm)}>
          {showCarForm ? 'Dölj' : 'Registrera bil för samåkning'}
        </Button>
        <Collapse in={showCarForm} animateOpacity>
          <Box mt={4}>
            <Heading as="h2" size="md" mb={4} color="brand.500">
              Registrera bil för samåkning
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl id="date">
                <FormLabel>Datum</FormLabel>
                <Input
                  type="date"
                  value={newCar.date}
                  onChange={(e) => setNewCar({ ...newCar, date: e.target.value })}
                />
              </FormControl>
              <FormControl id="from">
                <FormLabel>Från</FormLabel>
                <Input
                  placeholder="Utgångspunkt"
                  value={newCar.from}
                  onChange={(e) => setNewCar({ ...newCar, from: e.target.value })}
                />
              </FormControl>
              <FormControl id="to">
                <FormLabel>Till</FormLabel>
                <Input
                  placeholder="Destination"
                  value={newCar.to}
                  onChange={(e) => setNewCar({ ...newCar, to: e.target.value })}
                />
              </FormControl>
              <FormControl id="spots">
                <FormLabel>Platser</FormLabel>
                <NumberInput min={1} value={newCar.spots} onChange={(value) => setNewCar({ ...newCar, spots: value })}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <Button colorScheme="brand" onClick={handleCarRegistration}>
                Registrera bil
              </Button>
            </VStack>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default DashBoardParent;
