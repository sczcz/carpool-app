import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Flex,
  Button,
  VStack,
  Collapse,
  Spinner,
  useToast,
  Select
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import useRoleProtection from "../utils/useRoleProtection";

const Dashboard = ({ token }) => {
  useRoleProtection(["admin", "ledare"]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openActivityId, setOpenActivityId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3); // Startar med 3
  const [fetchingCarpools, setFetchingCarpools] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Alla roller'); // Filtrering
  const toast = useToast();

  // Hämta aktiviteter från API när komponenten laddas
  useEffect(() => {
    fetchActivities();
  }, [token]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/protected/activity/all', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Något gick fel vid hämtning av aktiviteter');
      }
  
      const data = await response.json();
      const sortedActivities = data.events
        .map((activity) => ({
          ...activity,
          isVisible: activity.is_visible, // Flagga som backend skickar
        }))
        .sort((a, b) => new Date(a.dtstart) - new Date(b.dtstart));
      setActivities(sortedActivities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const translateCarpoolType = (type) => {
    switch (type) {
      case 'drop-off':
        return 'Avresa';
      case 'pick-up':
        return 'Hemresa';
      case 'both':
        return 'Avresa & Hemresa';
      default:
        return 'Okänd';
    }
  };

  // Funktion för att hämta samåkningar för en specifik aktivitet
  const fetchCarpoolsForActivity = async (activityId) => {
    setFetchingCarpools(true);
    try {
      const response = await fetch(`/api/carpool/list?activity_id=${activityId}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched carpools data:", data.carpools); // Debugging log
        setActivities((prevActivities) =>
          prevActivities.map((activity) => {
            if (activity.activity_id === activityId) {
              return { ...activity, carpools: data.carpools };
            }
            return activity;
          })
        );
      } else {
        throw new Error('Misslyckades med att hämta samåkningar');
      }
    } catch (error) {
      toast({
        title: 'Fel vid hämtning av samåkningar.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFetchingCarpools(false);
    }
  };

  const toggleActivityVisibility = async (activityId, isVisible) => {
    const endpoint = isVisible
      ? `/api/protected/activity/remove/${activityId}`
      : `/api/protected/activity/make_visible/${activityId}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Misslyckades med att uppdatera aktivitetens synlighet');
      }

      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.activity_id === activityId
            ? { ...activity, isVisible: !isVisible }
            : activity
        )
      );

      toast({
        title: `Aktiviteten har nu blivit ${isVisible ? 'synlig' : 'dold'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ett fel uppstod vid ändring av synligheten.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleActivity = (activityId) => {
    setOpenActivityId(openActivityId === activityId ? null : activityId);
    if (openActivityId !== activityId) {
      fetchCarpoolsForActivity(activityId); // Ladda samåkningar när aktivitet öppnas
    }
  };

  const loadMoreActivities = () => {
    setVisibleCount((prevCount) => prevCount + 3); // Ladda tre nya varje gång
  };

  // Filtrering av aktiviteter baserat på scout_level
  const filteredActivities = activities.filter((activity) => {
    if (selectedRole === 'Alla roller') {
      return true; // Visa alla om ingen specifik roll är vald
    }
    return activity.scout_level === selectedRole; // Visa bara aktiviteter som matchar vald roll
  });

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value); // Uppdatera vald roll
    setVisibleCount(3); // Återställ till 3 synliga aktiviteter vid rollbyte
  };

  // Hämta unika roller för dropdown
  const uniqueRoles = [...new Set(activities.map(activity => activity.scout_level))];

  if (loading) {
    return (
      <VStack>
        <Spinner size="xl" color="brand.500" />
        <Text>Laddar aktiviteter...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack>
        <Text color="red.500">Fel vid hämtning av aktiviteter: {error}</Text>
        <Button onClick={() => { setError(null); fetchActivities(); }} colorScheme="blue">Försök igen</Button>
      </VStack>
    );
  }

  return (
    <Flex direction="column" align="center" justify="center" p={8}>
      <Heading as="h1" size="xl" mb={8} color="brand.500">
        Dashboard för ledare
      </Heading>
  
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={6}
        width="100%"
        maxW="1200px"
      > 
        
        <GridItem w="100%" colSpan={{ base: 1, md: 2, lg: 3 }}>
          <Box bg="brand.300" p={6} borderRadius="md" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="brand.600">
              Aktiviteter
            </Heading>
  
            {/* Rollfiltrering */}
            <Select placeholder="Välj roll" onChange={handleRoleChange} mb={6} value={selectedRole}>
              <option value="Alla roller">Alla roller</option>
              {uniqueRoles.map((role, index) => (
                <option key={index} value={role}>{role}</option>
              ))}
            </Select>
  
            {filteredActivities.length === 0 ? (
              <Text fontSize="md" color="brand.400">
                Inga aktiviteter tillgängliga för denna roll.
              </Text>
            ) : (
              <>
              {filteredActivities.slice(0, visibleCount).map((activity) => (
                <Box key={activity.activity_id} bg="white" p={4} mt={4} borderRadius="md" boxShadow="sm">
                  <Text fontSize="lg" fontWeight="bold" color="brand.600">{activity.summary}</Text>
                  <Text fontSize="md" color="brand.500">Plats: {activity.location}</Text>
                  <Text fontSize="md" color="brand.500">Datum: {new Date(activity.dtstart).toLocaleString()}</Text>
                  <Text fontSize="md" color="brand.400">
                    Status: {activity.isVisible ? 'Synlig' : 'Dold'}
                  </Text>

                  <Button
                    mt={2}
                    size="sm"
                    colorScheme="blue"
                    onClick={() => toggleActivity(activity.activity_id)}
                    rightIcon={openActivityId === activity.activity_id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  >
                    {openActivityId === activity.activity_id ? 'Dölj samåkningar' : 'Visa samåkningar'}
                  </Button>

                  <Button
                    mt={2}
                    ml={4}
                    size="sm"
                    colorScheme={activity.isVisible ? 'red' : 'green'}
                    onClick={() => toggleActivityVisibility(activity.activity_id, activity.isVisible)}
                  >
                    {activity.isVisible ? 'Dölj aktivitet för användare' : 'Visa aktivitet för användare'}
                  </Button>

                  <Collapse in={openActivityId === activity.activity_id}>
                    <Box mt={4}>
                      {activity.carpools ? (
                        activity.carpools.length > 0 ? (
                          activity.carpools.map((carpool) => (
                            <Box key={carpool.id} p={3} bg="gray.100" mb={2} borderRadius="md">
                              <Text fontWeight="bold" color="brand.600">
                                Avresa från: {carpool.departure_address || "Ingen adress tillgänglig"}, {carpool.departure_city || "Ingen stad tillgänglig"}
                              </Text>
                              <Text>Typ av samåkning: {translateCarpoolType(carpool?.carpool_type) || 'N/A'}</Text>
                              <Text>Tillgängliga platser: {carpool.available_seats || 0}</Text>
                              <Box mt={2}>
                                <Text fontWeight="bold">Passagerare:</Text>
                                {carpool.passengers && carpool.passengers.length > 0 ? (
                                  carpool.passengers.map((passenger, index) => (
                                    <Box key={index} ml={4} mt={1}>
                                      <Text fontWeight="bold">
                                        Namn:{" "}
                                        {passenger.type === "user"
                                          ? passenger.name || "Okänd användare"
                                          : passenger.name || "Okänt barn"}
                                      </Text>
                                      <Text>Telefon: {passenger.phone || "Ingen telefon tillgänglig"}</Text>

                                      {passenger.type === "child" && passenger.parents?.length > 0 && (
                                        <Box mt={2} pl={4}>
                                          <Text fontSize="sm" fontWeight="bold" color="gray.600">
                                            Vårdnadshavare:
                                          </Text>
                                          {passenger.parents.map((parent, idx) => (
                                            <Text key={idx} fontSize="sm" color="gray.500" ml={2}>
                                              {parent.parent_name || "Okänd"} - {parent.parent_phone || "Ingen telefon"}
                                            </Text>
                                          ))}
                                        </Box>
                                      )}
                                    </Box>
                                  ))
                                ) : (
                                  <Text>Inga passagerare</Text>
                                )}
                              </Box>
                            </Box>
                          ))
                        ) : (
                          <Text>Inga tillgängliga samåkningar.</Text>
                        )
                      ) : (
                        <Text>Laddar samåkningar...</Text>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}

  
                {visibleCount < filteredActivities.length && (
                  <Button mt={6} onClick={loadMoreActivities} colorScheme="teal">
                    Ladda fler
                  </Button>
                )}
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Flex>
  );

 
};

export default Dashboard;

