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
  Collapse,
  Tag,
  TagLabel
} from '@chakra-ui/react';
import { FaUserCircle } from 'react-icons/fa';

const DashBoardParent = ({ token }) => {
  const [userName, setUserName] = useState(''); // State för användarnamn
  const [activities, setActivities] = useState([]); // State för aktiviteter
  const [loading, setLoading] = useState(true); // State för att hantera laddningsstatus
  const [error, setError] = useState(null); // State för att hantera fel
  const [openDescriptionIndex, setOpenDescriptionIndex] = useState(null); // För att hålla koll på vilken beskrivning som är öppen

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

          setUserName(user.first_name + ' ' + user.last_name);

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

  const handleCarpoolRedirect = () => {
    // Logik för att hantera redirect till /car-pool
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
          Kommande Aktiviteter
        </Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Scoutlevel</Th>
              <Th>Datum & Tid</Th>
              <Th>Plats</Th>
              <Th>Beskrivning</Th>
              <Th>Samåkning</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activities.map((activity, index) => (
              <React.Fragment key={index}>
                <Tr onClick={() => toggleDescription(index)} style={{ cursor: 'pointer' }}>
                  <Td>
                    <Tag size="lg" colorScheme="teal" borderRadius="full">
                      <TagLabel>{activity.scout_level}</TagLabel>
                    </Tag>
                  </Td>
                  <Td>{new Date(activity.dtstart).toLocaleDateString()} {new Date(activity.dtstart).toLocaleTimeString()}</Td>
                  <Td>{activity.location}</Td>
                  <Td>{activity.summary}</Td>
                  <Td>
                    <Button colorScheme="brand" size="sm" onClick={handleCarpoolRedirect}>
                      Samåkning
                    </Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={5}>
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
    </Box>
  );
};

export default DashBoardParent;
